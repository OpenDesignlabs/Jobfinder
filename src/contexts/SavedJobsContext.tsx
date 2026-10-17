// ============================================================
// SavedJobs Context – Application Pipeline & Document Vault v3
// Full application state machine per spec §10.
// Persists saved job IDs, application stages (full spec states),
// checklist state, and common document vault checks to localStorage.
// ============================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ApplicationStatus } from '../types/job';
import { APPLICATION_STATUS_FLOW, APPLICATION_STATUS_LABELS } from '../types/job';

// Re-export for components that import from here
export type { ApplicationStatus };
export { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_FLOW };

/**
 * @deprecated Use ApplicationStatus from types/job.ts.
 * Kept for backward compatibility with existing components.
 */
export type ApplicationStage =
  | 'Interested'
  | 'Preparing Docs'
  | 'Applied on Portal'
  | 'Fee Paid / Confirmed'
  | 'Admit Card / Exam';

export const APPLICATION_STAGES: ApplicationStage[] = [
  'Interested',
  'Preparing Docs',
  'Applied on Portal',
  'Fee Paid / Confirmed',
  'Admit Card / Exam',
];

interface SavedJobsContextValue {
  savedIds: string[];
  jobStageById: Record<string, ApplicationStage>;
  /** Full spec application status per job id */
  jobStatusById: Record<string, ApplicationStatus>;
  checkedItems: Record<string, boolean>;
  saveJob: (id: string) => void;
  unsaveJob: (id: string) => void;
  isJobSaved: (id: string) => boolean;
  /** @deprecated use setJobStatus */
  setJobStage: (id: string, stage: ApplicationStage) => void;
  setJobStatus: (id: string, status: ApplicationStatus) => void;
  toggleCheck: (key: string) => void;
  isChecked: (key: string) => boolean;
}

const SavedJobsContext = createContext<SavedJobsContextValue>({
  savedIds: [],
  jobStageById: {},
  jobStatusById: {},
  checkedItems: {},
  saveJob: () => {},
  unsaveJob: () => {},
  isJobSaved: () => false,
  setJobStage: () => {},
  setJobStatus: () => {},
  toggleCheck: () => {},
  isChecked: () => false,
});

const STORAGE_KEY = 'jobdirect_prod_state_v3';

interface PersistedState {
  savedIds: string[];
  jobStageById: Record<string, ApplicationStage>;
  jobStatusById: Record<string, ApplicationStatus>;
  checkedItems: Record<string, boolean>;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds : [],
        jobStageById: parsed.jobStageById ?? {},
        jobStatusById: parsed.jobStatusById ?? {},
        checkedItems: parsed.checkedItems ?? {},
      };
    }
  } catch {
    // ignore
  }
  // Migrate from v2 storage
  try {
    const oldRaw = localStorage.getItem('jobdirect_prod_state_v2');
    if (oldRaw) {
      const old = JSON.parse(oldRaw) as Partial<PersistedState>;
      return {
        savedIds: Array.isArray(old.savedIds) ? old.savedIds : [],
        jobStageById: old.jobStageById ?? {},
        jobStatusById: {},
        checkedItems: old.checkedItems ?? {},
      };
    }
  } catch { /* ignore */ }
  return { savedIds: [], jobStageById: {}, jobStatusById: {}, checkedItems: {} };
}

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const initial = loadState();
  const [savedIds, setSavedIds] = useState<string[]>(initial.savedIds);
  const [jobStageById, setJobStageById] = useState<Record<string, ApplicationStage>>(initial.jobStageById);
  const [jobStatusById, setJobStatusById] = useState<Record<string, ApplicationStatus>>(initial.jobStatusById);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(initial.checkedItems);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedIds, jobStageById, jobStatusById, checkedItems }));
    } catch {
      // ignore
    }
  }, [savedIds, jobStageById, jobStatusById, checkedItems]);

  function saveJob(id: string) {
    setSavedIds((prev) => prev.includes(id) ? prev : [id, ...prev]);
    setJobStageById((prev) => ({ ...prev, [id]: prev[id] ?? 'Interested' }));
    setJobStatusById((prev) => ({ ...prev, [id]: prev[id] ?? 'interested' }));
  }

  function unsaveJob(id: string) {
    setSavedIds((prev) => prev.filter((s) => s !== id));
  }

  function isJobSaved(id: string) {
    return savedIds.includes(id);
  }

  function setJobStage(id: string, stage: ApplicationStage) {
    setJobStageById((prev) => ({ ...prev, [id]: stage }));
  }

  function setJobStatus(id: string, status: ApplicationStatus) {
    setJobStatusById((prev) => ({ ...prev, [id]: status }));
    // Also sync legacy stage for backward compat
    const legacyMap: Record<ApplicationStatus, ApplicationStage> = {
      interested: 'Interested',
      preparing: 'Preparing Docs',
      ready_to_apply: 'Preparing Docs',
      applied_by_user: 'Applied on Portal',
      admit_card_available: 'Admit Card / Exam',
      examination_completed: 'Admit Card / Exam',
      result_available: 'Admit Card / Exam',
      not_interested: 'Interested',
      withdrawn: 'Interested',
      cancelled: 'Interested',
    };
    if (legacyMap[status]) {
      setJobStageById((prev) => ({ ...prev, [id]: legacyMap[status] }));
    }
  }

  function toggleCheck(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isChecked(key: string) {
    return !!checkedItems[key];
  }

  return (
    <SavedJobsContext.Provider
      value={{ savedIds, jobStageById, jobStatusById, checkedItems, saveJob, unsaveJob, isJobSaved, setJobStage, setJobStatus, toggleCheck, isChecked }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useSavedJobs() {
  return useContext(SavedJobsContext);
}

// ---- Common Document Vault Items --------------------------------
export interface VaultItem {
  id: string;
  title: string;
  guj: string;
}

export const COMMON_VAULT_ITEMS: VaultItem[] = [
  { id: 'vault-otr', title: 'OJAS One Time Registration (OTR) Number & Password saved', guj: 'OJAS વન ટાઈમ રજીસ્ટ્રેશન (OTR) નંબર તૈયાર છે' },
  { id: 'vault-photo', title: 'Passport Photo & Signature resized (< 15 KB JPG, 5cm x 3.6cm)', guj: 'ફોટો અને સહી ૧૫ KB કરતા ઓછી સાઈઝમાં (JPG ફોર્મેટ)' },
  { id: 'vault-ncl', title: 'Valid Non-Creamy Layer Certificate (Parishistha-4 for SEBC)', guj: 'ચાલુ નાણાકીય વર્ષનું નોન-ક્રીમીલેયર સર્ટિફિકેટ (SEBC માટે)' },
  { id: 'vault-caste', title: 'Caste / EWS Eligibility Certificate issued by Gujarat Authority', guj: 'જાતિ પ્રમાણપત્ર / EWS પ્રમાણપત્ર' },
  { id: 'vault-ccc', title: 'Computer Proficiency (CCC) or 10th/12th/College Computer Subject Marksheet', guj: 'કોમ્પ્યુટર CCC સર્ટિફિકેટ અથવા માર્કશીટ' },
  { id: 'vault-edu', title: '10th, 12th & Graduation Original Marksheets + Degree Certificate PDF', guj: 'ધોરણ ૧૦, ૧૨ અને ગ્રેજ્યુએશનની માર્કશીટ' },
  { id: 'vault-domicile', title: 'Gujarat Domicile / Birth & School Leaving Certificate (LC)', guj: 'ગુજરાત ડોમિસાઈલ અને શાળા છોડ્યાનું પ્રમાણપત્ર (LC)' },
  { id: 'vault-bank', title: 'Active Bank Account Passbook & IFSC (for GSSSB Exam Fee Refund)', guj: 'ફી રિફંડ માટે ચાલુ બેંક ખાતાની વિગત અને IFSC કોડ' },
];
