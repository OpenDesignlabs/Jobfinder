// ============================================================
// Search & Filter Logic
// ============================================================

import type { Job, FilterState, SortOption, EducationFilter, SectorFilter, RecruitmentStatus } from '../types/job';
import { compareDates } from './dateUtils';

export function filterJobs(jobs: Job[], filters: FilterState): Job[] {
  return jobs.filter((job) => {
    // Text search: department, title, tags, short description
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      const searchable = [
        job.title,
        job.department,
        job.shortDescription ?? '',
        ...(job.tags ?? []),
        job.recruitmentId ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Education filter
    if (filters.education.length > 0) {
      // Job matches if any of the user's selected educations is in job.minQualification
      // OR if user has a higher qualification
      const qualHierarchy: EducationFilter[] = ['10th', 'iti_diploma', '12th_general', '12th_pcm', 'graduate'];
      const userMaxIdx = Math.max(...filters.education.map((e) => qualHierarchy.indexOf(e)));
      const jobMinIdx = Math.min(
        ...job.minQualification.map((e) => {
          const i = qualHierarchy.indexOf(e);
          return i === -1 ? 99 : i;
        }),
      );
      if (userMaxIdx < jobMinIdx) return false;
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      if (!filters.sectors.includes(job.sector)) return false;
    }

    // Status filter
    if (filters.status.length > 0) {
      if (!filters.status.includes(job.status)) return false;
    }

    return true;
  });
}

export function sortJobs(jobs: Job[], sort: SortOption): Job[] {
  const sorted = [...jobs];
  switch (sort) {
    case 'deadline_asc':
      return sorted.sort((a, b) =>
        compareDates(a.importantDates.applicationEnd, b.importantDates.applicationEnd),
      );
    case 'deadline_desc':
      return sorted.sort((a, b) =>
        compareDates(b.importantDates.applicationEnd, a.importantDates.applicationEnd),
      );
    case 'newest':
      return sorted.sort((a, b) =>
        compareDates(b.lastUpdated, a.lastUpdated),
      );
    case 'vacancies_desc':
      return sorted.sort((a, b) => b.totalVacancies - a.totalVacancies);
    default:
      return sorted;
  }
}

// ---- Label helpers -----------------------------------------------

export const EDUCATION_LABELS: Record<EducationFilter, string> = {
  '10th': '10th Pass',
  '12th_general': '12th Pass (General)',
  '12th_pcm': '12th Pass (PCM)',
  graduate: 'Graduate',
  iti_diploma: 'ITI / Diploma',
};

export const SECTOR_LABELS: Record<SectorFilter, string> = {
  railways: 'Railways',
  ssc: 'SSC',
  defense_police: 'Defense / Police',
  banking: 'Banking',
  state_govt: 'State Government',
};

export const STATUS_LABELS: Record<RecruitmentStatus, string> = {
  open: 'Open',
  closing_soon: 'Closing Soon',
  closed: 'Closed',
  result_declared: 'Result Declared',
  upcoming: 'Upcoming',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const SORT_LABELS: Record<SortOption, string> = {
  deadline_asc: 'Deadline (Earliest)',
  deadline_desc: 'Deadline (Latest)',
  newest: 'Newest First',
  vacancies_desc: 'Most Vacancies',
};

export const STATUS_COLORS: Record<RecruitmentStatus, string> = {
  open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  closing_soon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  closed: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  result_declared: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  upcoming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export const SECTOR_ICONS: Record<SectorFilter, string> = {
  railways: '🚂',
  ssc: '🏛️',
  defense_police: '🛡️',
  banking: '🏦',
  state_govt: '🗳️',
};
