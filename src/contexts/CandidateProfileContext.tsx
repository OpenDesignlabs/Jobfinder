// ============================================================
// CandidateProfile Context
// Stores the user's profile (age, DOB, education, GAD category)
// and persists to localStorage.
// ============================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CandidateProfile, GujaratCategory } from '../types/job';

interface CandidateProfileContextValue {
  profile: CandidateProfile;
  updateProfile: (updates: Partial<CandidateProfile>) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: CandidateProfile = {
  age: 26,
  dob: '2000-05-15',
  category: 'RESERVED_M',
  education: 'GRADUATE',
  isPwd: false,
  isExServiceman: false,
};

const CandidateProfileContext = createContext<CandidateProfileContextValue>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  resetProfile: () => {},
});

const STORAGE_KEY = 'jobdirect_candidate_profile_v1';

export function CandidateProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Recalculate age from DOB whenever DOB changes
  function updateProfile(updates: Partial<CandidateProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (updates.dob) {
        const birthDate = new Date(updates.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        next.age = Math.max(0, age);
      }
      return next;
    });
  }

  function resetProfile() {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <CandidateProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </CandidateProfileContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useCandidateProfile() {
  return useContext(CandidateProfileContext);
}

export const CATEGORY_LABELS: Record<GujaratCategory, string> = {
  GEN_M: 'General (Male) — Base Age',
  RESERVED_M: 'SEBC / SC / ST / EWS (Male) (+5 Yrs)',
  GEN_F: 'General (Female) (+5 Yrs)',
  RESERVED_F: 'SEBC / SC / ST / EWS (Female) (+10 Yrs, Max 45)',
};

export const GUJARAT_EDU_LABELS: Record<string, string> = {
  ANY: 'Any Qualification (Show All)',
  HSC: '12th Pass (HSC)',
  GRADUATE: 'Graduate (Any Stream)',
  TECH_DIPLOMA: 'Diploma / B.E. Civil / Electrical / IT',
  NURSING: 'B.Sc. Nursing / GNM / Lab / FHW',
  COMMERCE_PG: 'B.Com / M.Com / CA / MBA',
};
