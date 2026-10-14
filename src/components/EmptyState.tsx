// ============================================================
// EmptyState Component
// ============================================================
import { SearchX, RefreshCcw } from 'lucide-react';

interface EmptyStateProps {
  query: string;
  hasFilters: boolean;
  onReset: () => void;
}

export function EmptyState({ query, hasFilters, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <SearchX size={28} className="text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-lg mb-2">No jobs found</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
        {query
          ? `No results for "${query}". Try a different keyword.`
          : 'No jobs match the selected filters. Try adjusting your filters.'}
        {hasFilters && ' You can also clear all filters to see all available listings.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCcw size={14} />
          Reset Filters
        </button>
      )}
    </div>
  );
}
