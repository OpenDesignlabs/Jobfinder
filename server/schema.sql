-- ============================================================
-- JobDirect (examsuchana.in) Full PostgreSQL / Supabase Production Schema
-- Implements versioned recruitment records, evidence fields,
-- eligibility results, checklist items, and notification events
-- as specified in the JobDirect Architecture Document.
-- ============================================================

-- Users & identity
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidate profile (eligibility attributes)
CREATE TABLE IF NOT EXISTS candidate_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  education_level TEXT,
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_if_provided TEXT,   -- GEN_M | RESERVED_M | GEN_F | RESERVED_F | null
  is_pwd BOOLEAN NOT NULL DEFAULT FALSE,
  is_ex_serviceman BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_agencies TEXT[] NOT NULL DEFAULT '{}',
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  profile_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Official sources registry
CREATE TABLE IF NOT EXISTS official_sources (
  id TEXT PRIMARY KEY,
  agency_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'api', 'web_listing', 'pdf_download')),
  collection_method TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  check_interval_minutes INTEGER NOT NULL DEFAULT 360,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discovered/downloaded documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES official_sources(id),
  url TEXT NOT NULL,
  content_hash TEXT UNIQUE NOT NULL,
  storage_key TEXT,            -- path in object storage (not DB bytes)
  document_type TEXT NOT NULL DEFAULT 'unknown'
    CHECK (document_type IN (
      'original_notification','corrigendum','deadline_extension',
      'cancellation','admit_card_notice','exam_schedule',
      'result_notice','answer_key','other','unknown'
    )),
  published_at DATE,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN (
      'pending','processing','extracted','failed','classified'
    ))
);

-- Recruitment processes (one per recruitment, across all versions)
CREATE TABLE IF NOT EXISTS recruitments (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  agency TEXT NOT NULL,       -- short code e.g. GSSSB
  agency_full TEXT NOT NULL,
  canonical_title TEXT NOT NULL,
  title_guj TEXT,
  recruitment_reference TEXT, -- official advt number
  current_version_id TEXT,    -- FK set after first version insert
  publication_status TEXT NOT NULL DEFAULT 'discovered'
    CHECK (publication_status IN (
      'discovered','processing','extracted','needs_review',
      'verified','published','updated','expired','cancelled'
    )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Versioned snapshot of recruitment facts
CREATE TABLE IF NOT EXISTS recruitment_versions (
  id TEXT PRIMARY KEY,
  recruitment_id TEXT NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  document_id TEXT REFERENCES documents(id),
  application_start DATE,
  application_deadline DATE,
  published_date DATE,
  recruitment_status TEXT NOT NULL DEFAULT 'open'
    CHECK (recruitment_status IN (
      'open','closing_soon','closed','result_declared',
      'upcoming','on_hold','cancelled'
    )),
  -- Structured eligibility rules as JSONB
  structured_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Quick-access fields (denormalized for query speed)
  total_vacancies INTEGER NOT NULL DEFAULT 0,
  min_age INTEGER NOT NULL DEFAULT 18,
  max_age_base INTEGER NOT NULL DEFAULT 35,
  required_edu TEXT[] NOT NULL DEFAULT '{}',
  edu_summary_en TEXT,
  edu_summary_guj TEXT,
  fee_summary TEXT,
  official_board_url TEXT,
  official_apply_url TEXT,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  gujarati_explanation TEXT,
  english_explanation TEXT,
  manual_review_exception TEXT,
  verified_at TIMESTAMPTZ,
  approved_by TEXT,
  change_summary TEXT,        -- description of what changed vs previous version
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recruitment_id, version_number),
  -- Deadline must not precede start unless source is explicit
  CHECK (
    application_deadline IS NULL OR application_start IS NULL OR
    application_deadline >= application_start
  )
);

-- Add FK after both tables exist
ALTER TABLE recruitments
  ADD COLUMN IF NOT EXISTS current_version_id TEXT
    REFERENCES recruitment_versions(id);

-- Evidence connecting facts to source documents
CREATE TABLE IF NOT EXISTS evidence_fields (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES recruitment_versions(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,   -- e.g. 'application_deadline', 'min_age'
  field_value TEXT NOT NULL,
  document_id TEXT REFERENCES documents(id),
  page_number INTEGER,
  source_excerpt TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected','needs_review'))
);

-- Candidate saved recruitments
CREATE TABLE IF NOT EXISTS candidate_recruitments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruitment_id TEXT NOT NULL REFERENCES recruitments(id),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  application_status TEXT NOT NULL DEFAULT 'interested'
    CHECK (application_status IN (
      'interested','preparing','ready_to_apply','applied_by_user',
      'admit_card_available','examination_completed','result_available',
      'not_interested','withdrawn','cancelled'
    )),
  notes TEXT,
  UNIQUE (user_id, recruitment_id)
);

-- Eligibility evaluation results (versioned per profile snapshot)
CREATE TABLE IF NOT EXISTS eligibility_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruitment_version_id TEXT NOT NULL REFERENCES recruitment_versions(id),
  profile_snapshot_hash TEXT NOT NULL,  -- SHA of profile at eval time
  outcome TEXT NOT NULL
    CHECK (outcome IN ('likely_eligible','likely_ineligible','needs_review')),
  rule_results JSONB NOT NULL DEFAULT '[]'::jsonb,  -- per-rule pass/fail/unknown
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist items for a saved recruitment
CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  candidate_recruitment_id TEXT NOT NULL
    REFERENCES candidate_recruitments(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'recommended_preparation'
    CHECK (item_type IN (
      'required_by_notice','conditional_requirement',
      'recommended_preparation','user_added'
    )),
  label TEXT NOT NULL,
  label_guj TEXT,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_version_id TEXT REFERENCES recruitment_versions(id),
  evidence_page INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','complete','skipped')),
  completed_at TIMESTAMPTZ,
  evidence_reference TEXT,     -- user notes / references
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Notification events
CREATE TABLE IF NOT EXISTS notification_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruitment_id TEXT REFERENCES recruitments(id),
  version_id TEXT REFERENCES recruitment_versions(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'new_match','deadline_change','rule_change','cancellation',
      'admit_card','exam_schedule','result_published','user_reminder'
    )),
  -- Unique key prevents duplicate alerts: user+recruitment+version+event_type
  deduplication_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued'
    CHECK (delivery_status IN ('queued','sent','delivered','failed','cancelled')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin review queue
CREATE TABLE IF NOT EXISTS review_tasks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id),
  recruitment_id TEXT REFERENCES recruitments(id),
  version_id TEXT REFERENCES recruitment_versions(id),
  task_type TEXT NOT NULL,    -- e.g. 'classification', 'field_verification'
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','deferred')),
  assigned_to TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  decision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log – immutable record of every material change
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,          -- user id or 'system'
  action TEXT NOT NULL,         -- 'publish', 'approve', 'reject', 'update'
  entity_type TEXT NOT NULL,    -- 'recruitment', 'version', 'corrigendum'
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_recruitments_agency       ON recruitments(agency);
CREATE INDEX IF NOT EXISTS idx_recruitments_pub_status   ON recruitments(publication_status);
CREATE INDEX IF NOT EXISTS idx_versions_recruitment      ON recruitment_versions(recruitment_id);
CREATE INDEX IF NOT EXISTS idx_versions_deadline         ON recruitment_versions(application_deadline);
CREATE INDEX IF NOT EXISTS idx_evidence_version          ON evidence_fields(version_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rec_user        ON candidate_recruitments(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_candidate_rec   ON checklist_items(candidate_recruitment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user        ON notification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_review_tasks_status       ON review_tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_source          ON documents(source_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_user          ON eligibility_results(user_id);
