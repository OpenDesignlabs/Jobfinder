// ============================================================
// JobDetailModal Component
// ============================================================
import { X, Users, IndianRupee, Calendar, GraduationCap, Shield, FileText, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';
import type { Job, EducationFilter } from '../types/job';
import { matchEligibility, eligibilityBadgeClass, eligibilityLabel } from '../utils/eligibilityUtils';
import { STATUS_LABELS, STATUS_COLORS, SECTOR_LABELS, SECTOR_ICONS, EDUCATION_LABELS } from '../utils/filterUtils';
import { formatDate, getDeadlineInfo } from '../utils/dateUtils';
import { OfficialLinkButton } from './OfficialLinkButton';
import { clsx } from 'clsx';

interface JobDetailModalProps {
  job: Job;
  selectedEducation: EducationFilter[];
  onClose: () => void;
}

export function JobDetailModal({ job, selectedEducation, onClose }: JobDetailModalProps) {
  const eligibility = matchEligibility(job, selectedEducation);
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
    return () => { document.body.style.overflow = ''; };
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-3xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {SECTOR_ICONS[job.sector]} {SECTOR_LABELS[job.sector]}
              </span>
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[job.status])}>
                {STATUS_LABELS[job.status]}
              </span>
              {job.dataQuality === 'demo' && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <AlertTriangle size={10} /> Demo Data – Not Current Verified Recruitment
                </span>
              )}
            </div>
            <h2 id="job-detail-title" className="font-bold text-xl text-slate-900 dark:text-white leading-tight">
              {job.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{job.department}</p>
            {job.recruitmentId && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Recruitment ID: {job.recruitmentId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Demo data warning */}
          {job.dataQuality === 'demo' && (
            <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Demonstration data only.</strong> Vacancy numbers, dates, salaries, and fees shown here are illustrative references and may not reflect current, verified recruitment information. Always check the official recruiting body's website for accurate details.
              </div>
            </div>
          )}

          {/* Short description */}
          {job.shortDescription && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{job.shortDescription}</p>
          )}

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KeyStat icon={<Users size={14} />} label="Total Vacancies" value={job.totalVacancies.toLocaleString('en-IN')} />
            <KeyStat icon={<Calendar size={14} />} label="Apply By" value={formatDate(job.importantDates.applicationEnd)} />
            <KeyStat icon={<Clock size={14} />} label="Deadline" value={deadline.expired ? 'Passed' : deadline.label} urgent={deadline.urgency === 'critical'} />
            <KeyStat icon={<IndianRupee size={14} />} label="Salary" value={job.salary.displayText} />
          </div>

          {/* Eligibility card */}
          <div className={clsx('rounded-xl p-4 border', eligibilityBadgeClass(eligibility.result))}>
            <div className="flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-sm mb-0.5">{eligibilityLabel(eligibility.result)}</div>
                <div className="text-xs opacity-80">{eligibility.reason}</div>
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <Section title="Eligibility Criteria" icon={<Shield size={14} />}>
            <InfoRow label="Nationality" value={job.nationality ?? 'As per official notification'} />
            <InfoRow label="Age Limit" value={`${job.ageLimit.min} – ${job.ageLimit.max} years`} />
            {job.ageLimit.relaxations && job.ageLimit.relaxations.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Age Relaxations</div>
                <ul className="space-y-1">
                  {job.ageLimit.relaxations.map((r) => (
                    <li key={r.category} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{r.category}: +{r.relaxationYears} years</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.physicalStandards && (
              <InfoRow label="Physical Standards" value={job.physicalStandards} />
            )}
          </Section>

          {/* Education */}
          <Section title="Educational Requirements" icon={<GraduationCap size={14} />}>
            <div className="flex flex-wrap gap-2 mb-2">
              {job.minQualification.map((q) => (
                <span key={q} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {EDUCATION_LABELS[q]}
                </span>
              ))}
            </div>
            {job.qualificationNote && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{job.qualificationNote}</p>
            )}
          </Section>

          {/* Vacancies */}
          {job.vacancyBreakdown && job.vacancyBreakdown.length > 0 && (
            <Section title="Vacancy Distribution" icon={<Users size={14} />}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left py-1.5 text-slate-500 dark:text-slate-400 font-medium">Category / Post</th>
                      <th className="text-right py-1.5 text-slate-500 dark:text-slate-400 font-medium">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.vacancyBreakdown.map((v, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-1.5 text-slate-700 dark:text-slate-300">{v.category ?? v.post}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 font-medium">{v.count.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-2 font-semibold text-slate-800 dark:text-slate-200">Total</td>
                      <td className="pt-2 text-right font-bold text-blue-700 dark:text-blue-400">{job.totalVacancies.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Salary */}
          <Section title="Salary & Pay" icon={<IndianRupee size={14} />}>
            {job.salary.payLevel && <InfoRow label="Pay Level" value={job.salary.payLevel} />}
            {job.salary.payScale && <InfoRow label="Pay Scale" value={job.salary.payScale} />}
            <InfoRow label="Summary" value={job.salary.displayText} />
          </Section>

          {/* Application Fee */}
          {job.applicationFee && (
            <Section title="Application Fee" icon={<IndianRupee size={14} />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'General / OBC', value: job.applicationFee.general },
                  { label: 'SC / ST', value: job.applicationFee.scSt },
                  { label: 'Ex-Servicemen', value: job.applicationFee.exServicemen },
                  ...(job.applicationFee.women !== undefined ? [{ label: 'Women', value: job.applicationFee.women }] : []),
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{f.label}</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {f.value === 0 ? 'Nil' : `₹${f.value}`}
                    </div>
                  </div>
                ))}
              </div>
              {job.applicationFee.note && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{job.applicationFee.note}</p>
              )}
            </Section>
          )}

          {/* Important Dates */}
          <Section title="Important Dates" icon={<Calendar size={14} />}>
            {[
              { label: 'Notification Date', value: job.importantDates.notificationDate },
              { label: 'Application Start', value: job.importantDates.applicationStart },
              { label: 'Application End', value: job.importantDates.applicationEnd },
              { label: 'Admit Card', value: job.importantDates.admitCardDate },
              { label: 'Exam Date', value: job.importantDates.examDate },
              { label: 'Result Date', value: job.importantDates.resultDate },
            ]
              .filter((d) => d.value)
              .map((d) => (
                <InfoRow key={d.label} label={d.label} value={formatDate(d.value)} />
              ))}
          </Section>

          {/* Selection Process */}
          {job.selectionProcess && job.selectionProcess.length > 0 && (
            <Section title="Selection Process" icon={<CheckCircle2 size={14} />}>
              <ol className="space-y-3">
                {job.selectionProcess.map((stage) => (
                  <li key={stage.order} className="flex items-start gap-3">
                    <span className="flex-none w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {stage.order}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{stage.name}</div>
                      {stage.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stage.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Required Documents */}
          {job.requiredDocuments && job.requiredDocuments.length > 0 && (
            <Section title="Required Documents" icon={<FileText size={14} />}>
              <ul className="space-y-1.5">
                {job.requiredDocuments.map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Application Instructions */}
          {job.applicationInstructions && (
            <Section title="How to Apply" icon={<Info size={14} />}>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{job.applicationInstructions}</p>
            </Section>
          )}

          {/* Official Links */}
          <Section title="Official Sources" icon={<Shield size={14} />}>
            {!job.officialLinks.verified && (
              <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Links below have not been verified against current official sources. Always navigate directly to the official website of the recruiting body.
                </p>
              </div>
            )}
            {job.officialLinks.lastVerified && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                Last verified: {formatDate(job.officialLinks.lastVerified)}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <OfficialLinkButton
                href={job.officialLinks.notificationPdf}
                label="Download Official PDF Notification"
                icon="pdf"
                verified={job.officialLinks.verified}
                variant="secondary"
              />
              <OfficialLinkButton
                href={job.officialLinks.applyOnline}
                label="Apply on Official Website"
                icon="apply"
                verified={job.officialLinks.verified}
                variant="primary"
              />
              <OfficialLinkButton
                href={job.officialLinks.officialWebsite}
                label="Official Website"
                icon="website"
                verified={true}
                variant="secondary"
              />
            </div>
          </Section>

          {/* Data quality footer */}
          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 leading-relaxed">
            Data quality: <strong className="text-slate-600 dark:text-slate-400">{job.dataQuality === 'demo' ? 'Demonstration – not verified official data' : job.dataQuality === 'verified' ? 'Verified' : 'Unverified'}</strong>
            {' · '}Last updated: {formatDate(job.lastUpdated)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components -----------------------------------------------

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-blue-500">{icon}</span>
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h3>
      </div>
      <div className="space-y-2 ml-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0">{label}:</span>
      <span className="text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}

function KeyStat({ icon, label, value, urgent }: { icon: React.ReactNode; label: string; value: string; urgent?: boolean }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={clsx('text-sm font-semibold', urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200')}>
        {value}
      </div>
    </div>
  );
}
