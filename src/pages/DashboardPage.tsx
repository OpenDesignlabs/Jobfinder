// ============================================================
// Dashboard Page – Main Verified Gujarat Recruitment Feed
// Includes Candidate Profile Bar, Gujarat GAD Eligibility filtering,
// Agency Quick Pills, Search, and Live Job Cards.
// ============================================================
import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Building2,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  Filter,
} from 'lucide-react';
import type { FilterState, SortOption, Job, EducationFilter } from '../types/job';
import { DEMO_JOBS } from '../data/jobs';
import { filterJobs, sortJobs } from '../utils/filterUtils';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { JobCard } from '../components/JobCard';
import { JobDetailModal } from '../components/JobDetailModal';
import { EmptyState } from '../components/EmptyState';
import { CandidateProfileBar } from '../components/CandidateProfileBar';
import { useCandidateProfile } from '../contexts/CandidateProfileContext';
import { evaluateGADEligibility } from '../utils/gadEligibilityUtils';

const INITIAL_FILTERS: FilterState = {
  query: '',
  education: [],
  sectors: [],
  status: [],
};

const AGENCIES = [
  { code: 'ALL', label: 'All Agencies' },
  { code: 'GSSSB', label: 'GSSSB' },
  { code: 'GPSC', label: 'GPSC' },
  { code: 'GPRB', label: 'Police (GPRB)' },
  { code: 'GPSSB', label: 'GPSSB (Panchayat)' },
  { code: 'GHC', label: 'High Court' },
  { code: 'GUVNL', label: 'Energy (DGVCL)' },
  { code: 'SMC', label: 'Surat Municipal (SMC)' },
];

export function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedAgency, setSelectedAgency] = useState('ALL');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [sort, setSort] = useState<SortOption>('deadline_asc');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { profile } = useCandidateProfile();

  // Filter jobs by agency, standard filters, and optionally GAD eligibility
  const filteredJobs = useMemo(() => {
    let list = DEMO_JOBS;

    // Agency filter
    if (selectedAgency !== 'ALL') {
      list = list.filter((j) => (j.agency || '').toUpperCase() === selectedAgency.toUpperCase());
    }

    // Standard filters (search query, sector, status, education)
    list = filterJobs(list, filters);

    // GAD eligibility filter
    if (onlyEligible) {
      list = list.filter((j) => {
        const res = evaluateGADEligibility(j, profile);
        return res.isEligible;
      });
    }

    return sortJobs(list, sort);
  }, [filters, selectedAgency, onlyEligible, profile, sort]);

  // Overall stats
  const totalVacancies = useMemo(
    () => DEMO_JOBS.reduce((s, j) => s + j.totalVacancies, 0),
    [],
  );

  const eligibleCount = useMemo(
    () => DEMO_JOBS.filter((j) => evaluateGADEligibility(j, profile).isEligible).length,
    [profile],
  );

  const hasActiveFilters =
    filters.education.length > 0 ||
    filters.sectors.length > 0 ||
    filters.status.length > 0 ||
    filters.query.trim().length > 0 ||
    selectedAgency !== 'ALL' ||
    onlyEligible;

  function resetAll() {
    setFilters(INITIAL_FILTERS);
    setSelectedAgency('ALL');
    setOnlyEligible(false);
  }

  const selectedEducation: EducationFilter[] = filters.education;

  return (
    <main>
      {/* ── Hero Section ── */}
      <div className="hero-gradient border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 mb-3">
              <ShieldCheck size={14} /> Gujarat Government Recruitment Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
              Direct &amp; Verified{' '}
              <span className="text-blue-600 dark:text-blue-400">Gujarat Govt Jobs</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Rule-based Gujarat GAD eligibility calculations, official corrigenda monitoring,
              and OJAS application readiness tracking.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex justify-center gap-6 sm:gap-10 mb-6 flex-wrap">
            <StatPill
              icon={<TrendingUp size={15} />}
              label="Total Vacancies"
              value={totalVacancies.toLocaleString('en-IN')}
            />
            <StatPill
              icon={<Building2 size={15} />}
              label="Verified Openings"
              value={`${DEMO_JOBS.length}`}
            />
            <StatPill
              icon={<CheckCircle size={15} />}
              label="Eligible for You"
              value={`${eligibleCount} / ${DEMO_JOBS.length}`}
              highlight
            />
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <SearchBar
              value={filters.query}
              onChange={(q) => setFilters((f) => ({ ...f, query: q }))}
            />
          </div>

          {/* Candidate Profile Bar */}
          <div className="max-w-5xl mx-auto">
            <CandidateProfileBar />
          </div>
        </div>
      </div>

      {/* ── Main layout: Agency Pills + Filter Panel + Job Feed ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Agency Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter size={13} /> Agency:
          </span>
          {AGENCIES.map((ag) => (
            <button
              key={ag.code}
              type="button"
              onClick={() => setSelectedAgency(ag.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedAgency === ag.code
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              {ag.label}
            </button>
          ))}

          {/* Toggle: Only Eligible For Me */}
          <button
            type="button"
            onClick={() => setOnlyEligible(!onlyEligible)}
            className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
              onlyEligible
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <CheckCircle size={13} />
            {onlyEligible ? 'Showing Only Eligible' : 'Filter Eligible for Me'}
          </button>
        </div>

        {/* Layout: sidebar + feed */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Filter panel */}
          <FilterPanel
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            resultCount={filteredJobs.length}
            totalCount={DEMO_JOBS.length}
          />

          {/* Job feed */}
          <div className="flex-1 min-w-0 w-full">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <strong className="text-slate-800 dark:text-slate-200">{filteredJobs.length}</strong>{' '}
                of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{DEMO_JOBS.length}</strong>{' '}
                verified Gujarat recruitments
                {onlyEligible && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1.5">
                    (Matching GAD age &amp; qualification)
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <RotateCcw size={12} />
                  Reset all filters
                </button>
              )}
            </div>

            {filteredJobs.length === 0 ? (
              <EmptyState
                query={filters.query}
                hasFilters={hasActiveFilters}
                onReset={resetAll}
              />
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
              >
                {filteredJobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="slide-up"
                    style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                  >
                    <JobCard
                      job={job}
                      selectedEducation={selectedEducation}
                      onClick={() => setSelectedJob(job)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          selectedEducation={selectedEducation}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </main>
  );
}

function StatPill({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`flex items-center gap-1.5 text-sm font-bold ${
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
        }`}
      >
        {icon}
        <span>{value}</span>
      </div>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
