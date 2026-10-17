// ============================================================
// Notifications & Alerts Page (spec §11 & §3 Page 6)
// Shows: what changed, when, which source confirms it,
// and whether the candidate should review their saved application.
// ============================================================
import { useState, useMemo } from 'react';
import { Bell, BellOff, AlertTriangle, CheckCircle2, Clock, Info, CalendarClock, Award, FileText } from 'lucide-react';
import type { NotificationEvent, NotificationEventType } from '../types/job';
import { DEMO_JOBS } from '../data/jobs';
import { clsx } from 'clsx';

// ── Demo notifications (populated from corrigenda in live data) ──
function buildDemoNotifications(): NotificationEvent[] {
  const notifications: NotificationEvent[] = [];

  // Build from corrigenda in demo jobs
  for (const job of DEMO_JOBS) {
    for (const corr of (job.corrigenda ?? [])) {
      const eventType: NotificationEventType =
        corr.category === 'DEADLINE' ? 'deadline_change' :
        corr.category === 'ELIGIBILITY' ? 'rule_change' :
        corr.category === 'VACANCY' ? 'rule_change' :
        'rule_change';

      notifications.push({
        id: `NOT-${corr.corrId}`,
        user_id: 'demo',
        recruitment_id: job.id,
        version_id: null,
        event_type: eventType,
        deduplication_key: `demo::${job.id}::${corr.corrId}::${eventType}`,
        title: `${job.agency}: ${corr.type}`,
        body: `${corr.afterText}${corr.summaryGuj ? `\n\n${corr.summaryGuj}` : ''}`,
        delivery_status: 'delivered',
        sent_at: corr.date,
        created_at: corr.date,
      });
    }
  }

  // Sort by date descending
  return notifications.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

const EVENT_TYPE_CONFIG: Record<NotificationEventType, { label: string; icon: React.ReactNode; color: string }> = {
  new_match: {
    label: 'New Match',
    icon: <CheckCircle2 size={14} />,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  deadline_change: {
    label: 'Deadline Changed',
    icon: <CalendarClock size={14} />,
    color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
  },
  rule_change: {
    label: 'Rule / Eligibility Change',
    icon: <AlertTriangle size={14} />,
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  },
  cancellation: {
    label: 'Recruitment Cancelled',
    icon: <BellOff size={14} />,
    color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
  },
  admit_card: {
    label: 'Admit Card',
    icon: <FileText size={14} />,
    color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  },
  exam_schedule: {
    label: 'Exam Schedule',
    icon: <Clock size={14} />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  result_published: {
    label: 'Result Published',
    icon: <Award size={14} />,
    color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
  },
  user_reminder: {
    label: 'Reminder',
    icon: <Bell size={14} />,
    color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  },
};

type FilterType = NotificationEventType | 'all';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Alerts' },
  { value: 'deadline_change', label: 'Deadline Changes' },
  { value: 'rule_change', label: 'Rule / Eligibility' },
  { value: 'new_match', label: 'New Matches' },
  { value: 'cancellation', label: 'Cancellations' },
  { value: 'admit_card', label: 'Admit Cards' },
  { value: 'exam_schedule', label: 'Exam Schedules' },
  { value: 'result_published', label: 'Results' },
];

function getJobInfo(recruitmentId: string | null | undefined) {
  if (!recruitmentId) return null;
  const job = DEMO_JOBS.find(j => j.id === recruitmentId);
  return job ? { title: job.title, agency: job.agency, agencyFull: job.agencyFull, officialBoardUrl: job.officialBoardUrl } : null;
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const allNotifications = useMemo(() => buildDemoNotifications(), []);

  const filtered = useMemo(() =>
    filter === 'all'
      ? allNotifications
      : allNotifications.filter(n => n.event_type === filter),
    [allNotifications, filter],
  );

  const unreadCount = allNotifications.filter(n => !readIds.has(n.id)).length;

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]));
  }

  function markAllRead() {
    setReadIds(new Set(allNotifications.map(n => n.id)));
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={18} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Alerts & Recruitment Updates
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Verified changes to deadlines, eligibility rules, exam schedules, and results —
            each confirmed against the official source before alerting.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Info banner — spec §3: explain what each alert is */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <span>
          Every alert is generated from a <strong>verified event</strong> — a confirmed change to an official
          recruitment document. No alert is sent unless the change is verified against the official portal.
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all',
              filter === opt.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> of{' '}
        <strong className="text-slate-800 dark:text-slate-200">{allNotifications.length}</strong> alerts
      </p>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <BellOff size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No alerts match the selected filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notification => {
            const cfg = EVENT_TYPE_CONFIG[notification.event_type] ?? EVENT_TYPE_CONFIG.user_reminder;
            const isRead = readIds.has(notification.id);
            const jobInfo = getJobInfo(notification.recruitment_id);

            return (
              <div
                key={notification.id}
                id={`notif-${notification.id}`}
                className={clsx(
                  'bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm transition-all',
                  isRead
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-blue-200 dark:border-blue-800 shadow-blue-50 dark:shadow-none',
                )}
              >
                <div className="p-4 flex items-start gap-3">
                  {/* Unread dot */}
                  {!isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Type badge + date */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide', cfg.color)}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {notification.sent_at && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {notification.sent_at}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-snug">
                      {notification.title}
                    </p>

                    {/* Linked job */}
                    {jobInfo && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        Re: <span className="font-medium text-slate-700 dark:text-slate-300">{jobInfo.title}</span>
                        {jobInfo.agencyFull && <span className="text-slate-400"> · {jobInfo.agencyFull}</span>}
                      </p>
                    )}

                    {/* Body */}
                    {notification.body && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {notification.body}
                      </p>
                    )}

                    {/* Action row */}
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      {jobInfo?.officialBoardUrl && (
                        <a
                          href={jobInfo.officialBoardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          View Official Source →
                        </a>
                      )}
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => markRead(notification.id)}
                          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery status footer */}
                <div className="px-4 pb-2 text-[10px] text-slate-400 dark:text-slate-600 flex items-center gap-1">
                  <span>Status:</span>
                  <span className="font-semibold capitalize">{notification.delivery_status}</span>
                  {notification.delivery_status === 'delivered' && (
                    <CheckCircle2 size={10} className="text-emerald-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spec note */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xl mx-auto">
          JobDirect never claims that an email or push notification was read merely because the provider accepted it.
          Delivery status reflects the last known state from the notification channel.
        </p>
      </div>
    </main>
  );
}
