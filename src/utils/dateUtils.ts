// ============================================================
// Date / Deadline utilities – Indian Standard Time (IST = UTC+5:30)
// ============================================================

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Parse an ISO date string as end-of-day (23:59:59) IST */
export function parseDeadline(dateStr: string): Date {
  // dateStr format: 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split('-').map(Number);
  // End of day in IST — convert to UTC
  const istMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  return new Date(istMs - IST_OFFSET_MS);
}

/** Current time in IST */
export function nowIST(): Date {
  return new Date(Date.now());
}

export interface DeadlineInfo {
  expired: boolean;
  daysLeft: number;
  hoursLeft: number;
  label: string;
  urgency: 'expired' | 'critical' | 'warning' | 'normal';
}

export function getDeadlineInfo(applicationEnd: string): DeadlineInfo {
  const deadline = parseDeadline(applicationEnd);
  const now = nowIST();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { expired: true, daysLeft: 0, hoursLeft: 0, label: 'Deadline passed', urgency: 'expired' };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(totalHours / 24);
  const hoursLeft = totalHours % 24;

  let label: string;
  let urgency: DeadlineInfo['urgency'];

  if (daysLeft === 0) {
    label = `${hoursLeft}h left`;
    urgency = 'critical';
  } else if (daysLeft <= 3) {
    label = `${daysLeft}d ${hoursLeft}h left`;
    urgency = 'critical';
  } else if (daysLeft <= 7) {
    label = `${daysLeft} days left`;
    urgency = 'warning';
  } else {
    label = `${daysLeft} days left`;
    urgency = 'normal';
  }

  return { expired: false, daysLeft, hoursLeft, label, urgency };
}

/** Format an ISO date string as a human-readable date (e.g. "14 Oct 2024") */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'TBA';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Compare two ISO date strings for sorting */
export function compareDates(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}
