/**
 * JobDirect / Jobfinder — Production REST API & Static Server v3.0
 *
 * Implements the full spec from JobDirect_Complete_Application_Backend_Server_Logic.md:
 *  - Versioned recruitment records (publication state machine)
 *  - Evidence-backed field storage
 *  - Three-valued eligibility engine (PASS / FAIL / UNKNOWN → likely_eligible / likely_ineligible / needs_review)
 *  - Candidate saved applications + checklist items
 *  - Notification events with deduplication keys
 *  - Admin review queue
 *  - Audit log
 *  - Full /api/v1 route set
 *
 * Storage: JSON flat-file database (drop-in for PostgreSQL/Supabase later).
 * The file layout mirrors the relational schema in schema.sql.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'verified_db.json');
const APP_DB_PATH = path.join(__dirname, 'app_db.json');
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'jobdirect-secret-key-2026';

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// ============================================================
// Database helpers (JSON flat-file)
// ============================================================

/** @returns {Array} the flat recruitment records (legacy + v1 compatible) */
function readRecruitmentDb() {
  if (!fs.existsSync(DB_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return []; }
}

function writeRecruitmentDb(records) {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf8');
}

/**
 * App DB stores: candidate_recruitments, checklist_items,
 * notification_events, review_tasks, audit_events, official_sources.
 */
function readAppDb() {
  const defaults = {
    candidate_recruitments: [],
    checklist_items: [],
    notification_events: [],
    review_tasks: [],
    audit_events: [],
    official_sources: [],
  };
  if (!fs.existsSync(APP_DB_PATH)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(APP_DB_PATH, 'utf8')) };
  } catch { return defaults; }
}

function writeAppDb(db) {
  fs.writeFileSync(APP_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function uid() {
  return crypto.randomBytes(8).toString('hex');
}

function requireAdminKey(req, res) {
  const key = req.headers['x-api-key'];
  if (key !== ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized: Invalid X-API-Key header' });
    return false;
  }
  return true;
}

function recordAudit(db, actor, action, entityType, entityId, oldVal, newVal, reason) {
  db.audit_events.push({
    id: `AUD-${uid()}`,
    actor,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldVal ?? null,
    new_value: newVal ?? null,
    reason: reason ?? null,
    occurred_at: new Date().toISOString(),
  });
}

// ============================================================
// PUBLICATION STATE MACHINE
// Discovered → Processing → Extracted → NeedsReview
//          → Verified → Published → Updated → Expired/Cancelled
// ============================================================
const VALID_STATUS_TRANSITIONS = {
  discovered: ['processing'],
  processing: ['extracted', 'needs_review'],
  extracted: ['needs_review', 'verified'],
  needs_review: ['verified', 'rejected'],
  verified: ['published'],
  published: ['updated', 'expired', 'cancelled'],
  updated: ['published'],
  rejected: [],
  expired: [],
  cancelled: [],
};

function canTransition(from, to) {
  return (VALID_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

// ============================================================
// ELIGIBILITY ENGINE — Three-valued logic
// Per spec §9: PASS | FAIL | UNKNOWN
// ============================================================

const EDU_ACCEPTED = {
  ANY: ['HSC', 'GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
  HSC: ['HSC'],
  GRADUATE: ['GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
  TECH_DIPLOMA: ['TECH_DIPLOMA'],
  NURSING: ['NURSING'],
  COMMERCE_PG: ['COMMERCE_PG', 'GRADUATE'],
};

/**
 * Calculate completed years between two dates (spec §9 Step 4).
 * Handles birthday-not-yet-reached edge case.
 */
function completedYears(birthDate, referenceDate) {
  const b = new Date(birthDate);
  const r = new Date(referenceDate);
  let years = r.getFullYear() - b.getFullYear();
  const birthdayNotReached =
    r.getMonth() < b.getMonth() ||
    (r.getMonth() === b.getMonth() && r.getDate() < b.getDate());
  return years - (birthdayNotReached ? 1 : 0);
}

function evaluateEligibilityV1(job, rawProfile = {}) {
  // Normalize profile fields across snake_case / camelCase conventions
  const profile = {
    dob: rawProfile.dob || rawProfile.date_of_birth || null,
    age: rawProfile.age !== undefined ? rawProfile.age : undefined,
    category: rawProfile.category || rawProfile.category_if_provided || null,
    education: rawProfile.education || rawProfile.education_level || null,
    isPwd: Boolean(rawProfile.isPwd || rawProfile.is_pwd),
    isExServiceman: Boolean(rawProfile.isExServiceman || rawProfile.is_ex_serviceman),
  };

  const checks = [];
  let hasUnknown = false;
  let hasFail = false;

  // ── Age rule ──────────────────────────────────────────────
  const minAge = job.minAge ?? (job.ageLimit?.min) ?? 18;
  const maxAgeBase = job.maxAgeBase ?? (job.ageLimit?.max) ?? 35;

  // Category relaxation
  let relaxYears = 0;
  if (!profile.category) {
    relaxYears = 0;
  } else {
    const cat = String(profile.category).toUpperCase();
    if (cat === 'RESERVED_M' || cat === 'GEN_F' || cat === 'SEBC_M' || cat === 'SC_M' || cat === 'ST_M' || cat === 'EWS_M') {
      relaxYears += 5;
    } else if (cat === 'RESERVED_F' || cat === 'SEBC_F' || cat === 'SC_F' || cat === 'ST_F' || cat === 'EWS_F') {
      relaxYears += 10;
    }
  }
  if (profile.isPwd) relaxYears += 10;
  if (profile.isExServiceman) relaxYears += 3;

  const effectiveMaxAge = Math.min(45, maxAgeBase + relaxYears);

  if (!profile.dob && profile.age === undefined) {
    hasUnknown = true;
    checks.push({ rule: 'age_limit', result: 'unknown', reason: 'Date of birth not provided in profile' });
  } else {
    let candidateAge = profile.age;
    if (profile.dob) {
      const refDate = job.ageReferenceDate || new Date().toISOString().slice(0, 10);
      try { candidateAge = completedYears(profile.dob, refDate); }
      catch { candidateAge = profile.age; }
    }

    if (typeof candidateAge !== 'number' || isNaN(candidateAge)) {
      hasUnknown = true;
      checks.push({ rule: 'minimum_age', result: 'unknown', reason: 'Age could not be determined' });
      checks.push({ rule: 'maximum_age', result: 'unknown', reason: 'Age could not be determined' });
    } else {
      if (candidateAge < minAge) {
        hasFail = true;
        checks.push({ rule: 'minimum_age', result: 'fail', reason: `Age ${candidateAge} < minimum ${minAge}` });
      } else {
        checks.push({ rule: 'minimum_age', result: 'pass', reason: `Age ${candidateAge} ≥ minimum ${minAge}` });
      }

      if (candidateAge > effectiveMaxAge) {
        hasFail = true;
        checks.push({
          rule: 'maximum_age', result: 'fail',
          reason: `Age ${candidateAge} > effective max ${effectiveMaxAge} (base ${maxAgeBase} + ${relaxYears} relaxation, capped at 45)`,
        });
      } else {
        const usedRelaxation = candidateAge > maxAgeBase;
        checks.push({
          rule: 'maximum_age', result: 'pass',
          reason: usedRelaxation
            ? `Age ${candidateAge} ≤ ${effectiveMaxAge} (via +${relaxYears} yr GAD relaxation). Valid certificate required.`
            : `Age ${candidateAge} ≤ base max ${maxAgeBase}`,
        });
      }
    }
  }

  // ── Age relaxation rule ───────────────────────────────────
  if (!profile.category) {
    hasUnknown = true;
    checks.push({
      rule: 'age_relaxation', result: 'unknown',
      reason: 'Category not provided. Relaxation cannot be confirmed. General (base) age limit assumed.',
    });
  } else {
    checks.push({
      rule: 'age_relaxation', result: 'pass',
      reason: `Category '${profile.category}' recognized (+${relaxYears} yr total relaxation calculated)`,
    });
  }

  // ── Education rule ────────────────────────────────────────
  const requiredEdu = (job.requiredEdu ?? []).map(e => String(e).toUpperCase());
  if (!profile.education || profile.education === '') {
    hasUnknown = true;
    checks.push({ rule: 'minimum_qualification', result: 'unknown', reason: 'Education level not specified in profile' });
  } else {
    const rawEdu = String(profile.education).toUpperCase();
    let normEdu = rawEdu;
    if (rawEdu === 'GRADUATE' || rawEdu === 'DEGREE' || rawEdu === 'BACHELOR') normEdu = 'GRADUATE';
    else if (rawEdu === '12TH' || rawEdu === '12TH_GENERAL' || rawEdu === '12TH_PCM' || rawEdu === 'HSC') normEdu = 'HSC';
    else if (rawEdu === 'DIPLOMA' || rawEdu === 'ITI_DIPLOMA' || rawEdu === 'TECH_DIPLOMA') normEdu = 'TECH_DIPLOMA';

    const userEduSet = (EDU_ACCEPTED[normEdu] ?? [normEdu]).map(e => String(e).toUpperCase());
    const eduOk =
      normEdu === 'ANY' ||
      requiredEdu.length === 0 ||
      requiredEdu.some(code => userEduSet.includes(code) || code === normEdu);

    if (!eduOk) {
      hasFail = true;
      const required = requiredEdu.join(' / ');
      checks.push({
        rule: 'minimum_qualification', result: 'fail',
        reason: job.eduSummaryEn
          ? `Requires: ${job.eduSummaryEn.split('.')[0]}`
          : `Requires: ${required}. Candidate holds: ${profile.education}`,
      });
    } else {
      checks.push({ rule: 'minimum_qualification', result: 'pass', reason: `Education (${profile.education}) meets requirement` });
    }
  }

  // ── Determine overall outcome ─────────────────────────────
  let outcome;
  if (hasFail) outcome = 'likely_ineligible';
  else if (hasUnknown) outcome = 'needs_review';
  else outcome = 'likely_eligible';

  return {
    outcome,
    checks,
    relaxYears,
    effectiveMaxAge,
    message:
      outcome === 'likely_eligible'
        ? 'All checked rules pass. Subject to official verification.'
        : outcome === 'likely_ineligible'
        ? 'One or more required rules clearly fail. Review the cited rules.'
        : 'Eligibility could not be fully determined. Review the cited official rules.',
  };
}

// ============================================================
// LEGACY API — v0 (backward compatible)
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JobDirect / Jobfinder Unified Production API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Legacy: list all recruitments (v0)
app.get('/api/recruitments', (req, res) => {
  let records = readRecruitmentDb();
  const { agency, q } = req.query;

  if (agency && agency !== 'ALL') {
    records = records.filter(r => (r.agency || '').toUpperCase() === String(agency).toUpperCase());
  }
  if (q) {
    const query = String(q).toLowerCase();
    records = records.filter(r =>
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.advtNo && r.advtNo.toLowerCase().includes(query)) ||
      (r.titleGuj && r.titleGuj.toLowerCase().includes(query)) ||
      (r.agency && r.agency.toLowerCase().includes(query)) ||
      (r.department && r.department.toLowerCase().includes(query))
    );
  }

  res.json({ count: records.length, records });
});

// Legacy: get by id
app.get('/api/recruitments/:id', (req, res) => {
  const records = readRecruitmentDb();
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Recruitment record not found' });
  res.json(record);
});

// Legacy: create (protected)
app.post('/api/recruitments', (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const { title, advtNo, agency } = req.body;
  if (!title || !advtNo || !agency) {
    return res.status(400).json({ error: 'Missing required fields: title, advtNo, agency' });
  }
  const records = readRecruitmentDb();
  const newRecord = {
    id: req.body.id || `rec-${Date.now()}`,
    ...req.body,
    publication_status: 'published',
    version: 1,
    lastVerified: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
  records.unshift(newRecord);
  writeRecruitmentDb(records);
  res.status(201).json({ status: 'created', record: newRecord });
});

// Legacy: publish corrigendum
app.post('/api/recruitments/:id/corrigenda', (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const records = readRecruitmentDb();
  const job = records.find(r => r.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Recruitment record not found' });

  const corr = {
    corrId: req.body.corrId || `CORR-${Date.now()}`,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    category: req.body.category || 'ELIGIBILITY',
    type: req.body.type || 'General Clarification',
    sectionCitation: req.body.sectionCitation || 'Official Notification Addendum',
    beforeText: req.body.beforeText || '',
    afterText: req.body.afterText || '',
    summaryGuj: req.body.summaryGuj || '',
  };

  if (req.body.newClosingDate) job.closingDate = req.body.newClosingDate;
  job.lastVerified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Bump version and record change
  job.version = (job.version || 1) + 1;
  job.corrigenda = [corr, ...(job.corrigenda || [])];

  writeRecruitmentDb(records);
  res.status(201).json({ status: 'updated', job, addedCorrigendum: corr });
});

// Legacy: get all corrigenda
app.get('/api/corrigenda', (req, res) => {
  const records = readRecruitmentDb();
  const allCorrigenda = [];
  for (const job of records) {
    for (const corr of (job.corrigenda || [])) {
      allCorrigenda.push({
        ...corr,
        jobId: job.id, jobTitle: job.title, jobTitleGuj: job.titleGuj,
        advtNo: job.advtNo, agency: job.agency, agencyFull: job.agencyFull,
      });
    }
  }
  allCorrigenda.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  res.json({ count: allCorrigenda.length, corrigenda: allCorrigenda });
});

// Legacy: Gujarat GAD evaluator
app.post('/api/evaluate-gad', (req, res) => {
  const { job, profile } = req.body;
  if (!job || !profile) {
    return res.status(400).json({ error: 'Both "job" and "profile" payloads are required.' });
  }
  const result = evaluateEligibilityV1(job, profile);
  // Map back to legacy field names for backward compat
  const legacyStatus =
    result.outcome === 'likely_eligible'
      ? (result.checks.some(c => c.rule === 'maximum_age' && c.result === 'pass' && c.reason.includes('relaxation'))
          ? 'ELIGIBLE_RELAXED' : 'ELIGIBLE')
      : result.outcome === 'likely_ineligible'
        ? (result.checks.find(c => c.rule === 'minimum_qualification' && c.result === 'fail') ? 'INELIGIBLE_EDU' : 'INELIGIBLE_AGE')
        : 'NEEDS_REVIEW';

  res.json({
    status: legacyStatus,
    isEligible: result.outcome === 'likely_eligible',
    effectiveMaxAge: result.effectiveMaxAge,
    relaxYears: result.relaxYears,
    usedRelaxation: result.checks.some(c => c.rule === 'maximum_age' && c.result === 'pass' && c.reason.includes('relaxation')),
    reason: result.message,
    // v1 enrichment
    outcome: result.outcome,
    checks: result.checks,
  });
});

// ============================================================
// API v1 — Full spec-compliant endpoints
// ============================================================

// ── Recruitments ──────────────────────────────────────────────

/**
 * GET /api/v1/recruitments
 * Search published recruitments with filters.
 * Supports: q, agency, status, edu, closingAfter, closingBefore, page, limit
 */
app.get('/api/v1/recruitments', (req, res) => {
  let records = readRecruitmentDb();
  const { q, agency, status, edu, closingAfter, closingBefore } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  // Only show published records to public (not draft/needs_review)
  records = records.filter(r =>
    !r.publication_status || ['published', 'updated', 'expired', 'cancelled'].includes(r.publication_status)
  );

  if (agency && agency !== 'ALL') {
    records = records.filter(r => (r.agency || '').toUpperCase() === String(agency).toUpperCase());
  }
  if (q) {
    const query = String(q).toLowerCase();
    records = records.filter(r =>
      (r.title || '').toLowerCase().includes(query) ||
      (r.advtNo || '').toLowerCase().includes(query) ||
      (r.titleGuj || '').toLowerCase().includes(query) ||
      (r.agency || '').toLowerCase().includes(query) ||
      (r.department || '').toLowerCase().includes(query)
    );
  }
  if (status) {
    records = records.filter(r => r.status === status || r.publication_status === status);
  }
  if (edu) {
    records = records.filter(r => !r.requiredEdu || r.requiredEdu.length === 0 || r.requiredEdu.includes(edu));
  }
  if (closingAfter) {
    records = records.filter(r => (r.closingDate || r.importantDates?.applicationEnd || '') >= closingAfter);
  }
  if (closingBefore) {
    records = records.filter(r => (r.closingDate || r.importantDates?.applicationEnd || '') <= closingBefore);
  }

  const total = records.length;
  const start = (page - 1) * limit;
  const paged = records.slice(start, start + limit);

  res.json({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    records: paged.map(r => ({
      ...r,
      _stale: isStale(r),
    })),
  });
});

function isStale(record) {
  if (!record.lastVerified) return false;
  // Stale if not verified in the past 7 days
  const last = new Date(record.lastVerified).getTime();
  return Date.now() - last > 7 * 24 * 60 * 60 * 1000;
}

/**
 * GET /api/v1/recruitments/:id
 * Full vacancy detail with current version and source references.
 */
app.get('/api/v1/recruitments/:id', (req, res) => {
  const records = readRecruitmentDb();
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Recruitment not found' });

  res.json({
    ...record,
    _stale: isStale(record),
    _meta: {
      lastVerified: record.lastVerified || null,
      version: record.version || 1,
      publicationStatus: record.publication_status || 'published',
    },
  });
});

/**
 * GET /api/v1/recruitments/:id/versions
 * Published version history.
 */
app.get('/api/v1/recruitments/:id/versions', (req, res) => {
  const records = readRecruitmentDb();
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Recruitment not found' });

  // Build version history from corrigenda (each corrigendum is a version bump)
  const versions = [];
  versions.push({
    version: 1,
    createdAt: record.publishedDate || record.lastVerified,
    changeSummary: 'Original publication',
    closingDate: record._originalClosingDate || record.closingDate,
    status: 'published',
  });

  (record.corrigenda || []).slice().reverse().forEach((corr, i) => {
    versions.push({
      version: i + 2,
      createdAt: corr.date,
      changeSummary: corr.type,
      corrId: corr.corrId,
      category: corr.category,
      closingDate: corr.category === 'DEADLINE' ? (corr.newClosingDate || record.closingDate) : record.closingDate,
      status: 'updated',
    });
  });

  res.json({ recruitmentId: req.params.id, currentVersion: versions.length, versions });
});

/**
 * GET /api/v1/recruitments/:id/evidence
 * Retrieve field evidence and official sources.
 */
app.get('/api/v1/recruitments/:id/evidence', (req, res) => {
  const records = readRecruitmentDb();
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Recruitment not found' });

  // Build evidence from known fields
  const evidence = [];
  if (record.closingDate) {
    evidence.push({
      field: 'application_deadline',
      value: record.closingDate,
      verificationStatus: 'verified',
      sourceUrl: record.officialBoardUrl || null,
      lastVerified: record.lastVerified || null,
    });
  }
  if (record.minAge !== undefined) {
    evidence.push({
      field: 'min_age',
      value: String(record.minAge),
      verificationStatus: 'verified',
      sourceUrl: record.officialBoardUrl || null,
    });
  }
  if (record.maxAgeBase !== undefined) {
    evidence.push({
      field: 'max_age_base',
      value: String(record.maxAgeBase),
      verificationStatus: 'verified',
      sourceUrl: record.officialBoardUrl || null,
    });
  }
  if (record.requiredEdu?.length) {
    evidence.push({
      field: 'required_education',
      value: record.requiredEdu.join(', '),
      verificationStatus: 'verified',
      sourceExcerpt: record.eduSummaryEn || null,
    });
  }

  res.json({ recruitmentId: req.params.id, evidence });
});

/**
 * POST /api/v1/recruitments/:id/eligibility-check
 * Three-valued eligibility evaluation against current verified version.
 */
app.post('/api/v1/recruitments/:id/eligibility-check', (req, res) => {
  const records = readRecruitmentDb();
  const job = records.find(r => r.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Recruitment not found' });

  const profile = req.body;
  if (!profile || typeof profile !== 'object') {
    return res.status(400).json({ error: 'Profile payload required in request body' });
  }

  const result = evaluateEligibilityV1(job, profile);

  res.json({
    recruitment_id: req.params.id,
    recruitment_version: job.version || 1,
    outcome: result.outcome,
    evaluated_at: new Date().toISOString(),
    checks: result.checks,
    relaxYears: result.relaxYears,
    effectiveMaxAge: result.effectiveMaxAge,
    message: result.message,
    _note: "Results are indicative only. The recruiting authority's official decision takes precedence.",
  });
});

/**
 * PATCH /api/v1/recruitments/:id/status  (Admin)
 * Advance publication status through state machine.
 */
app.patch('/api/v1/recruitments/:id/status', (req, res) => {
  if (!requireAdminKey(req, res)) return;
  const { newStatus, reason } = req.body;
  if (!newStatus) return res.status(400).json({ error: 'newStatus required' });

  const records = readRecruitmentDb();
  const job = records.find(r => r.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Recruitment not found' });

  const from = job.publication_status || 'published';
  if (!canTransition(from, newStatus)) {
    return res.status(422).json({
      error: `Invalid state transition: ${from} → ${newStatus}`,
      allowedTransitions: VALID_STATUS_TRANSITIONS[from] ?? [],
    });
  }

  const db = readAppDb();
  recordAudit(db, 'admin', 'status_change', 'recruitment', job.id,
    { publication_status: from }, { publication_status: newStatus }, reason);

  job.publication_status = newStatus;
  job.lastVerified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  writeRecruitmentDb(records);
  writeAppDb(db);

  res.json({ id: job.id, from, to: newStatus, reason });
});

// ── Candidate Profile ─────────────────────────────────────────

/**
 * GET /api/v1/profile
 * Load candidate profile (user identified by x-user-id header).
 */
app.get('/api/v1/profile', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  // Profiles are stored inside app_db; this is a stub (use Supabase in prod)
  const profile = (db.profiles || {})[userId] || null;
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  res.json(profile);
});

/**
 * PATCH /api/v1/profile
 * Update candidate profile fields.
 */
app.patch('/api/v1/profile', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  if (!db.profiles) db.profiles = {};
  db.profiles[userId] = {
    ...(db.profiles[userId] || {}),
    ...req.body,
    user_id: userId,
    profile_updated_at: new Date().toISOString(),
  };
  writeAppDb(db);
  res.json(db.profiles[userId]);
});

// ── My Recruitments (saved applications) ─────────────────────

/**
 * GET /api/v1/my-recruitments
 * List saved recruitments for current user.
 */
app.get('/api/v1/my-recruitments', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const saved = (db.candidate_recruitments || []).filter(r => r.user_id === userId);
  const records = readRecruitmentDb();

  const enriched = saved.map(sr => {
    const job = records.find(r => r.id === sr.recruitment_id) || null;
    return { ...sr, job };
  });

  res.json({ count: enriched.length, my_recruitments: enriched });
});

/**
 * POST /api/v1/my-recruitments
 * Save a recruitment (idempotent).
 */
app.post('/api/v1/my-recruitments', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const { recruitment_id } = req.body;
  if (!recruitment_id) return res.status(400).json({ error: 'recruitment_id required' });

  const records = readRecruitmentDb();
  if (!records.find(r => r.id === recruitment_id)) {
    return res.status(404).json({ error: 'Recruitment not found' });
  }

  const db = readAppDb();
  const existing = db.candidate_recruitments.find(
    r => r.user_id === userId && r.recruitment_id === recruitment_id
  );
  if (existing) return res.json({ status: 'already_saved', my_recruitment: existing });

  const newEntry = {
    id: `CR-${uid()}`,
    user_id: userId,
    recruitment_id,
    saved_at: new Date().toISOString(),
    application_status: 'interested',
    notes: req.body.notes || null,
  };

  db.candidate_recruitments.push(newEntry);
  writeAppDb(db);

  res.status(201).json({ status: 'saved', my_recruitment: newEntry });
});

/**
 * PATCH /api/v1/my-recruitments/:id
 * Update application status or notes.
 */
app.patch('/api/v1/my-recruitments/:id', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const idx = db.candidate_recruitments.findIndex(
    r => r.id === req.params.id && r.user_id === userId
  );
  if (idx === -1) return res.status(404).json({ error: 'Saved recruitment not found' });

  const VALID_STATUSES = [
    'interested','preparing','ready_to_apply','applied_by_user',
    'admit_card_available','examination_completed','result_available',
    'not_interested','withdrawn','cancelled',
  ];

  const allowed = {};
  if (req.body.application_status) {
    if (!VALID_STATUSES.includes(req.body.application_status)) {
      return res.status(400).json({ error: 'Invalid application_status', valid: VALID_STATUSES });
    }
    allowed.application_status = req.body.application_status;
  }
  if (req.body.notes !== undefined) allowed.notes = req.body.notes;

  db.candidate_recruitments[idx] = { ...db.candidate_recruitments[idx], ...allowed };
  writeAppDb(db);

  res.json(db.candidate_recruitments[idx]);
});

/**
 * POST /api/v1/my-recruitments/:id/checklist
 * Initialize checklist for a saved recruitment from its verified template.
 */
app.post('/api/v1/my-recruitments/:id/checklist', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const savedRec = db.candidate_recruitments.find(
    r => r.id === req.params.id && r.user_id === userId
  );
  if (!savedRec) return res.status(404).json({ error: 'Saved recruitment not found' });

  const records = readRecruitmentDb();
  const job = records.find(r => r.id === savedRec.recruitment_id);
  if (!job) return res.status(404).json({ error: 'Recruitment not found' });

  // Remove any existing checklist items for this saved recruitment
  db.checklist_items = (db.checklist_items || []).filter(
    item => item.candidate_recruitment_id !== req.params.id
  );

  // Generate from job's checklist template
  const template = Array.isArray(job.checklist) ? job.checklist : [];
  const newItems = template.map((label, i) => ({
    id: `CHK-${uid()}`,
    candidate_recruitment_id: req.params.id,
    item_type: 'required_by_notice',
    label: typeof label === 'string' ? label : (label.label || String(label)),
    label_guj: typeof label === 'object' ? label.labelGuj : null,
    required: true,
    status: 'pending',
    sort_order: i,
    completed_at: null,
    evidence_reference: null,
  }));

  // Always add recommended items
  const recommended = [
    { label: 'Read the official notification. Confirm eligibility, conditions, and important dates.', item_type: 'recommended_preparation', required: false },
    { label: 'Submit through the official portal only. Retain submission receipt/confirmation.', item_type: 'recommended_preparation', required: false },
  ];
  recommended.forEach((r, i) => {
    newItems.push({
      id: `CHK-${uid()}`,
      candidate_recruitment_id: req.params.id,
      item_type: r.item_type,
      label: r.label,
      required: r.required,
      status: 'pending',
      sort_order: template.length + i,
    });
  });

  db.checklist_items.push(...newItems);
  writeAppDb(db);

  res.status(201).json({ count: newItems.length, checklist_items: newItems });
});

/**
 * GET /api/v1/my-recruitments/:id/checklist
 * Get checklist items for a saved recruitment.
 */
app.get('/api/v1/my-recruitments/:id/checklist', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const savedRec = db.candidate_recruitments.find(
    r => r.id === req.params.id && r.user_id === userId
  );
  if (!savedRec) return res.status(404).json({ error: 'Saved recruitment not found' });

  const items = (db.checklist_items || [])
    .filter(item => item.candidate_recruitment_id === req.params.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  res.json({ count: items.length, checklist_items: items });
});

/**
 * PATCH /api/v1/checklist-items/:id
 * Update a checklist item status or notes.
 */
app.patch('/api/v1/checklist-items/:id', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const itemIdx = db.checklist_items.findIndex(item => item.id === req.params.id);
  if (itemIdx === -1) return res.status(404).json({ error: 'Checklist item not found' });

  const item = db.checklist_items[itemIdx];
  // Verify ownership through saved recruitment
  const savedRec = db.candidate_recruitments.find(
    r => r.id === item.candidate_recruitment_id && r.user_id === userId
  );
  if (!savedRec) return res.status(403).json({ error: 'Access denied' });

  const VALID_STATUSES = ['pending', 'complete', 'skipped'];
  const updates = {};
  if (req.body.status !== undefined) {
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status', valid: VALID_STATUSES });
    }
    updates.status = req.body.status;
    if (req.body.status === 'complete') updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;
  }
  if (req.body.evidence_reference !== undefined) updates.evidence_reference = req.body.evidence_reference;

  db.checklist_items[itemIdx] = { ...item, ...updates };
  writeAppDb(db);

  res.json(db.checklist_items[itemIdx]);
});

// ── Notifications ─────────────────────────────────────────────

/**
 * GET /api/v1/notifications
 * Fetch notification history for user.
 */
app.get('/api/v1/notifications', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  const notifications = (db.notification_events || [])
    .filter(n => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  res.json({ count: notifications.length, notifications });
});

/**
 * POST /api/v1/notifications  (Admin / System)
 * Create a new notification event with deduplication.
 */
app.post('/api/v1/notifications', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const { user_id, recruitment_id, version_id, event_type, title, body } = req.body;
  if (!user_id || !event_type || !title) {
    return res.status(400).json({ error: 'user_id, event_type, title required' });
  }

  const deduplication_key = `${user_id}::${recruitment_id || 'global'}::${version_id || 'latest'}::${event_type}`;

  const db = readAppDb();
  const exists = (db.notification_events || []).find(n => n.deduplication_key === deduplication_key);
  if (exists) return res.json({ status: 'deduplicated', notification: exists });

  const notification = {
    id: `NOT-${uid()}`,
    user_id,
    recruitment_id: recruitment_id || null,
    version_id: version_id || null,
    event_type,
    deduplication_key,
    title,
    body: body || null,
    delivery_status: 'queued',
    sent_at: null,
    created_at: new Date().toISOString(),
  };

  db.notification_events.push(notification);
  writeAppDb(db);

  res.status(201).json({ status: 'created', notification });
});

/**
 * PATCH /api/v1/notification-preferences  (stub for future use)
 */
app.patch('/api/v1/notification-preferences', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const db = readAppDb();
  if (!db.notification_preferences) db.notification_preferences = {};
  db.notification_preferences[userId] = {
    ...(db.notification_preferences[userId] || {}),
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  writeAppDb(db);
  res.json({ status: 'updated', preferences: db.notification_preferences[userId] });
});

// ── Admin: Review Queue ───────────────────────────────────────

/**
 * GET /api/v1/admin/review-queue
 * List pending review tasks.
 */
app.get('/api/v1/admin/review-queue', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const db = readAppDb();
  const pending = (db.review_tasks || [])
    .filter(t => t.status === 'pending')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  res.json({ count: pending.length, review_tasks: pending });
});

/**
 * POST /api/v1/admin/review-tasks
 * Create a review task (e.g. for a corrigendum or low-confidence field).
 */
app.post('/api/v1/admin/review-tasks', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const { recruitment_id, task_type, reason, document_id } = req.body;
  if (!task_type || !reason) {
    return res.status(400).json({ error: 'task_type and reason required' });
  }

  const db = readAppDb();
  const task = {
    id: `RT-${uid()}`,
    document_id: document_id || null,
    recruitment_id: recruitment_id || null,
    version_id: null,
    task_type,
    reason,
    status: 'pending',
    assigned_to: null,
    reviewed_by: null,
    reviewed_at: null,
    decision_note: null,
    created_at: new Date().toISOString(),
  };

  db.review_tasks.push(task);
  writeAppDb(db);

  res.status(201).json({ status: 'created', review_task: task });
});

/**
 * POST /api/v1/admin/documents/:id/review
 * Approve or reject a proposed record. For authorized reviewers only.
 */
app.post('/api/v1/admin/documents/:id/review', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const { decision, reason, reviewer } = req.body;
  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be "approved" or "rejected"' });
  }

  const db = readAppDb();
  const taskIdx = db.review_tasks.findIndex(t => t.document_id === req.params.id && t.status === 'pending');
  if (taskIdx === -1) {
    // Create an implicit resolved task
    db.review_tasks.push({
      id: `RT-${uid()}`,
      document_id: req.params.id,
      task_type: 'document_review',
      reason: 'Manual review via admin API',
      status: decision,
      reviewed_by: reviewer || 'admin',
      reviewed_at: new Date().toISOString(),
      decision_note: reason || null,
      created_at: new Date().toISOString(),
    });
  } else {
    db.review_tasks[taskIdx] = {
      ...db.review_tasks[taskIdx],
      status: decision,
      reviewed_by: reviewer || 'admin',
      reviewed_at: new Date().toISOString(),
      decision_note: reason || null,
    };
  }

  // If approved and linked to a recruitment, advance publication status
  const records = readRecruitmentDb();
  const linkedTask = db.review_tasks.find(t => t.document_id === req.params.id);
  if (linkedTask?.recruitment_id && decision === 'approved') {
    const job = records.find(r => r.id === linkedTask.recruitment_id);
    if (job && job.publication_status === 'needs_review') {
      job.publication_status = 'verified';
      job.lastVerified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      writeRecruitmentDb(records);
    }
  }

  recordAudit(db, reviewer || 'admin', decision, 'document', req.params.id, null, { decision, reason });
  writeAppDb(db);

  res.json({ status: 'reviewed', decision, documentId: req.params.id });
});

/**
 * GET /api/v1/admin/audit
 * Recent audit events.
 */
app.get('/api/v1/admin/audit', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const db = readAppDb();
  const events = (db.audit_events || [])
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 100);

  res.json({ count: events.length, audit_events: events });
});

/**
 * GET /api/v1/admin/dashboard
 * Admin dashboard stats.
 */
app.get('/api/v1/admin/dashboard', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const records = readRecruitmentDb();
  const db = readAppDb();

  const statusCounts = {};
  for (const r of records) {
    const s = r.publication_status || 'published';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  res.json({
    recruitment_counts: statusCounts,
    pending_reviews: (db.review_tasks || []).filter(t => t.status === 'pending').length,
    total_saved_applications: (db.candidate_recruitments || []).length,
    total_notification_events: (db.notification_events || []).length,
    recent_audit_events: (db.audit_events || [])
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
      .slice(0, 5),
  });
});

// ── Official Sources Registry ─────────────────────────────────

/**
 * GET /api/v1/sources
 * List registered official sources.
 */
app.get('/api/v1/sources', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const db = readAppDb();
  res.json({ count: (db.official_sources || []).length, sources: db.official_sources || [] });
});

/**
 * POST /api/v1/sources
 * Register a new official source.
 */
app.post('/api/v1/sources', (req, res) => {
  if (!requireAdminKey(req, res)) return;

  const { agency_name, source_url, source_type, collection_method } = req.body;
  if (!agency_name || !source_url || !source_type) {
    return res.status(400).json({ error: 'agency_name, source_url, source_type required' });
  }

  const db = readAppDb();
  const source = {
    id: `SRC-${uid()}`,
    agency_name,
    source_url,
    source_type,
    collection_method: collection_method || 'web_listing',
    enabled: true,
    check_interval_minutes: req.body.check_interval_minutes || 360,
    last_checked_at: null,
    last_success_at: null,
    last_error: null,
    created_at: new Date().toISOString(),
  };

  db.official_sources.push(source);
  writeAppDb(db);

  res.status(201).json({ status: 'created', source });
});

// ============================================================
// Serve frontend dist in production
// ============================================================
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`JobDirect Production REST API v3.0 running on http://localhost:${PORT}`);
  console.log(`  Health:           GET  /api/health`);
  console.log(`  Recruitments:     GET  /api/v1/recruitments`);
  console.log(`  Eligibility:      POST /api/v1/recruitments/:id/eligibility-check`);
  console.log(`  My Applications:  GET  /api/v1/my-recruitments  (x-user-id header required)`);
  console.log(`  Admin Dashboard:  GET  /api/v1/admin/dashboard  (x-api-key required)`);
});

export default app;
