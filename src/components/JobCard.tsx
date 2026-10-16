// ============================================================
// JobCard Component
// Dynamic card with Gujarat GAD Rule Eligibility Badge,
// Bookmark/Save toggle, Corrigendum count, and Bilingual title.
// ============================================================
import { Users, GraduationCap, IndianRupee, Calendar, Bookmark, AlertCircle } from 'lucide-react';
import type { Job, EducationFilter } from '../types/job';
import { STATUS_LABELS, STATUS_COLORS, SECTOR_LABELS, SECTOR_ICONS, EDUCATION_LABELS } from '../utils/filterUtils';
import { formatDate } from '../utils/dateUtils';
import { DeadlineBadge } from './DeadlineBadge';
import { useCandidateProfile } from '../contexts/CandidateProfileContext';
import { evaluateGADEligibility } from '../utils/gadEligibilityUtils';
import { useSavedJobs } from '../contexts/SavedJobsContext';
import { clsx } from 'clsx';

interface JobCardProps {
  job: Job;
  selectedEducation: EducationFilter[];
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { profile } = useCandidateProfile();
  const { isJobSaved, saveJob, unsaveJob } = useSavedJobs();
  const saved = isJobSaved(job.id);

  // Compute live Gujarat GAD eligibility
  const gadResult = evaluateGADEligibility(job, profile);

  function handleBookmarkClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (saved) {
      unsaveJob(job.id);
    } else {
      saveJob(job.id);
    }
  }

  const corrigendaCount = job.corrigenda ? job.corrigenda.length : 0;

  return (
    <article
      onClick={onClick}
      className={clsx(
        'group bg-white dark:bg-slate-900 border rounded-2xl p-5 cursor-pointer',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600',
        'card-glow relative flex flex-col justify-between',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View details for ${job.title}`}
    >
      <div>
        {/* Top row: sector + agency + status + bookmark */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>{SECTOR_ICONS[job.sector]}</span>
              {job.agency || SECTOR_LABELS[job.sector]}
            </span>
            <span
              className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                STATUS_COLORS[job.status],
              )}
            >
              {STATUS_LABELS[job.status]}
            </span>
            {corrigendaCount > 0 && (
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle size={11} /> {corrigendaCount} {corrigendaCount === 1 ? 'Corrigendum' : 'Corrigenda'}
              </span>
            )}
            {job.dataQuality === 'demo' && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium">
                Demo Data
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <DeadlineBadge applicationEnd={job.importantDates.applicationEnd} status={job.status} />
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={saved ? 'Remove from saved' : 'Save application'}
              title={saved ? 'Saved in personal pipeline' : 'Save application to pipeline'}
              className={clsx(
                'p-1.5 rounded-lg border transition-all',
                saved
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
              )}
            >
              <Bookmark size={15} className={saved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Title + Gujarati title + department */}
        <h2 className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug mb-0.5">
          {job.title}
        </h2>
        {job.titleGuj && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-1 font-gujarati">
            {job.titleGuj}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{job.department}</p>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3.5">
          <Stat icon={<Users size={13} />} label="Vacancies" value={job.totalVacancies.toLocaleString('en-IN')} />
          <Stat icon={<GraduationCap size={13} />} label="Min. Qual." value={getMinQualLabel(job)} />
          <Stat icon={<IndianRupee size={13} />} label="Salary" value={job.salary.displayText} clamp />
          <Stat icon={<Calendar size={13} />} label="Apply By" value={formatDate(job.importantDates.applicationEnd)} />
        </div>

        {/* Age limit */}
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Base Age: {job.minAge ?? job.ageLimit.min}–{job.maxAgeBase ?? job.ageLimit.max} yrs
          {gadResult.relaxYears > 0 && (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium"> (Your max: {gadResult.effectiveMaxAge} yrs)</span>
          )}
        </div>
      </div>

      {/* Bottom row: GAD Rule dynamic eligibility badge */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
        <span
          className={clsx(
            'text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border',
            gadResult.badgeClass,
          )}
          title={gadResult.reason}
        >
          {gadResult.badgeText}
        </span>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:underline shrink-0">
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

function getMinQualLabel(job: Job): string {
  if (job.eduSummaryEn) {
    return job.eduSummaryEn.split(' ')[0] || 'See details';
  }
  if (!job.minQualification || job.minQualification.length === 0) return 'See details';
  const order: EducationFilter[] = ['10th', 'iti_diploma', '12th_general', '12th_pcm', 'graduate'];
  const sorted = [...job.minQualification].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return EDUCATION_LABELS[sorted[0]] || 'See details';
}
