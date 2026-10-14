// ============================================================
// JobDirect – Core Type Definitions
// ============================================================

export type RecruitmentStatus =
  | 'open'
  | 'closing_soon'
  | 'closed'
  | 'result_declared'
  | 'upcoming'
  | 'on_hold';

export type EducationFilter =
  | '10th'
  | '12th_general'
  | '12th_pcm'
  | 'graduate'
  | 'iti_diploma';

export type SectorFilter =
  | 'railways'
  | 'ssc'
  | 'defense_police'
  | 'banking'
  | 'state_govt';

export type DataQuality = 'demo' | 'verified' | 'unverified';

export interface AgeLimit {
  min: number;
  max: number;
  relaxations?: AgeRelaxation[];
}

export interface AgeRelaxation {
  category: string;
  relaxationYears: number;
}

export interface SalaryInfo {
  payLevel?: string;
  payScale?: string;
  displayText: string;
}

export interface ApplicationFee {
  general: number;
  obc: number;
  scSt: number;
  exServicemen: number;
  women?: number;
  currency: 'INR';
  note?: string;
}

export interface ImportantDates {
  notificationDate?: string;   // ISO date string
  applicationStart?: string;
  applicationEnd: string;      // Required for deadline calculation
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
}

export interface VacancyBreakdown {
  category?: string;
  post?: string;
  count: number;
}

export interface OfficialLinks {
  officialWebsite?: string;    // Home page of the recruiting body
  notificationPdf?: string;    // Direct link to official notification PDF
  applyOnline?: string;        // Direct application portal link
  verified: boolean;
  lastVerified?: string;       // ISO date string
}

export interface SelectionStage {
  order: number;
  name: string;
  description?: string;
}

export interface Job {
  id: string;
  recruitmentId?: string;
  department: string;
  title: string;
  sector: SectorFilter;

  // Eligibility
  minQualification: EducationFilter[];  // all matching education levels
  qualificationNote?: string;
  ageLimit: AgeLimit;
  nationality?: string;
  physicalStandards?: string;

  // Vacancies
  totalVacancies: number;
  vacancyBreakdown?: VacancyBreakdown[];

  // Compensation
  salary: SalaryInfo;
  applicationFee?: ApplicationFee;

  // Dates
  importantDates: ImportantDates;

  // Process
  selectionProcess?: SelectionStage[];
  requiredDocuments?: string[];
  applicationInstructions?: string;

  // Links
  officialLinks: OfficialLinks;

  // Meta
  status: RecruitmentStatus;
  dataQuality: DataQuality;
  lastUpdated: string;         // ISO date string
  tags?: string[];
  shortDescription?: string;
}

// ---- Filter & Sort State -----------------------------------------------

export interface FilterState {
  query: string;
  education: EducationFilter[];
  sectors: SectorFilter[];
  status: RecruitmentStatus[];
}

export type SortOption =
  | 'deadline_asc'
  | 'deadline_desc'
  | 'newest'
  | 'vacancies_desc';

export interface SearchState {
  filters: FilterState;
  sort: SortOption;
}

// ---- Eligibility result -------------------------------------------------

export type EligibilityResult = 'match' | 'partial' | 'no_data' | 'mismatch';

export interface EligibilityInfo {
  result: EligibilityResult;
  reason: string;
}
