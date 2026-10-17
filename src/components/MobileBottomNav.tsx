// ============================================================
// Mobile Bottom Navigation Bar (Capacitor & Mobile Web)
// Provides quick 1-thumb native navigation on mobile devices.
// ============================================================

import { Briefcase, AlertCircle, Calculator, Bookmark, Bell } from 'lucide-react';
import { useSavedJobs } from '../contexts/SavedJobsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DEMO_JOBS } from '../data/jobs';
import type { NavPage } from './Navbar';

interface MobileBottomNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const { savedIds } = useSavedJobs();
  const { t } = useLanguage();

  // Corrigenda count
  const totalCorrigenda = DEMO_JOBS.reduce(
    (count, job) => count + (job.corrigenda ? job.corrigenda.length : 0),
    0
  );

  function handleSelect(page: NavPage) {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navItems: { page: NavPage; label: string; icon: typeof Briefcase; badge?: number }[] = [
    { page: 'dashboard', label: t('Jobs', 'ભરતી'), icon: Briefcase },
    { page: 'calculator', label: t('Calculator', 'પાત્રતા'), icon: Calculator },
    { page: 'corrigenda', label: t('Corrigenda', 'સુધારા'), icon: AlertCircle, badge: totalCorrigenda },
    { page: 'saved', label: t('Vault', 'વૉલ્ટ'), icon: Bookmark, badge: savedIds.length },
    { page: 'notifications', label: t('Alerts', 'સૂચના'), icon: Bell },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ page, label, icon: Icon, badge }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => handleSelect(page)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all select-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`}
                />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
