// ============================================================
// Main Application Component
// Providers: Theme, CandidateProfile (GAD Engine), SavedJobs (Tracker)
// Navigation: Dashboard, Corrigenda Monitor, Saved Applications & Vault, Admin Studio
// ============================================================
import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CandidateProfileProvider } from './contexts/CandidateProfileContext';
import { SavedJobsProvider } from './contexts/SavedJobsContext';
import { Navbar, type NavPage } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CorrigendumPage } from './pages/CorrigendumPage';
import { SavedPage } from './pages/SavedPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col justify-between">
      <div>
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'corrigenda' && <CorrigendumPage />}
        {currentPage === 'saved' && <SavedPage />}
        {currentPage === 'admin' && <AdminPage />}
      </div>

      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Brand & Mission */}
            <div className="text-center sm:text-left">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                Job<span className="text-blue-600 dark:text-blue-400">Direct</span>
                <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                  examsuchana.in
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gujarat Recruitment Intelligence &amp; GAD Rule-Based Application Platform
              </p>
            </div>

            {/* Guarantees */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap justify-center">
              <span>No Commercial Ads</span>
              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <span>Official Notifications Only</span>
              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <span>Gujarat GAD Compliance</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-3xl mx-auto leading-relaxed">
              JobDirect is an independent recruitment discovery platform for candidates in Gujarat.
              All data is verified against official gazette notifications published on official portals
              including ojas.gujarat.gov.in, gpsc.gujarat.gov.in, and gsssb.gujarat.gov.in.
              Candidates must verify application details on official recruiting body websites before applying.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CandidateProfileProvider>
        <SavedJobsProvider>
          <AppContent />
        </SavedJobsProvider>
      </CandidateProfileProvider>
    </ThemeProvider>
  );
}

export default App;
