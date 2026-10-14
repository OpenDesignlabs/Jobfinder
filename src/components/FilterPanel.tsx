// ============================================================
// FilterPanel Component
// ============================================================
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { FilterState, SortOption, EducationFilter, SectorFilter, RecruitmentStatus } from '../types/job';
import {
  EDUCATION_LABELS,
  SECTOR_LABELS,
  STATUS_LABELS,
  SORT_LABELS,
  SECTOR_ICONS,
} from '../utils/filterUtils';
import { clsx } from 'clsx';

interface FilterPanelProps {
  filters: FilterState;
  sort: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  totalCount: number;
}

const EDUCATION_OPTIONS: EducationFilter[] = ['10th', '12th_general', '12th_pcm', 'iti_diploma', 'graduate'];
const SECTOR_OPTIONS: SectorFilter[] = ['railways', 'ssc', 'defense_police', 'banking', 'state_govt'];
const STATUS_OPTIONS: RecruitmentStatus[] = ['open', 'upcoming', 'closing_soon', 'closed', 'result_declared', 'on_hold'];

function FilterChip<T extends string>({
  value,
  label,
  selected,
  onToggle,
  icon,
}: {
  value: T;
  label: string;
  selected: boolean;
  onToggle: (v: T) => void;
  icon?: string;
}) {
  return (
    <button
      onClick={() => onToggle(value)}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        selected
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500',
      )}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        <span>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  const activeCount =
    filters.education.length + filters.sectors.length + filters.status.length;

  function toggleEducation(v: EducationFilter) {
    const next = filters.education.includes(v)
      ? filters.education.filter((e) => e !== v)
      : [...filters.education, v];
    onFiltersChange({ ...filters, education: next });
  }

  function toggleSector(v: SectorFilter) {
    const next = filters.sectors.includes(v)
      ? filters.sectors.filter((s) => s !== v)
      : [...filters.sectors, v];
    onFiltersChange({ ...filters, sectors: next });
  }

  function toggleStatus(v: RecruitmentStatus) {
    const next = filters.status.includes(v)
      ? filters.status.filter((s) => s !== v)
      : [...filters.status, v];
    onFiltersChange({ ...filters, status: next });
  }

  function clearAll() {
    onFiltersChange({ query: filters.query, education: [], sectors: [], status: [] });
  }

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-4 sticky top-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <SlidersHorizontal size={15} className="text-blue-500" />
            Filters
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
          Showing <strong className="text-slate-800 dark:text-slate-200">{resultCount}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> jobs
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
            Sort by
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        {/* Education */}
        <Section title="Education Qualification">
          {EDUCATION_OPTIONS.map((v) => (
            <FilterChip
              key={v}
              value={v}
              label={EDUCATION_LABELS[v]}
              selected={filters.education.includes(v)}
              onToggle={toggleEducation}
            />
          ))}
        </Section>

        {/* Sector */}
        <Section title="Sector">
          {SECTOR_OPTIONS.map((v) => (
            <FilterChip
              key={v}
              value={v}
              label={SECTOR_LABELS[v]}
              selected={filters.sectors.includes(v)}
              onToggle={toggleSector}
              icon={SECTOR_ICONS[v]}
            />
          ))}
        </Section>

        {/* Status */}
        <Section title="Recruitment Status" defaultOpen={false}>
          {STATUS_OPTIONS.map((v) => (
            <FilterChip
              key={v}
              value={v}
              label={STATUS_LABELS[v]}
              selected={filters.status.includes(v)}
              onToggle={toggleStatus}
            />
          ))}
        </Section>
      </div>
    </aside>
  );
}
