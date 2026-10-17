// ============================================================
// Gujarat GAD (General Administration Department) Eligibility Engine
// ============================================================
// Implements three-valued logic per spec §9:
//   PASS | FAIL | UNKNOWN → likely_eligible | likely_ineligible | needs_review
//
// Gujarat GAD age relaxation rules (capped at 45 years total):
//   SEBC/SC/ST/EWS Male:    +5 years
//   General Female:          +5 years
//   SEBC/SC/ST/EWS Female:  +10 years
//   PwD / Divyang:           +10 years (cumulative)
//   Ex-Serviceman:            +3 years (cumulative)
// ============================================================

import type {
  Job,
  CandidateProfile,
  GADEligibilityResult,
  GADEligibilityStatus,
  EligibilityCheck,
  EligibilityOutcome,
  RuleResult,
} from '../types/job';

// Gujarat education codes accepted by each filter
const EDU_ACCEPTED: Record<string, string[]> = {
  ANY: ['HSC', 'GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
  HSC: ['HSC'],
  GRADUATE: ['GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
  TECH_DIPLOMA: ['TECH_DIPLOMA'],
  NURSING: ['NURSING'],
  COMMERCE_PG: ['COMMERCE_PG', 'GRADUATE'],
};

/**
 * Calculate completed years between two dates.
 * Handles birthday-not-yet-reached edge case (spec §9 Step 4).
 */
export function completedYears(birthDate: string, referenceDate: string): number {
  const b = new Date(birthDate);
  const r = new Date(referenceDate);
  let years = r.getFullYear() - b.getFullYear();
  const birthdayNotReached =
    r.getMonth() < b.getMonth() ||
    (r.getMonth() === b.getMonth() && r.getDate() < b.getDate());
  return years - (birthdayNotReached ? 1 : 0);
}

export function getCategoryRelaxationYears(profile: CandidateProfile): number {
  let years = 0;
  if (profile.category === 'RESERVED_M' || profile.category === 'GEN_F') years += 5;
  else if (profile.category === 'RESERVED_F') years += 10;
  if (profile.isPwd) years += 10;
  if (profile.isExServiceman) years += 3;
  return years;
}

// ── Three-valued rule result helpers ─────────────────────────

function makeCheck(rule: EligibilityCheck['rule'], result: RuleResult, reason: string, evidencePage?: number): EligibilityCheck {
  return { rule, result, reason, ...(evidencePage !== undefined ? { evidencePage } : {}) };
}

/**
 * Full three-valued eligibility evaluation (spec §9).
 *
 * Returns:
 *  - outcome:  'likely_eligible' | 'likely_ineligible' | 'needs_review'
 *  - checks:   per-rule results
 *  - badge:    display badge text/class
 */
export function evaluateGADEligibilityV1(
  job: Job,
  profile: CandidateProfile,
): {
  outcome: EligibilityOutcome;
  checks: EligibilityCheck[];
  relaxYears: number;
  effectiveMaxAge: number;
  badgeText: string;
  badgeClass: string;
  message: string;
} {
  const checks: EligibilityCheck[] = [];
  let hasFail = false;
  let hasUnknown = false;

  const minAge = job.minAge ?? job.ageLimit.min;
  const maxAgeBase = job.maxAgeBase ?? job.ageLimit.max;

  // ── Category relaxation check ─────────────────────────────
  const relaxYears = getCategoryRelaxationYears(profile);
  const effectiveMaxAge = Math.min(45, maxAgeBase + relaxYears);

  if (!profile.category) {
    hasUnknown = true;
    checks.push(makeCheck('age_relaxation', 'unknown',
      'Category not provided. Relaxation cannot be confirmed. Base age limit assumed.'));
  }

  // ── Age check ─────────────────────────────────────────────
  if (!profile.dob && !profile.age) {
    hasUnknown = true;
    checks.push(makeCheck('minimum_age', 'unknown', 'Date of birth not provided in profile.'));
    checks.push(makeCheck('maximum_age', 'unknown', 'Date of birth not provided in profile.'));
  } else {
    // Use age reference date from job if available; else use today
    let candidateAge = profile.age;
    if (profile.dob) {
      const refDate = job.ageReferenceDate ||
        (job.ageLimit.referenceDate) ||
        new Date().toISOString().slice(0, 10);
      try {
        candidateAge = completedYears(profile.dob, refDate);
      } catch {
        // keep profile.age as fallback
      }
    }

    if (candidateAge < minAge) {
      hasFail = true;
      checks.push(makeCheck('minimum_age', 'fail',
        `Age ${candidateAge} is below the minimum required age of ${minAge} years.`));
    } else {
      checks.push(makeCheck('minimum_age', 'pass',
        `Age ${candidateAge} meets the minimum age requirement of ${minAge} years.`));
    }

    if (candidateAge > effectiveMaxAge) {
      hasFail = true;
      checks.push(makeCheck('maximum_age', 'fail',
        `Age ${candidateAge} exceeds the effective maximum age of ${effectiveMaxAge} years ` +
        `(base ${maxAgeBase} + ${relaxYears} yrs relaxation, capped at 45).`));
    } else {
      const usedRelaxation = candidateAge > maxAgeBase;
      checks.push(makeCheck('maximum_age', 'pass',
        usedRelaxation
          ? `Age ${candidateAge} qualifies via GAD relaxation (+${relaxYears} yrs, capped at 45). ` +
            `Valid category/relaxation certificate required.`
          : `Age ${candidateAge} is within the base limit of ${maxAgeBase} years.`));
    }
  }

  // ── Education check ───────────────────────────────────────
  const requiredEdu = job.requiredEdu ?? [];
  if (!profile.education || profile.education === '') {
    hasUnknown = true;
    checks.push(makeCheck('minimum_qualification', 'unknown',
      'Education level not specified in your profile.'));
  } else {
    const userEduSet = EDU_ACCEPTED[profile.education] ?? [profile.education];
    const eduOk =
      profile.education === 'ANY' ||
      requiredEdu.length === 0 ||
      requiredEdu.some((code) => userEduSet.includes(code));

    if (!eduOk) {
      hasFail = true;
      checks.push(makeCheck('minimum_qualification', 'fail',
        job.eduSummaryEn
          ? `Requires: ${job.eduSummaryEn.split('.')[0]}.`
          : `Education (${profile.education}) does not meet the requirement for this post.`));
    } else {
      checks.push(makeCheck('minimum_qualification', 'pass',
        `Your education (${profile.education}) satisfies the requirement.`));
    }
  }

  // ── Manual review exception ───────────────────────────────
  if (job.manualReviewException) {
    hasUnknown = true;
    checks.push(makeCheck('category_condition', 'unknown',
      `Manual review required: ${job.manualReviewException}`));
  }

  // ── Determine outcome ─────────────────────────────────────
  let outcome: EligibilityOutcome;
  if (hasFail) outcome = 'likely_ineligible';
  else if (hasUnknown) outcome = 'needs_review';
  else outcome = 'likely_eligible';

  // ── Badge text & class ────────────────────────────────────
  let badgeText: string;
  let badgeClass: string;
  let message: string;

  if (outcome === 'likely_eligible') {
    if (checks.some(c => c.rule === 'maximum_age' && c.result === 'pass' && c.reason.includes('relaxation'))) {
      badgeText = `✓ Eligible via +${relaxYears} Yr GAD Relaxation`;
      badgeClass = 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700';
    } else {
      badgeText = '✓ Eligible (Standard Match)';
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
    }
    message = 'All checked rules pass. Subject to official verification.';
  } else if (outcome === 'likely_ineligible') {
    const ageFail = checks.find(c => (c.rule === 'minimum_age' || c.rule === 'maximum_age') && c.result === 'fail');
    const eduFail = checks.find(c => c.rule === 'minimum_qualification' && c.result === 'fail');
    badgeText = ageFail ? `✕ Age Out of Range (${minAge}–${effectiveMaxAge} yrs)` : '⚠ Qualification Mismatch';
    badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
    message = ageFail?.reason ?? eduFail?.reason ?? 'One or more required rules clearly fail.';
  } else {
    // needs_review
    badgeText = '? Eligibility Uncertain – Review Required';
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
    message = 'Eligibility could not be fully determined. Some information is missing or requires official review.';
  }

  return { outcome, checks, relaxYears, effectiveMaxAge, badgeText, badgeClass, message };
}

/**
 * Backward-compatible wrapper that maps three-valued result to GADEligibilityResult.
 * isEligible is true for both ELIGIBLE and ELIGIBLE_RELAXED, false for INELIGIBLE_*, null-ish for NEEDS_REVIEW.
 */
export function evaluateGADEligibility(
  job: Job,
  profile: CandidateProfile,
): GADEligibilityResult {
  const v1 = evaluateGADEligibilityV1(job, profile);

  let status: GADEligibilityStatus;
  let usedRelaxation = false;

  if (v1.outcome === 'likely_eligible') {
    usedRelaxation = v1.checks.some(c => c.rule === 'maximum_age' && c.result === 'pass' && c.reason.includes('relaxation'));
    status = usedRelaxation ? 'ELIGIBLE_RELAXED' : 'ELIGIBLE';
  } else if (v1.outcome === 'likely_ineligible') {
    const ageFail = v1.checks.find(c => (c.rule === 'minimum_age' || c.rule === 'maximum_age') && c.result === 'fail');
    status = ageFail ? 'INELIGIBLE_AGE' : 'INELIGIBLE_EDU';
  } else {
    status = 'NEEDS_REVIEW';
  }

  return {
    status,
    isEligible: v1.outcome === 'likely_eligible',
    effectiveMaxAge: v1.effectiveMaxAge,
    relaxYears: v1.relaxYears,
    usedRelaxation,
    badgeText: v1.badgeText,
    badgeClass: v1.badgeClass,
    reason: v1.message,
    outcome: v1.outcome,
    checks: v1.checks,
  };
}

export function getProfileSummaryText(profile: CandidateProfile): string {
  const years = getCategoryRelaxationYears(profile);
  if (years === 0) return 'No relaxation (General / Base Age)';
  return `Effective Relaxation: +${years} Yrs`;
}
