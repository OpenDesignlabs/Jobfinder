// ============================================================
// Corrigendum Monitor Page
// Source-backed change & correction tracking with before/after diffs
// ============================================================
import { useState, useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
import type { Corrigendum, CorrigendumCategory } from '../types/job';
import { DEMO_JOBS } from '../data/jobs';
import { clsx } from 'clsx';

const CATEGORY_LABELS: Record<CorrigendumCategory | 'ALL', string> = {
  ALL: 'All Verified Changes',
  DEADLINE: 'Deadline Extensions',
  VACANCY: 'Vacancy & Seat Revisions',
  ELIGIBILITY: 'Eligibility & Document Rules',
  REFUND_EXAM: 'Fee Refund & Exam Alerts',
};

const CATEGORY_COLORS: Record<CorrigendumCategory, string> = {
  DEADLINE: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
  VACANCY: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  ELIGIBILITY: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  REFUND_EXAM: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
};

interface CorrigendumEntry {
  corr: Corrigendum;
  jobTitle: string;
  jobId: string;
  agencyFull?: string;
}

export function CorrigendumPage() {
  const [filterCategory, setFilterCategory] = useState<CorrigendumCategory | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Flatten all corrigenda from all jobs
  const allEntries = useMemo<CorrigendumEntry[]>(() => {
    const entries: CorrigendumEntry[] = [];
    for (const job of DEMO_JOBS) {
      for (const corr of (job.corrigenda ?? [])) {
        entries.push({ corr, jobTitle: job.title, jobId: job.id, agencyFull: job.agencyFull });
      }
    }
    // Sort by date desc (most recent first)
    return entries.sort((a, b) => b.corr.date.localeCompare(a.corr.date));
  }, []);

  const filtered = useMemo(() =>
    filterCategory === 'ALL'
      ? allEntries
      : allEntries.filter((e) => e.corr.category === filterCategory),
    [allEntries, filterCategory],
  );

  function toggleExpand(corrId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(corrId)) next.delete(corrId);
      else next.add(corrId);
      return next;
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/60 rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-base font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            Source-Backed Recruitment Change &amp; Corrigendum Monitor
          </h1>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
            Every <strong>Sudhara Jaherat (સુધારા જાહેરાત / Corrigendum)</strong>, deadline extension,
            vacancy revision, or fee-refund circular is verified against official Gujarat portals with
            side-by-side <em>Original vs. Revised</em> clause diffs.
          </p>
        </div>
        <div>
          <label htmlFor="changeTypeFilter" className="block text-[10px] font-bold uppercase text-amber-900 dark:text-amber-400 mb-1">
            Filter Change Type
          </label>
          <select
            id="changeTypeFilter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as CorrigendumCategory | 'ALL')}
            className="rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-200"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{allEntries.length}</strong> corrigenda
        </span>
        <button
          onClick={() => setExpandedIds(new Set(filtered.map((e) => e.corr.corrId)))}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw size={11} /> Expand All
        </button>
      </div>

      {/* Corrigendum list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <AlertTriangle size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No corrigenda match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ corr, jobTitle, jobId, agencyFull }) => {
            const expanded = expandedIds.has(corr.corrId);
            return (
              <div
                key={corr.corrId}
                id={`corr-${corr.corrId}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Card header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(corr.corrId)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide', CATEGORY_COLORS[corr.category])}>
                        {corr.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{corr.date}</span>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {corr.corrId}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug mb-0.5">
                      {corr.type}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Re: <span className="font-medium text-slate-700 dark:text-slate-300">{jobTitle}</span>
                      {agencyFull && <span className="text-slate-400"> · {agencyFull}</span>}
                    </p>
                  </div>
                  {expanded
                    ? <ChevronUp size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    : <ChevronDown size={16} className="text-slate-400 shrink-0 mt-0.5" />}
                </button>

                {/* Expanded diff + Gujarati summary */}
                {expanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4">
                    {/* Source citation */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      📋 Source: {corr.sectionCitation}
                    </p>

                    {/* Before / After diff */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-700/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                          ❌ Before (Original)
                        </p>
                        <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">{corr.beforeText}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                          ✓ After (Revised &amp; Verified)
                        </p>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">{corr.afterText}</p>
                      </div>
                    </div>

                    {/* Gujarati summary */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                        ગુજરાતી સારાંશ
                      </p>
                      <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed" style={{ fontFamily: "'Noto Sans Gujarati', serif" }}>
                        {corr.summaryGuj}
                      </p>
                    </div>

                    {/* Link to job */}
                    <a
                      href={`#job-${jobId}`}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      <ExternalLink size={12} />
                      View Recruitment Record
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
