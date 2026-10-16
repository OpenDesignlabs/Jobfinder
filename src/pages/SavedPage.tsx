// ============================================================
// Saved Applications & Document Vault Page
// Personal application pipeline + OJAS document readiness vault
// ============================================================
import { useState } from 'react';
import { Bookmark, CheckCircle2, Circle, ChevronDown, ExternalLink, Printer, Shield } from 'lucide-react';
import { useSavedJobs, COMMON_VAULT_ITEMS, APPLICATION_STAGES, type ApplicationStage } from '../contexts/SavedJobsContext';
import { DEMO_JOBS } from '../data/jobs';
import type { Job } from '../types/job';
import { formatDate, getDeadlineInfo } from '../utils/dateUtils';
import { clsx } from 'clsx';

export function SavedPage() {
  const { savedIds, jobStageById, setJobStage, toggleCheck, isChecked } = useSavedJobs();

  const savedJobs = savedIds
    .map((id) => DEMO_JOBS.find((j) => j.id === id))
    .filter((j): j is Job => !!j);

  const vaultReady = COMMON_VAULT_ITEMS.filter((item) => isChecked(item.id)).length;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Document Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vault Checklist (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-indigo-600" />
                Your Common Gujarat Document Readiness Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Check off your standard OJAS / GPSC / GSSSB documents once — synced across all saved applications.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
              {vaultReady} / {COMMON_VAULT_ITEMS.length} Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMON_VAULT_ITEMS.map((item) => {
              const checked = isChecked(item.id);
              return (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                    checked
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                  )}
                >
                  {checked
                    ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    : <Circle size={16} className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{item.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5" style={{ fontFamily: "'Noto Sans Gujarati', serif" }}>
                      {item.guj}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* OJAS Photo Spec Checker */}
        <OJASPhotoChecker />
      </div>

      {/* Saved Applications Pipeline */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Bookmark size={14} className="text-blue-600" />
            Saved Vacancies &amp; Personal Application Pipeline
          </h3>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition no-print"
          >
            <Printer size={12} />
            Print / Save Readiness PDF
          </button>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Bookmark size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No saved applications yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Open any job listing and click "Save" to track it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} stage={jobStageById[job.id] ?? 'Interested'} setJobStage={setJobStage} isChecked={isChecked} toggleCheck={toggleCheck} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SavedJobCard({
  job,
  stage,
  setJobStage,
  isChecked,
  toggleCheck,
}: {
  job: Job;
  stage: ApplicationStage;
  setJobStage: (id: string, stage: ApplicationStage) => void;
  isChecked: (k: string) => boolean;
  toggleCheck: (k: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const deadline = getDeadlineInfo(job.importantDates.applicationEnd);
  const stageIdx = APPLICATION_STAGES.indexOf(stage);
  const checklist = job.checklist ?? [];
  const doneCount = checklist.filter((_, i) => isChecked(`${job.id}::${i}`)).length;

  return (
    <div id={`saved-${job.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{job.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.department}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx(
              'text-xs font-semibold px-2 py-1 rounded-lg border',
              deadline.urgency === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
            )}>
              ⏳ {deadline.daysLeft >= 0 ? `${deadline.daysLeft} days left` : 'Closed'} · {formatDate(job.importantDates.applicationEnd)}
            </span>
          </div>
        </div>

        {/* Stage pipeline */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Application Stage</p>
          <div className="flex gap-1 flex-wrap">
            {APPLICATION_STAGES.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setJobStage(job.id, s)}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all',
                  i === stageIdx
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : i < stageIdx
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist toggle */}
      {checklist.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span>📋 Job-Specific Checklist — {doneCount}/{checklist.length} Done</span>
            {expanded ? <ChevronDown size={14} /> : <ChevronDown size={14} className="rotate-[-90deg]" />}
          </button>
          {expanded && (
            <div className="px-4 pb-4 pt-2 grid sm:grid-cols-2 gap-2">
              {checklist.map((item, i) => {
                const key = `${job.id}::${i}`;
                const done = isChecked(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCheck(key)}
                    className={clsx(
                      'flex items-start gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all',
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300',
                    )}
                  >
                    {done
                      ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      : <Circle size={14} className="shrink-0 mt-0.5 text-slate-300 dark:text-slate-600" />}
                    {item}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Official links */}
      {job.officialLinks.applyOnline && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 flex gap-2 flex-wrap">
          <a
            href={job.officialLinks.applyOnline}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            <ExternalLink size={12} />
            Apply Online
          </a>
        </div>
      )}
    </div>
  );
}

// ---- OJAS Photo & Signature Spec Checker -------------------------
function OJASPhotoChecker() {
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pass' | 'fail'>('idle');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = file.size / 1024;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      URL.revokeObjectURL(url);
      const sizeOk = sizeKB <= 15;
      const isJpg = file.type === 'image/jpeg';
      const pass = sizeOk && isJpg;
      setStatus(pass ? 'pass' : 'fail');
      setResult(
        `File: ${file.name} · ${sizeKB.toFixed(1)} KB · ${w}×${h}px · ${file.type}\n` +
        (sizeOk ? '✓ Size OK (≤ 15 KB)' : `✕ Too large (${sizeKB.toFixed(1)} KB, must be < 15 KB)`) + '\n' +
        (isJpg ? '✓ Format OK (JPG)' : '✕ Wrong format (JPG only)'),
      );
    };
    img.src = url;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
            OJAS Utility
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">100% Browser-Local</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">OJAS Photo &amp; Signature Spec Checker</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          OJAS rejects photos/signatures larger than <strong>15 KB</strong> or outside{' '}
          <strong>5 cm × 3.6 cm</strong>. Verify before applying:
        </p>
        <div className="mt-3">
          <label htmlFor="photoCheckInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Photo or Signature:
          </label>
          <input
            id="photoCheckInput"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFile}
            className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-300 hover:file:bg-indigo-100"
          />
        </div>
        {result && (
          <pre className={clsx(
            'mt-3 p-3 rounded-xl text-[10px] whitespace-pre-wrap font-mono border leading-relaxed',
            status === 'pass'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700 text-rose-800 dark:text-rose-300'
          )}>
            {result}
          </pre>
        )}
      </div>
      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
        <div className="font-bold">Official OJAS Upload Rules:</div>
        <div>• Format: <strong>JPG / JPEG</strong> only</div>
        <div>• File Size: <strong>Under 15 KB</strong> (10–15 KB ideal)</div>
        <div>• Dimensions: <strong>5 cm (H) × 3.6 cm (W)</strong> (~140×190 px)</div>
      </div>
    </div>
  );
}
