-- ============================================================
-- JobDirect (examsuchana.in) PostgreSQL / Supabase Production Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS recruitment_records (
  id TEXT PRIMARY KEY,
  advt_no TEXT NOT NULL UNIQUE,
  agency TEXT NOT NULL,
  agency_full TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_guj TEXT NOT NULL,
  vacancies INTEGER NOT NULL DEFAULT 0,
  published_date DATE NOT NULL,
  closing_date DATE NOT NULL,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  official_board_url TEXT NOT NULL,
  official_apply_url TEXT NOT NULL,
  min_age INTEGER NOT NULL DEFAULT 18,
  max_age_base INTEGER NOT NULL DEFAULT 35,
  required_edu TEXT[] NOT NULL DEFAULT '{}',
  edu_summary_en TEXT NOT NULL,
  edu_summary_guj TEXT NOT NULL,
  manual_review_exception TEXT NOT NULL,
  gujarati_explanation TEXT NOT NULL,
  english_explanation TEXT NOT NULL,
  fee_summary TEXT NOT NULL,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corrigenda_alerts (
  corr_id TEXT PRIMARY KEY,
  recruitment_id TEXT NOT NULL REFERENCES recruitment_records(id) ON DELETE CASCADE,
  published_date TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('DEADLINE', 'VACANCY', 'ELIGIBILITY', 'REFUND_EXAM')),
  change_type TEXT NOT NULL,
  section_citation TEXT NOT NULL,
  before_text TEXT NOT NULL,
  after_text TEXT NOT NULL,
  summary_guj TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruitment_agency ON recruitment_records(agency);
CREATE INDEX IF NOT EXISTS idx_recruitment_closing ON recruitment_records(closing_date);
CREATE INDEX IF NOT EXISTS idx_corrigenda_rec_id ON corrigenda_alerts(recruitment_id);
