// ============================================================
// JobDetailModal Component
// Complete Gujarat Recruitment Details with GAD Eligibility Engine,
// Three-valued rule-by-rule breakdown (pass/fail/unknown),
// Corrigenda (સુધારા જાહેરાત) Diffs, Checklist, Timeline, & Save Actions.
// ============================================================
import {
  X,
  Users,
  IndianRupee,
  Calendar,
  GraduationCap,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bookmark,
  Milestone,
  CheckSquare,
  AlertCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import type { Job, EducationFilter } from '../types/job';
import { STATUS_LABELS, STATUS_COLORS, SECTOR_LABELS, SECTOR_ICONS, EDUCATION_LABELS } from '../utils/filterUtils';
import { formatDate, getDeadlineInfo } from '../utils/dateUtils';
import { OfficialLinkButton } from './OfficialLinkButton';
import { useCandidateProfile } from '../contexts/CandidateProfileContext';
import { evaluateGADEligibility, evaluateGADEligibilityV1 } from '../utils/gadEligibilityUtils';
import { useSavedJobs } from '../contexts/SavedJobsContext';
import { clsx } from 'clsx';

interface JobDetailModalProps {
  job: Job;
  selectedEducation: EducationFilter[];
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const { profile } = useCandidateProfile();
  const { isJobSaved, saveJob, unsaveJob, isChecked, toggleCheck } = useSavedJobs();

  const saved = isJobSaved(job.id);
  const gadResult = evaluateGADEligibility(job, profile);
  const gadV1 = evaluateGADEligibilityV1(job, profile);
  const deadline = getDeadlineInfo(job.importantDates.applicationEnd);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full sm:max-w-4xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {SECTOR_ICONS[job.sector]} {job.agency || SECTOR_LABELS[job.sector]}
              </span>
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[job.status])}>
                {STATUS_LABELS[job.status]}
              </span>
              {job.advtNo && (
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Advt: {job.advtNo}
                </span>
              )}
            </div>

            <h2 id="job-detail-title" className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
              {job.title}
            </h2>
            {job.titleGuj && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-gujarati">
                {job.titleGuj}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.department || job.agencyFull}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Save Application Button */}
            <button
              onClick={() => (saved ? unsaveJob(job.id) : saveJob(job.id))}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border',
                saved
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200',
              )}
            >
              <Bookmark size={14} className={saved ? 'fill-current' : ''} />
              <span className="hidden sm:inline">{saved ? 'Saved in Tracker' : 'Save Application'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Dynamic GAD Rule Eligibility Banner */}
          <div className={clsx('rounded-2xl p-4 sm:p-5 border', gadResult.badgeClass)}>
            <div className="flex items-start gap-3">
              <Shield size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base mb-1">
                  Gujarat GAD Eligibility: {gadResult.badgeText}
                </div>
                <div className="text-xs leading-relaxed opacity-90">
                  {gadResult.reason}
                </div>
                {gadResult.relaxYears > 0 && (
                  <div className="mt-2 text-xs font-semibold bg-white/40 dark:bg-black/20 p-2 rounded-lg">
                    Base Maximum Age: {job.maxAgeBase ?? job.ageLimit.max} yrs → With your Category/Special Relaxation: {gadResult.effectiveMaxAge} yrs (Gujarat GAD Rule Cap: 45 yrs)
                  </div>
                )}

                {/* Three-valued rule breakdown — spec §9 Step 6 */}
                {gadV1.checks.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Rule-by-Rule Assessment:</p>
                    {gadV1.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/30 dark:bg-black/10 rounded-lg px-2.5 py-1.5 text-xs">
                        {check.result === 'pass' && <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-600" />}
                        {check.result === 'fail' && <XCircle size={13} className="shrink-0 mt-0.5 text-rose-600" />}
                        {check.result === 'unknown' && <HelpCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />}
                        <div>
                          <span className="font-semibold capitalize">{check.rule.replace(/_/g, ' ')}</span>:
                          <span className="ml-1 opacity-80">{check.reason}</span>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] opacity-60 italic mt-1">
                      Results are indicative. The recruiting authority's official decision takes precedence.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stale data warning — spec §3 */}
          {job._stale && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Data not recently verified.</strong> The last source check for this recruitment is overdue.
                Always confirm dates on the official portal before applying.
              </span>
            </div>
          )}

          {/* Key stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KeyStat icon={<Users size={14} />} label="Total Vacancies" value={job.totalVacancies.toLocaleString('en-IN')} />
            <KeyStat icon={<Calendar size={14} />} label="Closing Date" value={formatDate(job.importantDates.applicationEnd)} />
            <KeyStat icon={<Clock size={14} />} label="Days Remaining" value={deadline.expired ? 'Closed' : `${job.daysLeft ?? deadline.label}`} urgent={deadline.urgency === 'critical'} />
            <KeyStat icon={<IndianRupee size={14} />} label="Fee & Salary" value={job.feeSummary ? job.feeSummary.split('—')[0] : job.salary.displayText} />
          </div>

          {/* Bilingual Explanations (Gujarati + English) */}
          {(job.gujaratiExplanation || job.englishExplanation) && (
            <Section title="Recruitment Summary & Verification Status" icon={<Info size={15} />}>
              {job.gujaratiExplanation && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5 mb-2.5">
                  <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1">
                    ગુજરાતી સારાંશ (Gujarati Guidance)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-gujarati leading-relaxed">
                    {job.gujaratiExplanation}
                  </p>
                </div>
              )}
              {job.englishExplanation && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {job.englishExplanation}
                </p>
              )}
            </Section>
          )}

          {/* Corrigenda & Official Amendments (Sudhara Jaherat) */}
          {job.corrigenda && job.corrigenda.length > 0 && (
            <Section title={`Official Corrigenda & Updates (${job.corrigenda.length})`} icon={<AlertCircle size={15} />}>
              <div className="space-y-3">
                {job.corrigenda.map((corr) => (
                  <div
                    key={corr.corrId}
                    className="border border-purple-200 dark:border-purple-800/70 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                        {corr.type}
                      </span>
                      <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                        Published: {corr.date}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Citation:</strong> {corr.sectionCitation}
                    </p>

                    {/* Before & After comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {corr.beforeText && (
                        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-lg text-rose-900 dark:text-rose-200">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-rose-600 block mb-1">
                            Before (Original Clause)
                          </span>
                          {corr.beforeText}
                        </div>
                      )}
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-2.5 rounded-lg text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 block mb-1">
                          After (Verified Amendment)
                        </span>
                        {corr.afterText}
                      </div>
                    </div>

                    {corr.summaryGuj && (
                      <p className="text-xs text-purple-800 dark:text-purple-300 font-gujarati italic pt-1">
                        👉 {corr.summaryGuj}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Manual Review Exception */}
          {job.manualReviewException && (
            <div className="flex gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
              <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 block mb-0.5">
                  Important Manual Review / Equivalence Caveat
                </strong>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  {job.manualReviewException}
                </p>
              </div>
            </div>
          )}

          {/* Educational Requirements */}
          <Section title="Educational Requirements & Equivalence" icon={<GraduationCap size={15} />}>
            {job.eduSummaryEn && (
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 leading-relaxed">
                {job.eduSummaryEn}
              </p>
            )}
            {job.eduSummaryGuj && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-gujarati mb-3 leading-relaxed">
                {job.eduSummaryGuj}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {job.minQualification?.map((q) => (
                <span key={q} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {EDUCATION_LABELS[q] || q}
                </span>
              ))}
            </div>
          </Section>

          {/* Application Checklist */}
          {job.checklist && job.checklist.length > 0 && (
            <Section title="OJAS / Agency Application Checklist" icon={<CheckSquare size={15} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.checklist.map((item, idx) => {
                  const checkKey = `${job.id}-item-${idx}`;
                  const checked = isChecked(checkKey);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCheck(checkKey)}
                      className={clsx(
                        'flex items-start gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all',
                        checked
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300',
                      )}
                    >
                      <CheckCircle2
                        size={15}
                        className={clsx('shrink-0 mt-0.5', checked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}
                      />
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Timeline Milestones */}
          {job.timeline && job.timeline.length > 0 && (
            <Section title="Recruitment Lifecycle Timeline" icon={<Milestone size={15} />}>
              <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-4">
                {job.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={clsx(
                        'absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2',
                        step.status === 'done'
                          ? 'bg-emerald-500 border-emerald-500'
                          : step.status === 'current'
                          ? 'bg-blue-600 border-white ring-2 ring-blue-500 animate-pulse'
                          : 'bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600',
                      )}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{step.step}</span>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{step.date}</span>
                        {step.cite && <span className="opacity-75">· Ref: {step.cite}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Official Portals & Direct Links */}
          <Section title="Official Portals & Verification Sources" icon={<Shield size={15} />}>
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <OfficialLinkButton
                href={job.officialApplyUrl || job.officialLinks.applyOnline}
                label="Apply on Official Portal (OJAS)"
                icon="apply"
                verified={true}
                variant="primary"
              />
              <OfficialLinkButton
                href={job.officialBoardUrl || job.officialLinks.officialWebsite}
                label="Official Board Website"
                icon="website"
                verified={true}
                variant="secondary"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Last Verified by JobDirect Gujarat Cell: {job.lastVerified || formatDate(job.lastUpdated)}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function KeyStat({
  icon,
  label,
  value,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={clsx('text-xs sm:text-sm font-bold', urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200')}>
        {value}
      </div>
    </div>
  );
}
