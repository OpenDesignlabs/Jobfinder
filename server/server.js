/**
 * JobDirect / Jobfinder Production REST API & Static Server
 * Serves verified Gujarat government recruitments, corrigendum tracking,
 * server-side GAD eligibility evaluations, and production web client build.
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'verified_db.json');
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'jobdirect-secret-key-2026';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Helper to read database
function readDb() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.error('Error reading database:', err);
    return [];
  }
}

// Helper to write database
function writeDb(records) {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf8');
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'JobDirect / Jobfinder Unified Production API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. List all verified Gujarat recruitment openings
app.get('/api/recruitments', (req, res) => {
  let records = readDb();
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

  res.json({
    count: records.length,
    records
  });
});

// 3. Get single recruitment by ID
app.get('/api/recruitments/:id', (req, res) => {
  const records = readDb();
  const record = records.find(r => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Recruitment record not found' });
  }
  res.json(record);
});

// 4. Publish a newly verified recruitment opening (Protected by Admin API Key)
app.post('/api/recruitments', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid X-API-Key header' });
  }

  const { title, advtNo, agency } = req.body;
  if (!title || !advtNo || !agency) {
    return res.status(400).json({ error: 'Missing required fields: title, advtNo, agency' });
  }

  const records = readDb();
  const newRecord = {
    id: req.body.id || `rec-${Date.now()}`,
    ...req.body,
    lastVerified: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  records.unshift(newRecord);
  writeDb(records);
  res.status(201).json({ status: 'created', record: newRecord });
});

// 5. Publish a new verified Corrigendum (Sudhara Jaherat)
app.post('/api/recruitments/:id/corrigenda', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid X-API-Key header' });
  }

  const records = readDb();
  const job = records.find(r => r.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Recruitment record not found' });
  }

  const corr = {
    corrId: req.body.corrId || `CORR-${Date.now()}`,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    category: req.body.category || 'ELIGIBILITY',
    type: req.body.type || 'General Clarification',
    sectionCitation: req.body.sectionCitation || 'Official Notification Addendum',
    beforeText: req.body.beforeText || '',
    afterText: req.body.afterText || '',
    summaryGuj: req.body.summaryGuj || ''
  };

  if (req.body.newClosingDate) {
    job.closingDate = req.body.newClosingDate;
  }

  job.lastVerified = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  job.corrigenda = [corr, ...(job.corrigenda || [])];

  writeDb(records);
  res.status(201).json({ status: 'updated', job, addedCorrigendum: corr });
});

// 6. Get all corrigenda across all recruitments
app.get('/api/corrigenda', (req, res) => {
  const records = readDb();
  const allCorrigenda = [];

  for (const job of records) {
    for (const corr of (job.corrigenda || [])) {
      allCorrigenda.push({
        ...corr,
        jobId: job.id,
        jobTitle: job.title,
        jobTitleGuj: job.titleGuj,
        advtNo: job.advtNo,
        agency: job.agency,
        agencyFull: job.agencyFull
      });
    }
  }

  // Sort by date desc
  allCorrigenda.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  res.json({ count: allCorrigenda.length, corrigenda: allCorrigenda });
});

// 7. Server-side Gujarat GAD Rule Eligibility Evaluator
app.post('/api/evaluate-gad', (req, res) => {
  const { job, profile } = req.body;
  if (!job || !profile) {
    return res.status(400).json({ error: 'Both "job" and "profile" payloads are required.' });
  }

  let relaxYears = 0;
  if (profile.category === 'RESERVED_M' || profile.category === 'GEN_F') {
    relaxYears += 5;
  } else if (profile.category === 'RESERVED_F') {
    relaxYears += 10;
  }
  if (profile.isPwd) relaxYears += 10;
  if (profile.isExServiceman) relaxYears += 3;

  const minAge = job.minAge || (job.ageLimit && job.ageLimit.min) || 18;
  const maxAgeBase = job.maxAgeBase || (job.ageLimit && job.ageLimit.max) || 35;
  const effectiveMaxAge = Math.min(45, maxAgeBase + relaxYears);

  const ageMinOk = profile.age >= minAge;
  const ageMaxOk = profile.age <= effectiveMaxAge;
  const usedRelaxation = profile.age > maxAgeBase && ageMaxOk;

  const EDU_ACCEPTED = {
    ANY: ['HSC', 'GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
    HSC: ['HSC'],
    GRADUATE: ['GRADUATE', 'TECH_DIPLOMA', 'NURSING', 'COMMERCE_PG'],
    TECH_DIPLOMA: ['TECH_DIPLOMA'],
    NURSING: ['NURSING'],
    COMMERCE_PG: ['COMMERCE_PG', 'GRADUATE']
  };

  const userEduSet = EDU_ACCEPTED[profile.education] || [profile.education];
  const jobEduCodes = job.requiredEdu || [];
  const eduOk =
    profile.education === 'ANY' ||
    jobEduCodes.length === 0 ||
    jobEduCodes.some(code => userEduSet.includes(code));

  if (!ageMinOk || !ageMaxOk) {
    return res.json({
      status: 'INELIGIBLE_AGE',
      isEligible: false,
      effectiveMaxAge,
      relaxYears,
      reason: `Your age (${profile.age}) is outside the ${minAge}–${effectiveMaxAge} yr limit under Gujarat GAD rules.`
    });
  }

  if (!eduOk) {
    return res.json({
      status: 'INELIGIBLE_EDU',
      isEligible: false,
      effectiveMaxAge,
      relaxYears,
      reason: job.eduSummaryEn
        ? `Requires: ${job.eduSummaryEn.split('.')[0]}.`
        : 'Qualification does not match requirements for this post.'
    });
  }

  if (usedRelaxation) {
    return res.json({
      status: 'ELIGIBLE_RELAXED',
      isEligible: true,
      effectiveMaxAge,
      relaxYears,
      usedRelaxation: true,
      reason: `Base max age is ${maxAgeBase}, extended to ${effectiveMaxAge} yrs (capped at 45). Valid category certificate required.`
    });
  }

  return res.json({
    status: 'ELIGIBLE',
    isEligible: true,
    effectiveMaxAge,
    relaxYears,
    usedRelaxation: false,
    reason: `Age ${profile.age} fits ${minAge}–${effectiveMaxAge} yrs; qualification matches.`
  });
});

// Serve frontend dist static assets in production
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
  console.log(`JobDirect Production REST API & Server running on http://localhost:${PORT}`);
  console.log(`- API Health: http://localhost:${PORT}/api/health`);
  console.log(`- Recruitments API: http://localhost:${PORT}/api/recruitments`);
  console.log(`- Corrigenda API: http://localhost:${PORT}/api/corrigenda`);
});

export default app;
