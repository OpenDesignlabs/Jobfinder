// ============================================================
// OfficialLinkButton Component
// ============================================================
// Safety rules:
// - Only opens URLs from the job's OfficialLinks object.
// - Never uses URL shorteners or redirects.
// - If a link is not provided or not verified, shows a disabled state.
// - Opens in new tab with rel="noopener noreferrer".
// ============================================================

import { ExternalLink, FileText, Globe, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface OfficialLinkButtonProps {
  href?: string;
  label: string;
  icon: 'pdf' | 'apply' | 'website';
  verified?: boolean;
  variant?: 'primary' | 'secondary';
}

const ICONS = {
  pdf: FileText,
  apply: ExternalLink,
  website: Globe,
};

export function OfficialLinkButton({
  href,
  label,
  icon,
  verified = false,
  variant = 'secondary',
}: OfficialLinkButtonProps) {
  const Icon = ICONS[icon];
  const available = !!href;

  if (!available) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm cursor-not-allowed"
        title="Link not yet verified – check the official recruiting body website directly."
      >
        <AlertCircle size={15} />
        <span>{label}</span>
        <span className="text-xs">(Not available)</span>
      </div>
    );
  }

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    // Safety: validate that the URL is a real http/https URL (not javascript: or data:)
    try {
      const url = new URL(href!);
      if (!['http:', 'https:'].includes(url.protocol)) {
        alert('This link has an unsupported protocol and cannot be opened.');
        return;
      }
    } catch {
      alert('Invalid URL. Please visit the official website directly.');
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: href! });
      } else {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
        variant === 'primary'
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400',
      )}
    >
      <Icon size={15} />
      <span>{label}</span>
      {!verified && (
        <span className="text-[10px] opacity-60">(Unverified)</span>
      )}
    </button>
  );
}
