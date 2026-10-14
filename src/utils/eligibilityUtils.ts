// ============================================================
// Eligibility Matching Logic
// ============================================================
//
// NOTE: Eligibility matching here is based solely on
// educational qualification. Age, nationality, physical
// standards, subject combinations, and other requirements
// are NOT evaluated. Never present this as full eligibility.
// ============================================================

import type { Job, EducationFilter, EligibilityInfo, EligibilityResult } from '../types/job';

// Maps a filter level to all qualification levels that meet or exceed it
const QUALIFICATION_HIERARCHY: EducationFilter[] = [
  '10th',
  'iti_diploma',
  '12th_general',
  '12th_pcm',
  'graduate',
];

/** Does the selected education meet the job's minimum qualification? */
export function matchEligibility(
  job: Job,
  selectedEducation: EducationFilter[],
): EligibilityInfo {
  if (selectedEducation.length === 0) {
    return {
      result: 'no_data',
      reason: 'Select an education filter to see eligibility match.',
    };
  }

  const jobLevels = new Set(job.minQualification);
  const userLevels = new Set(selectedEducation);

  // Check if any user-selected level is in the job's accepted list
  let hasMatch = false;
  for (const level of userLevels) {
    if (jobLevels.has(level)) {
      hasMatch = true;
      break;
    }
  }

  if (hasMatch) {
    return {
      result: 'match',
      reason:
        'Your selected education qualification meets the minimum requirement for this recruitment. ' +
        'Other conditions (age, subject combination, physical standards, etc.) also apply.',
    };
  }

  // Check if user's qualification is higher than required (still eligible for lower-req jobs)
  const userMaxIndex = Math.max(
    ...selectedEducation.map((e) => QUALIFICATION_HIERARCHY.indexOf(e)),
  );
  const jobMinIndex = Math.min(
    ...job.minQualification.map((e) => {
      const i = QUALIFICATION_HIERARCHY.indexOf(e);
      return i === -1 ? 99 : i;
    }),
  );

  if (userMaxIndex > jobMinIndex && jobMinIndex !== 99) {
    return {
      result: 'match',
      reason:
        'Your qualification exceeds the minimum requirement. ' +
        'Other conditions (age, subject combination, physical standards, etc.) also apply.',
    };
  }

  // Special case: 12th_pcm satisfies 12th_general requirement
  if (
    selectedEducation.includes('12th_pcm') &&
    (jobLevels.has('12th_general') || jobLevels.has('12th_pcm'))
  ) {
    return {
      result: 'match',
      reason:
        'PCM background meets 12th pass requirement. Verify subject-specific criteria in the notification.',
    };
  }

  return {
    result: 'mismatch',
    reason:
      'Your selected education may not meet the minimum qualification. Review the notification for exact requirements.',
  };
}

export function eligibilityColor(result: EligibilityResult): string {
  switch (result) {
    case 'match':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'partial':
      return 'text-amber-500 dark:text-amber-400';
    case 'mismatch':
      return 'text-red-500 dark:text-red-400';
    case 'no_data':
    default:
      return 'text-slate-400 dark:text-slate-500';
  }
}

export function eligibilityBadgeClass(result: EligibilityResult): string {
  switch (result) {
    case 'match':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700';
    case 'partial':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700';
    case 'mismatch':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-700';
    case 'no_data':
    default:
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

export function eligibilityLabel(result: EligibilityResult): string {
  switch (result) {
    case 'match':
      return '✓ Qualification Match';
    case 'partial':
      return '~ Partial Match';
    case 'mismatch':
      return '✗ Qualification Mismatch';
    case 'no_data':
    default:
      return '? Select Education';
  }
}
