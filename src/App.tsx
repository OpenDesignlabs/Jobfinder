import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <Navbar />
        <DashboardPage />
        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="text-center sm:text-left">
                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Job<span className="text-blue-600 dark:text-blue-400">Direct</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  An independent platform for Indian government job seekers
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
                <span>Not affiliated with any government body</span>
                <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                <span>No advertisements</span>
                <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                <span>No spam</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed">
                All listings shown are for demonstration purposes only. Vacancy counts, deadlines,
                salaries, and fees shown are illustrative references. Always verify information at
                official government websites before applying.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
