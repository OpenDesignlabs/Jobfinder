// ============================================================
// JobDirect – Core Type Definitions (v3 — Full Spec Implementation)
// Aligned with JobDirect_Complete_Application_Backend_Server_Logic.md
// ============================================================

// ── Recruitment status (visible to candidates) ────────────────
export type RecruitmentStatus =
  | 'open'
  | 'closing_soon'
  | 'closed'
  | 'result_declared'
  | 'upcoming'
  | 'on_hold'
  | 'cancelled';

// ── Publication state machine (admin / backend) ───────────────
export type PublicationStatus =
  | 'discovered'
  | 'processing'
  | 'extracted'
  | 'needs_review'
  | 'verified'
  | 'published'
  | 'updated'
  | 'expired'
  | 'cancelled'
  | 'rejected';

// ── Education filters ─────────────────────────────────────────
export type EducationFilter =
  | '10th'
  | '12th_general'
  | '12th_pcm'
  | 'graduate'
  | 'iti_diploma';

// ── Sector filters ────────────────────────────────────────────
export type SectorFilter =
  | 'railways'
  | 'ssc'
  | 'defense_police'
  | 'banking'
  | 'state_govt';

// ── Data quality ──────────────────────────────────────────────
export type DataQuality = 'demo' | 'verified' | 'unverified' | 'stale';

// ── Age & salary ──────────────────────────────────────────────
export interface AgeLimit {
  min: number;
  max: number;
  referenceDate?: string;   // ISO date e.g. "2026-01-01" – use this, not today
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

// ── Important dates ───────────────────────────────────────────
export interface ImportantDates {
  notificationDate?: string;  // ISO date string
  applicationStart?: string;
  applicationEnd: string;     // Required for deadline calculation
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
}

// ── Vacancies ─────────────────────────────────────────────────
export interface VacancyBreakdown {
  category?: string;
  post?: string;
  count: number;
}

// ── Official links ────────────────────────────────────────────
export interface OfficialLinks {
  officialWebsite?: string;
  notificationPdf?: string;
  applyOnline?: string;
  verified: boolean;
  lastVerified?: string;
}

// ── Selection process ─────────────────────────────────────────
export interface SelectionStage {
  order: number;
  name: string;
  description?: string;
}

// ── Corrigendum / Change Alert ────────────────────────────────
export type CorrigendumCategory = 'DEADLINE' | 'VACANCY' | 'ELIGIBILITY' | 'REFUND_EXAM';

export interface Corrigendum {
  corrId: string;
  date: string;
  category: CorrigendumCategory;
  type: string;
  sectionCitation: string;
  beforeText: string;
  afterText: string;
  summaryGuj: string;
  newClosingDate?: string;   // if DEADLINE category, the new date
}

// ── Application Timeline ──────────────────────────────────────
export type TimelineStatus = 'done' | 'current' | 'upcoming';

export interface TimelineStep {
  step: string;
  date: string;
  status: TimelineStatus;
  cite: string;
}

// ── Document Vault ────────────────────────────────────────────
export interface VaultItem {
  id: string;
  title: string;
  guj: string;
}

// ── Gujarat GAD Eligibility Profile ──────────────────────────
export type GenderCategory =
  | 'GEN_M'         // General Male — Base Age
  | 'RESERVED_M'    // SEBC / SC / ST / EWS (Male) (+5 Yrs)
  | 'GEN_F'         // General (Female) (+5 Yrs)
  | 'RESERVED_F';   // SEBC / SC / ST / EWS (Female) (+10 Yrs, Max 45)

export interface CandidateProfile {
  age: number;
  dob: string;              // ISO date string YYYY-MM-DD
  category: GenderCategory;
  isPwd: boolean;           // PwD/Divyang (+10 Yrs)
  isExServiceman: boolean;  // Ex-Serviceman (+3 Yrs)
  education: string;        // 'ANY' | 'HSC' | 'GRADUATE' | 'TECH_DIPLOMA' | 'NURSING' | 'COMMERCE_PG'
}

// ── GAD Eligibility Result (legacy v0) ────────────────────────
export type GADEligibilityStatus =
  | 'ELIGIBLE'
  | 'ELIGIBLE_RELAXED'
  | 'INELIGIBLE_AGE'
  | 'INELIGIBLE_EDU'
  | 'NEEDS_REVIEW';         // ← NEW: three-valued logic unknown outcome

export interface GADEligibilityInfo {
  status: GADEligibilityStatus;
  isEligible: boolean;
  effectiveMaxAge: number;
  relaxYears: number;
  usedRelaxation: boolean;
  badgeText: string;
  badgeClass: string;
  reason: string;
  // v1 enrichment
  outcome?: EligibilityOutcome;
  checks?: EligibilityCheck[];
}

export type GujaratCategory = GenderCategory;
export type GADEligibilityResult = GADEligibilityInfo;

// ── Three-valued eligibility (spec §9) ───────────────────────
/**
 * outcome covers the overall assessment:
 *  - likely_eligible:    all required rules PASS
 *  - likely_ineligible:  at least one required rule clearly FAILS
 *  - needs_review:       at least one decisive rule is UNKNOWN / ambiguous
 */
export type EligibilityOutcome =
  | 'likely_eligible'
  | 'likely_ineligible'
  | 'needs_review';

/** Per-rule three-valued result */
export type RuleResult = 'pass' | 'fail' | 'unknown';

export interface EligibilityCheck {
  rule: EligibilityRuleType;
  result: RuleResult;
  reason: string;
  evidencePage?: number;
}

export type EligibilityRuleType =
  | 'minimum_qualification'
  | 'subject_requirement'
  | 'minimum_age'
  | 'maximum_age'
  | 'age_relaxation'
  | 'experience_requirement'
  | 'licence_requirement'
  | 'domicile_requirement'
  | 'category_condition';

/** Full eligibility response from /api/v1/recruitments/:id/eligibility-check */
export interface EligibilityV1Response {
  recruitment_id: string;
  recruitment_version: number;
  outcome: EligibilityOutcome;
  evaluated_at: string;
  checks: EligibilityCheck[];
  relaxYears: number;
  effectiveMaxAge: number;
  message: string;
  _note: string;
}

// ── Application readiness ─────────────────────────────────────
/**
 * Full application lifecycle states per spec §10.
 * Distinct from checklist completion.
 */
export type ApplicationStatus =
  | 'interested'
  | 'preparing'
  | 'ready_to_apply'
  | 'applied_by_user'
  | 'admit_card_available'
  | 'examination_completed'
  | 'result_available'
  | 'not_interested'
  | 'withdrawn'
  | 'cancelled';

/** Display-friendly labels for application statuses */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: 'Interested',
  preparing: 'Preparing Docs',
  ready_to_apply: 'Ready to Apply',
  applied_by_user: 'Applied on Portal',
  admit_card_available: 'Admit Card',
  examination_completed: 'Exam Done',
  result_available: 'Result Awaited',
  not_interested: 'Not Interested',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
};

export const APPLICATION_STATUS_FLOW: ApplicationStatus[] = [
  'interested',
  'preparing',
  'ready_to_apply',
  'applied_by_user',
  'admit_card_available',
  'examination_completed',
  'result_available',
];

// ── Checklist items ───────────────────────────────────────────
/**
 * Item types per spec §10.
 * Only 'required_by_notice' items are presented as explicitly required.
 */
export type ChecklistItemType =
  | 'required_by_notice'
  | 'conditional_requirement'
  | 'recommended_preparation'
  | 'user_added';

export type ChecklistItemStatus = 'pending' | 'complete' | 'skipped';

export interface ChecklistItem {
  id: string;
  candidate_recruitment_id: string;
  item_type: ChecklistItemType;
  label: string;
  label_guj?: string;
  required: boolean;
  status: ChecklistItemStatus;
  completed_at?: string | null;
  evidence_reference?: string | null;
  sort_order: number;
}

// ── Notification events ───────────────────────────────────────
export type NotificationEventType =
  | 'new_match'
  | 'deadline_change'
  | 'rule_change'
  | 'cancellation'
  | 'admit_card'
  | 'exam_schedule'
  | 'result_published'
  | 'user_reminder';

export type NotificationDeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface NotificationEvent {
  id: string;
  user_id: string;
  recruitment_id?: string | null;
  version_id?: string | null;
  event_type: NotificationEventType;
  deduplication_key: string;
  title: string;
  body?: string | null;
  delivery_status: NotificationDeliveryStatus;
  sent_at?: string | null;
  created_at: string;
}

// ── Candidate saved recruitment ───────────────────────────────
export interface CandidateRecruitment {
  id: string;
  user_id: string;
  recruitment_id: string;
  saved_at: string;
  application_status: ApplicationStatus;
  notes?: string | null;
  // Joined fields (populated on fetch)
  job?: Job | null;
}

// ── Page states (spec §3) ─────────────────────────────────────
export type PageState =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'stale'
  | 'needs_review';

// ── Main Job / Recruitment type ───────────────────────────────
export interface Job {
  id: string;
  recruitmentId?: string;
  department: string;
  title: string;
  sector: SectorFilter;

  // Gujarat-specific fields
  advtNo?: string;
  agency?: string;
  agencyFull?: string;
  titleGuj?: string;
  corrigenda?: Corrigendum[];
  checklist?: string[];
  timeline?: TimelineStep[];
  feeSummary?: string;
  eduSummaryEn?: string;
  eduSummaryGuj?: string;
  gujaratiExplanation?: string;
  englishExplanation?: string;
  manualReviewException?: string;
  lastVerified?: string;
  daysLeft?: number;
  publishedDate?: string;
  closingDate?: string;
  minAge?: number;
  maxAgeBase?: number;
  requiredEdu?: string[];
  officialBoardUrl?: string;
  officialApplyUrl?: string;
  ageReferenceDate?: string;     // ISO date – for accurate age calculation

  // Publication state (from backend)
  publication_status?: PublicationStatus;
  version?: number;
  _stale?: boolean;              // True if source check is overdue

  // Eligibility
  minQualification: EducationFilter[];
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
  lastUpdated: string;
  tags?: string[];
  shortDescription?: string;
}

// ── Filters & search ──────────────────────────────────────────
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

// ── Legacy eligibility types (kept for backward compat) ────────
export type EligibilityResult = 'match' | 'partial' | 'no_data' | 'mismatch';

export interface EligibilityInfo {
  result: EligibilityResult;
  reason: string;
}

/**
 * @deprecated Use ApplicationStatus instead.
 * Kept for backward compatibility with SavedJobsContext.
 */
export type ApplicationStage =
  | 'Interested'
  | 'Preparing Docs'
  | 'Applied on Portal'
  | 'Fee Paid / Confirmed'
  | 'Admit Card / Exam';
