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

// ---- Corrigendum / Change Alert (from JobDirect) ------------------------

export type CorrigendumCategory = 'DEADLINE' | 'VACANCY' | 'ELIGIBILITY' | 'REFUND_EXAM';

export interface Corrigendum {
  corrId: string;
  date: string;                // Display date string e.g. "14 Oct 2026"
  category: CorrigendumCategory;
  type: string;                // Short description of the change type
  sectionCitation: string;     // Official citation reference
  beforeText: string;          // Original clause / rule text
  afterText: string;           // Revised clause / rule text
  summaryGuj: string;          // Gujarati summary for bilingual support
}

// ---- Application Timeline Step ------------------------------------------

export type TimelineStatus = 'done' | 'current' | 'upcoming';

export interface TimelineStep {
  step: string;
  date: string;
  status: TimelineStatus;
  cite: string;               // Source reference
}

// ---- Document Vault Item ------------------------------------------------

export interface VaultItem {
  id: string;
  title: string;              // English label
  guj: string;               // Gujarati label
}

// ---- GAD Eligibility Profile (Gujarat GAD Rules) -----------------------

export type GenderCategory =
  | 'GEN_M'           // General Male — Base Age
  | 'RESERVED_M'      // SEBC / SC / ST / EWS (Male) (+5 Yrs)
  | 'GEN_F'           // General (Female) (+5 Yrs)
  | 'RESERVED_F';     // SEBC / SC / ST / EWS (Female) (+10 Yrs, Max 45)

export interface CandidateProfile {
  age: number;
  dob: string;                 // ISO date string YYYY-MM-DD
  category: GenderCategory;
  isPwd: boolean;             // PwD/Divyang (+10 Yrs)
  isExServiceman: boolean;    // Ex-Serviceman (+3 Yrs)
  education: string;          // 'ANY' | 'HSC' | 'GRADUATE' | 'TECH_DIPLOMA' | 'NURSING' | 'COMMERCE_PG'
}

// ---- GAD Eligibility Result ---------------------------------------------

export type GADEligibilityStatus =
  | 'ELIGIBLE'
  | 'ELIGIBLE_RELAXED'
  | 'INELIGIBLE_AGE'
  | 'INELIGIBLE_EDU';

export interface GADEligibilityInfo {
  status: GADEligibilityStatus;
  isEligible: boolean;
  effectiveMaxAge: number;
  relaxYears: number;
  usedRelaxation: boolean;
  badgeText: string;
  badgeClass: string;
  reason: string;
}

export type GujaratCategory = GenderCategory;
export type GADEligibilityResult = GADEligibilityInfo;

export interface Job {
  id: string;
  recruitmentId?: string;
  department: string;
  title: string;
  sector: SectorFilter;

  // ---- Gujarat-specific fields (from jobdirect) ----
  advtNo?: string;              // Advertisement number e.g. "GSSSB/202627/461"
  agency?: string;              // Short agency code e.g. "GSSSB"
  agencyFull?: string;          // Full agency name
  titleGuj?: string;            // Gujarati title
  corrigenda?: Corrigendum[];   // List of verified corrigenda/changes
  checklist?: string[];         // Application readiness checklist items
  timeline?: TimelineStep[];    // End-to-end recruitment timeline
  feeSummary?: string;          // Application fee summary text
  eduSummaryEn?: string;        // Education summary (English)
  eduSummaryGuj?: string;       // Education summary (Gujarati)
  gujaratiExplanation?: string; // Plain-language explanation in Gujarati
  englishExplanation?: string;  // Plain-language explanation in English
  manualReviewException?: string; // Exception that requires manual verification
  lastVerified?: string;        // Last verified timestamp display string
  daysLeft?: number;            // Pre-computed days left (for Gujarat records)
  publishedDate?: string;       // ISO date string YYYY-MM-DD
  closingDate?: string;         // ISO date string YYYY-MM-DD (Gujarat closing)
  minAge?: number;              // Minimum age for GAD engine
  maxAgeBase?: number;          // Maximum base age for GAD engine
  requiredEdu?: string[];       // Education codes for GAD filter (e.g. ['GRADUATE'])
  officialBoardUrl?: string;    // Official board website URL
  officialApplyUrl?: string;    // Official application portal URL

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
  onlyEligible?: boolean;
  onlyCorrigendum?: boolean;
  onlyClosingSoon?: boolean;
  agencyFilter?: string;
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

// ---- Application Stage --------------------------------------------------

export type ApplicationStage =
  | 'Interested'
  | 'Preparing Docs'
  | 'Applied on Portal'
  | 'Fee Paid / Confirmed'
  | 'Admit Card / Exam';
