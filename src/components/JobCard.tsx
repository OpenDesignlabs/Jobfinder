// ============================================================
// JobCard Component
// ============================================================
import { Users, GraduationCap, IndianRupee, Calendar } from 'lucide-react';
import type { Job, EducationFilter } from '../types/job';
import { matchEligibility, eligibilityBadgeClass, eligibilityLabel } from '../utils/eligibilityUtils';
import { STATUS_LABELS, STATUS_COLORS, SECTOR_LABELS, SECTOR_ICONS } from '../utils/filterUtils';
import { formatDate } from '../utils/dateUtils';
import { DeadlineBadge } from './DeadlineBadge';
import { clsx } from 'clsx';

interface JobCardProps {
  job: Job;
  selectedEducation: EducationFilter[];
  onClick: () => void;
}

export function JobCard({ job, selectedEducation, onClick }: JobCardProps) {
  const eligibility = matchEligibility(job, selectedEducation);

  return (
    <article
      onClick={onClick}
      className={clsx(
        'group bg-white dark:bg-slate-900 border rounded-2xl p-5 cursor-pointer',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600',
        'card-glow',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View details for ${job.title}`}
    >
      {/* Top row: sector + status + demo label */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>{SECTOR_ICONS[job.sector]}</span>
            {SECTOR_LABELS[job.sector]}
          </span>
          <span
            className={clsx(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              STATUS_COLORS[job.status],
            )}
          >
            {STATUS_LABELS[job.status]}
          </span>
          {job.dataQuality === 'demo' && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium">
              Demo Data
            </span>
          )}
        </div>
        <DeadlineBadge applicationEnd={job.importantDates.applicationEnd} status={job.status} />
      </div>

      {/* Title + department */}
      <h2 className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug mb-0.5">
        {job.title}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{job.department}</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat icon={<Users size={13} />} label="Vacancies" value={job.totalVacancies.toLocaleString('en-IN')} />
        <Stat icon={<GraduationCap size={13} />} label="Min. Qual." value={getMinQualLabel(job)} />
        <Stat icon={<IndianRupee size={13} />} label="Salary" value={job.salary.displayText} clamp />
        <Stat icon={<Calendar size={13} />} label="Apply By" value={formatDate(job.importantDates.applicationEnd)} />
      </div>

      {/* Age limit */}
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Age: {job.ageLimit.min}–{job.ageLimit.max} yrs
        {job.ageLimit.relaxations && job.ageLimit.relaxations.length > 0 && ' (relaxation applicable)'}
      </div>

      {/* Bottom row: eligibility */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span
          className={clsx(
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            eligibilityBadgeClass(eligibility.result),
          )}
          title={eligibility.reason}
        >
          {eligibilityLabel(eligibility.result)}
        </span>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
          View Details →
        </span>
      </div>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
  clamp,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  clamp?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">
        {icon}
        {label}
      </div>
      <div className={clsx('text-xs font-medium text-slate-700 dark:text-slate-300', clamp && 'line-clamp-1')}>
        {value}
      </div>
    </div>
  );
}

import { EDUCATION_LABELS } from '../utils/filterUtils';
function getMinQualLabel(job: Job): string {
  if (job.minQualification.length === 0) return 'See details';
  // Show the lowest level
  const order: import('../types/job').EducationFilter[] = ['10th', 'iti_diploma', '12th_general', '12th_pcm', 'graduate'];
  const sorted = [...job.minQualification].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return EDUCATION_LABELS[sorted[0]];
}
