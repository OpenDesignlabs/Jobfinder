// ============================================================
// Gujarat GAD (General Administration Department) Eligibility Engine
// ============================================================
// Implements Gujarat GAD age relaxation rules:
//   - SEBC/SC/ST/EWS Male:    +5 years (capped at 45)
//   - General Female:          +5 years (capped at 45)
//   - SEBC/SC/ST/EWS Female:  +10 years (capped at 45)
//   - PwD / Divyang:           +10 years (additional)
//   - Ex-Serviceman:            +3 years (additional)
// ============================================================

import type {
  Job,
  CandidateProfile,
  GADEligibilityResult,
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

export function getCategoryRelaxationYears(profile: CandidateProfile): number {
  let years = 0;
  if (profile.category === 'RESERVED_M' || profile.category === 'GEN_F') {
    years += 5;
  } else if (profile.category === 'RESERVED_F') {
    years += 10;
  }
  if (profile.isPwd) years += 10;
  if (profile.isExServiceman) years += 3;
  return years;
}

export function evaluateGADEligibility(
  job: Job,
  profile: CandidateProfile,
): GADEligibilityResult {
  const relaxYears = getCategoryRelaxationYears(profile);
  const minAge = job.minAge ?? job.ageLimit.min;
  const maxAgeBase = job.maxAgeBase ?? job.ageLimit.max;
  const effectiveMaxAge = Math.min(45, maxAgeBase + relaxYears);

  const ageMinOk = profile.age >= minAge;
  const ageMaxOk = profile.age <= effectiveMaxAge;
  const usedRelaxation = profile.age > maxAgeBase && ageMaxOk;

  // Education check
  const userEduSet = EDU_ACCEPTED[profile.education] ?? [profile.education];
  const jobEduCodes = job.requiredEdu ?? [];
  const eduOk =
    profile.education === 'ANY' ||
    jobEduCodes.length === 0 ||
    jobEduCodes.some((code) => userEduSet.includes(code));

  if (!ageMinOk || !ageMaxOk) {
    return {
      status: 'INELIGIBLE_AGE',
      isEligible: false,
      effectiveMaxAge,
      relaxYears,
      usedRelaxation: false,
      badgeText: `✕ Age Out of Range (${minAge}–${effectiveMaxAge} yrs)`,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
      reason: `Your age (${profile.age}) is outside the ${minAge}–${effectiveMaxAge} yr limit under Gujarat GAD rules.`,
    };
  }

  if (!eduOk) {
    return {
      status: 'INELIGIBLE_EDU',
      isEligible: false,
      effectiveMaxAge,
      relaxYears,
      usedRelaxation: false,
      badgeText: '⚠ Qualification Mismatch',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
      reason: job.eduSummaryEn
        ? `Requires: ${job.eduSummaryEn.split('.')[0]}.`
        : 'Qualification does not meet requirements for this post.',
    };
  }

  if (usedRelaxation) {
    return {
      status: 'ELIGIBLE_RELAXED',
      isEligible: true,
      effectiveMaxAge,
      relaxYears,
      usedRelaxation: true,
      badgeText: `✓ Eligible via +${relaxYears} Yr GAD Relaxation`,
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
      reason: `Base max age is ${maxAgeBase}, extended to ${effectiveMaxAge} yrs (capped at 45). Valid category/relaxation certificate required.`,
    };
  }

  return {
    status: 'ELIGIBLE',
    isEligible: true,
    effectiveMaxAge,
    relaxYears,
    usedRelaxation: false,
    badgeText: '✓ Eligible (Standard Match)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    reason: `Age ${profile.age} fits ${minAge}–${effectiveMaxAge} yrs; qualification matches.`,
  };
}

export function getProfileSummaryText(profile: CandidateProfile): string {
  const years = getCategoryRelaxationYears(profile);
  if (years === 0) return 'No relaxation (General / Base Age)';
  return `Effective Relaxation: +${years} Yrs`;
}
