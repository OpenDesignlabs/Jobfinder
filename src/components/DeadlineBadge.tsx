// ============================================================
// DeadlineBadge Component
// ============================================================
import { Clock, CheckCircle } from 'lucide-react';
import { getDeadlineInfo } from '../utils/dateUtils';
import { clsx } from 'clsx';

interface DeadlineBadgeProps {
  applicationEnd: string;
  status: string;
}

export function DeadlineBadge({ applicationEnd, status }: DeadlineBadgeProps) {
  const info = getDeadlineInfo(applicationEnd);

  if (info.expired || status === 'closed' || status === 'result_declared') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <CheckCircle size={11} />
        {info.expired ? 'Deadline passed' : 'Closed'}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium',
        info.urgency === 'critical' && 'text-red-600 dark:text-red-400',
        info.urgency === 'warning' && 'text-orange-500 dark:text-orange-400',
        info.urgency === 'normal' && 'text-slate-500 dark:text-slate-400',
      )}
    >
      <Clock size={11} />
      {info.label}
    </span>
  );
}
