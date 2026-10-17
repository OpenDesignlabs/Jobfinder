// ============================================================
// Navbar Component
// Primary navigation header with tab switching, Corrigenda badge,
// Saved applications count, theme toggle, and mobile menu.
// ============================================================
import { useState } from 'react';
import {
  Briefcase,
  AlertCircle,
  Bookmark,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSavedJobs } from '../contexts/SavedJobsContext';
import { DEMO_JOBS } from '../data/jobs';

export type NavPage = 'dashboard' | 'corrigenda' | 'saved' | 'notifications' | 'admin';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { savedIds } = useSavedJobs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate total corrigenda count
  const totalCorrigenda = DEMO_JOBS.reduce(
    (count, job) => count + (job.corrigenda ? job.corrigenda.length : 0),
    0,
  );

  function handleNav(page: NavPage) {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Job<span className="text-blue-600 dark:text-blue-400">Direct</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                GUJARAT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-gujarati hidden sm:block">
              સત્તાવાર ગુજરાત ભરતી પોર્ટલ
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase size={15} />
            <span>Recruitments</span>
          </button>

          <button
            onClick={() => handleNav('corrigenda')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'corrigenda'
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertCircle size={15} />
            <span>Corrigendum Monitor</span>
            {totalCorrigenda > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                {totalCorrigenda}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'saved'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark size={15} />
            <span>Saved &amp; Vault</span>
            {savedIds.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {savedIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'notifications'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell size={15} />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'admin'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Admin Studio</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick saved pill for mobile */}
          <button
            onClick={() => handleNav('saved')}
            className="md:hidden relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Saved Applications"
          >
            <Bookmark size={18} />
            {savedIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {savedIds.length}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5 shadow-xl">
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left ${
              currentPage === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase size={16} /> Recruitments (ભરતીઓ)
            </span>
            <span className="text-xs text-slate-400">{DEMO_JOBS.length} Verified</span>
          </button>

          <button
            onClick={() => handleNav('corrigenda')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left ${
              currentPage === 'corrigenda'
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={16} /> Corrigendum Monitor (સુધારા જાહેરાત)
            </span>
            {totalCorrigenda > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                {totalCorrigenda}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('saved')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left ${
              currentPage === 'saved'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark size={16} /> Saved Applications &amp; Vault
            </span>
            {savedIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {savedIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('notifications')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left ${
              currentPage === 'notifications'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bell size={16} /> Alerts & Updates (સૂચનાઓ)
            </span>
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left ${
              currentPage === 'admin'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} /> Admin / Publisher Studio
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
              API
            </span>
          </button>
        </div>
      )}
    </header>
  );
}
