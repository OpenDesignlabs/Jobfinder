// ============================================================
// SavedJobs Context – Application Pipeline & Document Vault
// Persists saved job IDs, application stages, checklist state,
// and common document vault checks to localStorage.
// ============================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ApplicationStage =
  | 'Interested'
  | 'Preparing Docs'
  | 'Applied'
  | 'Admit Card'
  | 'Exam Done'
  | 'Result Awaited';

export const APPLICATION_STAGES: ApplicationStage[] = [
  'Interested',
  'Preparing Docs',
  'Applied',
  'Admit Card',
  'Exam Done',
  'Result Awaited',
];

interface SavedJobsContextValue {
  savedIds: string[];
  jobStageById: Record<string, ApplicationStage>;
  checkedItems: Record<string, boolean>;
  saveJob: (id: string) => void;
  unsaveJob: (id: string) => void;
  isJobSaved: (id: string) => boolean;
  setJobStage: (id: string, stage: ApplicationStage) => void;
  toggleCheck: (key: string) => void;
  isChecked: (key: string) => boolean;
}

const SavedJobsContext = createContext<SavedJobsContextValue>({
  savedIds: [],
  jobStageById: {},
  checkedItems: {},
  saveJob: () => {},
  unsaveJob: () => {},
  isJobSaved: () => false,
  setJobStage: () => {},
  toggleCheck: () => {},
  isChecked: () => false,
});

const STORAGE_KEY = 'jobdirect_prod_state_v2';

interface PersistedState {
  savedIds: string[];
  jobStageById: Record<string, ApplicationStage>;
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
        checkedItems: parsed.checkedItems ?? {},
      };
    }
  } catch {
    // ignore
  }
  return { savedIds: [], jobStageById: {}, checkedItems: {} };
}

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const initial = loadState();
  const [savedIds, setSavedIds] = useState<string[]>(initial.savedIds);
  const [jobStageById, setJobStageById] = useState<Record<string, ApplicationStage>>(initial.jobStageById);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(initial.checkedItems);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedIds, jobStageById, checkedItems }));
    } catch {
      // ignore
    }
  }, [savedIds, jobStageById, checkedItems]);

  function saveJob(id: string) {
    setSavedIds((prev) => prev.includes(id) ? prev : [id, ...prev]);
    setJobStageById((prev) => ({ ...prev, [id]: prev[id] ?? 'Interested' }));
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

  function toggleCheck(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isChecked(key: string) {
    return !!checkedItems[key];
  }

  return (
    <SavedJobsContext.Provider
      value={{ savedIds, jobStageById, checkedItems, saveJob, unsaveJob, isJobSaved, setJobStage, toggleCheck, isChecked }}
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
