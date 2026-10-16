// ============================================================
// CandidateContext – Gujarat GAD Rule-Based Eligibility Engine
// Manages candidate profile and computes GAD age relaxations.
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CandidateProfile, GenderCategory, GADEligibilityInfo, GADEligibilityStatus, Job } from '../types/job';

// ---- Language mode ------------------------------------------------------

export type LangMode = 'bilingual' | 'gujarati' | 'english';

// ---- Context type -------------------------------------------------------

interface CandidateContextValue {
  profile: CandidateProfile;
  langMode: LangMode;
  setAge: (age: number) => void;
  setDob: (dob: string) => void;
  setCategory: (cat: GenderCategory) => void;
  setIsPwd: (v: boolean) => void;
  setIsExServiceman: (v: boolean) => void;
  setEducation: (edu: string) => void;
  setLangMode: (mode: LangMode) => void;
  resetProfile: () => void;
  getCategoryRelaxationYears: () => number;
  evaluateGADEligibility: (job: Job) => GADEligibilityInfo;
}

// ---- Default profile ----------------------------------------------------

const DEFAULT_PROFILE: CandidateProfile = {
  age: 26,
  dob: '2000-05-15',
  category: 'RESERVED_M',
  isPwd: false,
  isExServiceman: false,
  education: 'GRADUATE',
};

// ---- Context creation ---------------------------------------------------

const CandidateContext = createContext<CandidateContextValue | null>(null);

// ---- Provider -----------------------------------------------------------

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    try {
      const raw = localStorage.getItem('jobdirect_candidate_profile_v1');
      if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return DEFAULT_PROFILE;
  });

  const [langMode, setLangModeState] = useState<LangMode>(() => {
    try {
      const raw = localStorage.getItem('jobdirect_lang_mode_v1');
      if (raw === 'bilingual' || raw === 'gujarati' || raw === 'english') return raw;
    } catch { /* ignore */ }
    return 'bilingual';
  });

  // Persist profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobdirect_candidate_profile_v1', JSON.stringify(profile));
    } catch { /* ignore */ }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('jobdirect_lang_mode_v1', langMode);
    } catch { /* ignore */ }
  }, [langMode]);

  const setAge = useCallback((age: number) => setProfile(p => ({ ...p, age })), []);
  const setDob = useCallback((dob: string) => {
    // Auto-compute age from DOB
    if (dob) {
      const dobDate = new Date(dob);
      const refDate = new Date();
      let years = refDate.getFullYear() - dobDate.getFullYear();
      const m = refDate.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && refDate.getDate() < dobDate.getDate())) years--;
      if (years >= 16 && years <= 65) {
        setProfile(p => ({ ...p, dob, age: years }));
      } else {
        setProfile(p => ({ ...p, dob }));
      }
    } else {
      setProfile(p => ({ ...p, dob }));
    }
  }, []);

  const setCategory = useCallback((category: GenderCategory) =>
    setProfile(p => ({ ...p, category })), []);
  const setIsPwd = useCallback((isPwd: boolean) =>
    setProfile(p => ({ ...p, isPwd })), []);
  const setIsExServiceman = useCallback((isExServiceman: boolean) =>
    setProfile(p => ({ ...p, isExServiceman })), []);
  const setEducation = useCallback((education: string) =>
    setProfile(p => ({ ...p, education })), []);
  const setLangMode = useCallback((mode: LangMode) => setLangModeState(mode), []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setLangModeState('bilingual');
  }, []);

  // ---- GAD Rules Engine ------------------------------------------------

  const getCategoryRelaxationYears = useCallback((): number => {
    let years = 0;
    if (profile.category === 'RESERVED_M' || profile.category === 'GEN_F') years += 5;
    else if (profile.category === 'RESERVED_F') years += 10;
    if (profile.isPwd) years += 10;
    if (profile.isExServiceman) years += 3;
    return years;
  }, [profile.category, profile.isPwd, profile.isExServiceman]);

  const evaluateGADEligibility = useCallback((job: Job): GADEligibilityInfo => {
    // Use Gujarat-specific fields if available, fall back to generic ageLimit
    const minAge = job.minAge ?? job.ageLimit.min;
    const maxAgeBase = job.maxAgeBase ?? job.ageLimit.max;
    const requiredEdu = job.requiredEdu ?? [];

    const relaxYears = getCategoryRelaxationYears();
    const effectiveMaxAge = Math.min(45, maxAgeBase + relaxYears);

    const ageMinOk = profile.age >= minAge;
    const ageMaxOk = profile.age <= effectiveMaxAge;
    const usedRelaxation = profile.age > maxAgeBase && ageMaxOk;

    const eduOk =
      profile.education === 'ANY' ||
      requiredEdu.length === 0 ||
      requiredEdu.includes(profile.education);

    let status: GADEligibilityStatus = 'ELIGIBLE';
    let badgeText = '✓ Eligible (Standard Match)';
    let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
    let reason = `Age ${profile.age} fits ${minAge}–${effectiveMaxAge} yrs; qualification matches.`;

    if (!ageMinOk || !ageMaxOk) {
      status = 'INELIGIBLE_AGE';
      badgeText = `✕ Age Out of Range (${minAge}–${effectiveMaxAge} yrs)`;
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
      reason = `Your age (${profile.age}) is outside the ${minAge}–${effectiveMaxAge} yr limit under Gujarat GAD rules.`;
    } else if (!eduOk) {
      status = 'INELIGIBLE_EDU';
      badgeText = '⚠ Qualification Mismatch';
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
      reason = job.eduSummaryEn
        ? `Requires: ${job.eduSummaryEn.split('.')[0]}.`
        : 'Qualification does not match the requirement for this post.';
    } else if (usedRelaxation) {
      status = 'ELIGIBLE_RELAXED';
      badgeText = `✓ Eligible via +${relaxYears} Yr GAD Relaxation`;
      badgeClass = 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700';
      reason = `Base max age is ${maxAgeBase}, extended to ${effectiveMaxAge} yrs (capped at 45). Valid category/relaxation certificate required.`;
    }

    return { status, isEligible: status === 'ELIGIBLE' || status === 'ELIGIBLE_RELAXED', effectiveMaxAge, relaxYears, usedRelaxation, badgeText, badgeClass, reason };
  }, [profile.age, profile.education, getCategoryRelaxationYears]);

  return (
    <CandidateContext.Provider value={{
      profile, langMode,
      setAge, setDob, setCategory, setIsPwd, setIsExServiceman, setEducation,
      setLangMode, resetProfile, getCategoryRelaxationYears, evaluateGADEligibility,
    }}>
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate() {
  const ctx = useContext(CandidateContext);
  if (!ctx) throw new Error('useCandidate must be used within CandidateProvider');
  return ctx;
}
