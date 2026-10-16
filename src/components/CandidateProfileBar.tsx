// ============================================================
// CandidateProfileBar Component
// Gujarat GAD Eligibility Engine Profile Input
// Allows the user to configure age, category, education, PwD/Ex-Serviceman
// and see their effective age relaxation computed in real time.
// ============================================================
import { useCandidateProfile, CATEGORY_LABELS, GUJARAT_EDU_LABELS } from '../contexts/CandidateProfileContext';
import { getCategoryRelaxationYears, getProfileSummaryText } from '../utils/gadEligibilityUtils';
import { Shield, RotateCcw } from 'lucide-react';

export function CandidateProfileBar() {
  const { profile, updateProfile, resetProfile } = useCandidateProfile();
  const relaxYears = getCategoryRelaxationYears(profile);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={15} className="text-indigo-600 dark:text-indigo-400" />
            Candidate Profile &amp; Gujarat GAD Rule-Based Eligibility Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatically computes Gujarat GAD age relaxations (SEBC/SC/ST/EWS, Women, PwD, Ex-Servicemen),
            qualification match, and manual-review exceptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-700">
            {getProfileSummaryText(profile)}
          </span>
          <button
            type="button"
            onClick={resetProfile}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            <RotateCcw size={11} />
            Reset Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Education */}
        <div>
          <label htmlFor="profile-edu" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Highest Qualification
          </label>
          <select
            id="profile-edu"
            value={profile.education}
            onChange={(e) => updateProfile({ education: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(GUJARAT_EDU_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Age + DOB */}
        <div>
          <label htmlFor="profile-age" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Your Age / Date of Birth
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="profile-age"
              type="number"
              min={17}
              max={58}
              value={profile.age}
              onChange={(e) => updateProfile({ age: Number(e.target.value) })}
              className="w-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              id="profile-dob"
              type="date"
              value={profile.dob}
              aria-label="Date of Birth"
              title="Enter DOB to auto-calculate exact age"
              onChange={(e) => updateProfile({ dob: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="profile-category" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Category (GAD Relaxation)
          </label>
          <select
            id="profile-category"
            value={profile.category}
            onChange={(e) => updateProfile({ category: e.target.value as any })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Special relaxations */}
        <div>
          <p className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Special Relaxations
          </p>
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="profile-pwd"
                type="checkbox"
                checked={profile.isPwd}
                onChange={(e) => updateProfile({ isPwd: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              />
              PwD / Divyang (+10 Yrs)
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="profile-exsm"
                type="checkbox"
                checked={profile.isExServiceman}
                onChange={(e) => updateProfile({ isExServiceman: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-indigo-600"
              />
              Ex-Serviceman (+3 Yrs)
            </label>
            {relaxYears > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Total relaxation: +{relaxYears} Yrs
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
