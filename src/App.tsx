// ============================================================
// Main Application Component
// Providers: Theme, Language (Bilingual v2), CandidateProfile (GAD Engine), SavedJobs (Tracker)
// Navigation: Dashboard, GAD Calculator, Corrigenda Monitor,
//             Saved Applications & Vault, Alerts, Admin Studio
// ============================================================

import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { CandidateProfileProvider } from './contexts/CandidateProfileContext';
import { SavedJobsProvider } from './contexts/SavedJobsContext';
import { Navbar, type NavPage } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { EligibilityCalculatorPage } from './pages/EligibilityCalculatorPage';
import { CorrigendumPage } from './pages/CorrigendumPage';
import { SavedPage } from './pages/SavedPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const { isGujarati, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col justify-between pb-16 md:pb-0">
      <div>
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'calculator' && <EligibilityCalculatorPage />}
        {currentPage === 'corrigenda' && <CorrigendumPage />}
        {currentPage === 'saved' && <SavedPage />}
        {currentPage === 'notifications' && <NotificationsPage />}
        {currentPage === 'admin' && <AdminPage />}
      </div>

      <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

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
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {isGujarati ? 'ગુજરાત સંસ્કરણ' : 'Gujarat Edition'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-gujarati">
                {t(
                  'Gujarat Recruitment Intelligence & GAD Rule-Based Application Platform',
                  'ગુજરાત ભરતી માહિતી, સરકારી ગેઝેટ પ્રમાણીકરણ અને GAD નિયમ-આધારિત પાત્રતા પોર્ટલ'
                )}
              </p>
            </div>

            {/* Guarantees */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap justify-center font-medium">
              <span>{t('No Commercial Ads', 'જાહેરાત મુક્ત')}</span>
              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <span>{t('Official Notifications Only', 'માત્ર સત્તાવાર જાહેરાતો')}</span>
              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <span>{t('Gujarat GAD Compliance', 'ગુજરાત સરકાર નિયમ પાલન')}</span>
              <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <span>{t('3-Valued Eligibility Engine', 'ત્રિ-સ્તરીય પાત્રતા એન્જિન')}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-3xl mx-auto leading-relaxed font-gujarati">
              {t(
                "JobDirect is an independent recruitment discovery platform for candidates in Gujarat. All data is verified against official gazette notifications published on official portals including ojas.gujarat.gov.in, gpsc.gujarat.gov.in, and gsssb.gujarat.gov.in. Candidates must verify application details on official recruiting body websites before applying. Eligibility assessments are indicative — the recruiting authority's decision takes precedence.",
                "JobDirect એ ગુજરાતના ઉમેદવારો માટે એક સ્વતંત્ર ભરતી માહિતી પ્લેટફોર્મ છે. તમામ વિગતો ojas.gujarat.gov.in, gpsc.gujarat.gov.in અને gsssb.gujarat.gov.in સહિતના સત્તાવાર પોર્ટલ પર પ્રસિદ્ધ ગેઝેટ જાહેરાતો સાથે ચકાસાયેલ છે. અરજી કરતાં પહેલાં ઉમેદવારે સંબંધિત બોર્ડની સત્તાવાર વેબસાઇટ પરથી વિગતોની ખાતરી કરવી. પાત્રતા ગણતરી સૂચક છે — સક્ષમ ભરતી બોર્ડનો આખરી નિર્ણય માન્ય રહેશે."
              )}
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
      <LanguageProvider>
        <CandidateProfileProvider>
          <SavedJobsProvider>
            <AppContent />
          </SavedJobsProvider>
        </CandidateProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
