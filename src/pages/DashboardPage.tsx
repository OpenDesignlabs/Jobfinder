// ============================================================
// Dashboard Page – main job feed
// ============================================================
import { useState, useMemo } from 'react';
import { Info, TrendingUp, Users, Building2, RotateCcw } from 'lucide-react';
import type { FilterState, SortOption, Job, EducationFilter } from '../types/job';
import { DEMO_JOBS } from '../data/jobs';
import { filterJobs, sortJobs } from '../utils/filterUtils';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { JobCard } from '../components/JobCard';
import { JobDetailModal } from '../components/JobDetailModal';
import { EmptyState } from '../components/EmptyState';

const INITIAL_FILTERS: FilterState = {
  query: '',
  education: [],
  sectors: [],
  status: [],
};

// Compute quick stats for the hero area
const TOTAL_VACANCIES = DEMO_JOBS.reduce((s, j) => s + j.totalVacancies, 0);
const OPEN_JOBS = DEMO_JOBS.filter((j) => j.status === 'open' || j.status === 'closing_soon').length;
const SECTORS_COUNT = new Set(DEMO_JOBS.map((j) => j.sector)).size;

export function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortOption>('deadline_asc');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    const filtered = filterJobs(DEMO_JOBS, filters);
    return sortJobs(filtered, sort);
  }, [filters, sort]);

  const hasActiveFilters =
    filters.education.length > 0 ||
    filters.sectors.length > 0 ||
    filters.status.length > 0 ||
    filters.query.trim().length > 0;

  function resetAll() {
    setFilters(INITIAL_FILTERS);
  }

  const selectedEducation: EducationFilter[] = filters.education;

  return (
    <main>
      {/* ── Hero Section ── */}
      <div className="hero-gradient border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              Find Your{' '}
              <span className="text-blue-600 dark:text-blue-400">Government Job</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Discover government &amp; public-sector recruitment opportunities without spam or
              misleading ads. Clean data. Official sources only.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-6 sm:gap-10 mb-8 flex-wrap">
            <StatPill icon={<TrendingUp size={14} />} label="Total Vacancies" value={TOTAL_VACANCIES.toLocaleString('en-IN')} />
            <StatPill icon={<Building2 size={14} />} label="Active Listings" value={`${OPEN_JOBS}`} />
            <StatPill icon={<Users size={14} />} label="Sectors Covered" value={`${SECTORS_COUNT}`} />
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto mb-4">
            <SearchBar
              value={filters.query}
              onChange={(q) => setFilters((f) => ({ ...f, query: q }))}
            />
          </div>

          {/* Demo notice */}
          <div className="max-w-3xl mx-auto flex gap-2.5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/60 rounded-xl p-3 sm:p-3.5">
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong>Demo mode:</strong> All listings are illustrative examples only. Vacancies,
              deadlines, salaries, and fees are for demonstration purposes. Always check official
              recruiting body websites for current information.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + feed ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <strong className="text-slate-800 dark:text-slate-200">{filteredJobs.length}</strong>{' '}
                of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{DEMO_JOBS.length}</strong>{' '}
                listings
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
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))' }}
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

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-bold">
        {icon}
        <span>{value}</span>
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
    </div>
  );
}
