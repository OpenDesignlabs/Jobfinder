// ============================================================
// JobDirect – Mock Job Data (Demonstration Records)
// ============================================================
//
// IMPORTANT: All records below are labelled dataQuality: 'demo'.
// They are illustrative examples only.
// - Vacancies, salaries, dates, and fees are approximate references
//   drawn from publicly available past recruitment notices.
// - Official URLs point to real recruiting-body home pages but
//   notification/apply links are marked unavailable.
// - Do NOT present these values to users as current verified data.
//
// ── Data ingestion strategy (for production) ──────────────────
//  1. Parse official Employment News, recruiting body RSS/notification
//     feeds, and sarkariresult.com / india.gov.in/govtjobs.
//  2. Store raw source URL + fetch timestamp per record.
//  3. Deduplicate on (department + recruitmentId + applicationEnd).
//  4. Mark stale if applicationEnd > 30 days past without a result update.
//  5. Require human review before promoting dataQuality → 'verified'.
// ──────────────────────────────────────────────────────────────

import type { Job } from '../types/job';

export const DEMO_JOBS: Job[] = [
  // ------------------------------------------------------------------
  // 1. RRB NTPC Undergraduate — Demo (closed)
  // ------------------------------------------------------------------
  {
    id: 'rrb-ntpc-ug-2024',
    recruitmentId: 'CEN 05/2024 (Illustrative)',
    department: 'Railway Recruitment Boards (RRBs)',
    title: 'NTPC Undergraduate Posts',
    sector: 'railways',
    shortDescription:
      'Non-Technical Popular Categories (NTPC) undergraduate-level posts across Indian Railways — Junior Clerk cum Typist, Accounts Clerk cum Typist, Junior Time Keeper, Trains Clerk, and Commercial-cum-Ticket Clerk.',

    minQualification: ['12th_general', '12th_pcm'],
    qualificationNote:
      '12th pass (any stream) from a recognised board. Some posts may require typing proficiency. Refer to the official notification for post-wise eligibility.',

    ageLimit: {
      min: 18,
      max: 33,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 3 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 11558,
    vacancyBreakdown: [
      { post: 'Junior Clerk cum Typist', count: 990 },
      { post: 'Accounts Clerk cum Typist', count: 361 },
      { post: 'Junior Time Keeper', count: 20 },
      { post: 'Trains Clerk', count: 544 },
      { post: 'Commercial cum Ticket Clerk', count: 2972 },
      { post: 'Station Master', count: 994 },
      { post: 'Goods Guard', count: 3144 },
      { post: 'Senior Commercial cum Ticket Clerk', count: 1736 },
      { post: 'Senior Clerk cum Typist', count: 736 },
      { post: 'Junior Account Assistant cum Typist', count: 1161 },
    ],

    salary: {
      payLevel: 'Level 2 to Level 5 (7th CPC)',
      payScale: '₹19,900 – ₹47,600',
      displayText: '₹19,900 – ₹47,600 (Pay Level 2–5)',
    },

    applicationFee: {
      general: 500,
      obc: 500,
      scSt: 250,
      exServicemen: 250,
      women: 250,
      currency: 'INR',
      note: 'Fee refunded after appearing in CBT-1. Exact fee structure subject to official notification.',
    },

    importantDates: {
      notificationDate: '2024-09-14',
      applicationStart: '2024-09-14',
      applicationEnd: '2024-10-13',
      examDate: '2025-03-01',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Computer-Based Test 1 (CBT-1)',
        description: 'Screening test – Mathematics, General Intelligence & Reasoning, General Awareness',
      },
      { order: 2, name: 'Computer-Based Test 2 (CBT-2)', description: 'Main examination – post-wise syllabus' },
      {
        order: 3,
        name: 'Typing Skill Test / Computer-Based Aptitude Test',
        description: 'Only for relevant posts',
      },
      { order: 4, name: 'Document Verification & Medical Examination' },
    ],

    requiredDocuments: [
      '10th / Matriculation certificate (date of birth proof)',
      '12th pass certificate and mark sheet',
      'Category certificate (SC/ST/OBC/EWS), if applicable',
      'PwBD certificate, if applicable',
      'Ex-Servicemen discharge certificate, if applicable',
      'Valid photo identity proof',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Applications must be submitted online through the official RRB regional website. Hard copies are NOT accepted. Ensure all documents are uploaded in the specified format and size.',

    officialLinks: {
      officialWebsite: 'https://indianrailways.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'closed',
    dataQuality: 'demo',
    lastUpdated: '2025-01-01',
    tags: ['railway', 'ntpc', 'ug', '12th-pass', 'clerk', 'typist'],
  },

  // ------------------------------------------------------------------
  // 2. SSC CHSL — Demo (closed)
  // ------------------------------------------------------------------
  {
    id: 'ssc-chsl-2024',
    recruitmentId: 'SSC CHSL 2024 (Illustrative)',
    department: 'Staff Selection Commission (SSC)',
    title: 'Combined Higher Secondary Level (CHSL) Examination',
    sector: 'ssc',
    shortDescription:
      'SSC CHSL recruits Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), Postal Assistant (PA), Sorting Assistant (SA), and Data Entry Operator (DEO) in various Central Government Ministries and Departments.',

    minQualification: ['12th_general', '12th_pcm'],
    qualificationNote:
      '12th pass (any stream) from a recognised Board/University. For DEO in C&AG: Science stream with Mathematics as a subject in 12th. Refer to official notification for post-wise details.',

    ageLimit: {
      min: 18,
      max: 27,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 3 },
        { category: 'Central Govt. Employees (for certain posts)', relaxationYears: 5 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 3712,
    vacancyBreakdown: [
      { post: 'Lower Division Clerk / Junior Secretariat Assistant', count: 2045 },
      { post: 'Postal Assistant / Sorting Assistant', count: 1010 },
      { post: 'Data Entry Operator (DEO)', count: 657 },
    ],

    salary: {
      payLevel: 'Level 2 and Level 4 (7th CPC)',
      payScale: '₹19,900 – ₹35,400',
      displayText: '₹19,900 – ₹35,400 (Pay Level 2 & 4)',
    },

    applicationFee: {
      general: 100,
      obc: 100,
      scSt: 0,
      exServicemen: 0,
      women: 0,
      currency: 'INR',
      note: 'Female / SC / ST / PwBD / Ex-Servicemen candidates are exempted from application fee.',
    },

    importantDates: {
      notificationDate: '2024-06-24',
      applicationStart: '2024-06-24',
      applicationEnd: '2024-07-24',
      examDate: '2024-12-01',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Tier-I: CBT',
        description: 'Objective – English, Quantitative Aptitude, General Intelligence, General Awareness',
      },
      {
        order: 2,
        name: 'Tier-II: Descriptive + Skill Test',
        description:
          'Descriptive paper (Essay/Letter); Typing / Data Entry skill test for qualified candidates',
      },
      { order: 3, name: 'Document Verification' },
    ],

    requiredDocuments: [
      'Matriculation / 10th certificate',
      '12th pass certificate and mark sheet',
      'Category certificate (SC/ST/OBC/EWS), if applicable',
      'PwBD certificate, if applicable',
      'Ex-Servicemen discharge book, if applicable',
      'Domicile certificate (if state quota)',
      'Valid photo ID (Aadhaar / Passport / Voter ID)',
    ],

    applicationInstructions:
      'Apply online at the SSC official website. One-time registration required. Candidates must keep their application number and login credentials safe.',

    officialLinks: {
      officialWebsite: 'https://ssc.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'closed',
    dataQuality: 'demo',
    lastUpdated: '2025-01-01',
    tags: ['ssc', 'chsl', '12th-pass', 'ldc', 'postal', 'deo', 'central-govt'],
  },

  // ------------------------------------------------------------------
  // 3. Indian Navy SSR — Demo (upcoming, future deadline)
  // ------------------------------------------------------------------
  {
    id: 'navy-ssr-2025-01',
    recruitmentId: 'Navy SSR 01/2026 (Illustrative)',
    department: 'Indian Navy',
    title: 'Sailor – Senior Secondary Recruit (SSR)',
    sector: 'defense_police',
    shortDescription:
      'The Indian Navy recruits SSR sailors for technical branches including Artificer Apprentice and other technical trades. PCM (Physics, Chemistry, Mathematics) in 12th is mandatory.',

    minQualification: ['12th_pcm'],
    qualificationNote:
      'Must have passed 10+2 / equivalent with Physics, Chemistry, and Mathematics (PCM) and English from a recognised Board. Minimum aggregate marks may apply — refer to the official notification.',

    ageLimit: {
      min: 17,
      max: 21,
      relaxations: [
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
      ],
    },
    nationality: 'Indian Citizen (unmarried male)',
    physicalStandards:
      'Height ≥ 157 cm (general). Weight proportional to height. Chest 5 cm expansion. Vision: 6/6 each eye (no spectacles). Medical fitness as per Naval standards.',

    totalVacancies: 2800,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 1190 },
      { category: 'OBC', count: 756 },
      { category: 'SC', count: 420 },
      { category: 'ST', count: 210 },
      { category: 'EWS', count: 224 },
    ],

    salary: {
      payLevel: 'Level 3 (7th CPC) + X Group Pay',
      payScale: '₹21,700 + ₹6,200 MSP',
      displayText: '₹21,700 + ₹6,200 MSP (approx. ₹33,100 in-hand during training)',
    },

    applicationFee: {
      general: 0,
      obc: 0,
      scSt: 0,
      exServicemen: 0,
      currency: 'INR',
      note: 'No application fee for Indian Navy SSR.',
    },

    importantDates: {
      notificationDate: '2026-10-01',
      applicationStart: '2026-10-05',
      applicationEnd: '2026-11-30',
      examDate: '2027-02-01',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Computer-Based Written Test',
        description: 'English, Science (PCM), Mathematics, General Knowledge',
      },
      {
        order: 2,
        name: 'Physical Fitness Test (PFT)',
        description: '1.6 km run (7 min), 20 squats, 10 push-ups',
      },
      { order: 3, name: 'Medical Examination', description: 'Naval medical standards' },
      { order: 4, name: 'Merit List & Document Verification' },
    ],

    requiredDocuments: [
      '10th certificate and mark sheet (date of birth proof)',
      '12th certificate and mark sheet (Physics, Chemistry, Mathematics)',
      'Category certificate (SC/ST/OBC/EWS), if applicable',
      'Domicile / Residence certificate',
      'Aadhaar card',
      'Passport-size photographs (recent)',
      'NCC certificate (if applicable)',
    ],

    applicationInstructions:
      'Apply online at the official Indian Navy recruitment portal joinindiannavy.gov.in. Hard copies are not accepted. Candidates must have a valid email and mobile number for communication.',

    officialLinks: {
      officialWebsite: 'https://joinindiannavy.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'open',
    dataQuality: 'demo',
    lastUpdated: '2026-10-01',
    tags: ['navy', 'ssr', 'sailor', 'pcm', '12th-pcm', 'defense', 'technical'],
  },

  // ------------------------------------------------------------------
  // 4. SBI Clerk (Junior Associates) — Demo (closed)
  // ------------------------------------------------------------------
  {
    id: 'sbi-clerk-2024',
    recruitmentId: 'SBI Clerk 2024 (Illustrative)',
    department: 'State Bank of India (SBI)',
    title: 'Junior Associates (Customer Support & Sales)',
    sector: 'banking',
    shortDescription:
      'SBI recruits Junior Associates for clerical cadre positions across branches in India. Graduation in any discipline is the minimum qualification.',

    minQualification: ['graduate'],
    qualificationNote:
      'Graduation in any discipline from a recognised University. Proficiency in the official language of the state / UT for which the candidate is applying is desirable.',

    ageLimit: {
      min: 20,
      max: 28,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen / Disabled Ex-Servicemen', relaxationYears: 5 },
        { category: 'Widows / Divorced women / Judicially separated women', relaxationYears: 9 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 8773,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 3618 },
      { category: 'OBC', count: 2332 },
      { category: 'SC', count: 1407 },
      { category: 'ST', count: 703 },
      { category: 'EWS', count: 713 },
    ],

    salary: {
      payLevel: 'Basic Pay ₹26,730 (revised)',
      displayText: '₹26,730 basic + DA + HRA + other allowances (approx. ₹41,960 CTC)',
    },

    applicationFee: {
      general: 750,
      obc: 750,
      scSt: 0,
      exServicemen: 0,
      women: 0,
      currency: 'INR',
      note: 'SC/ST/PwBD candidates are exempted from fee.',
    },

    importantDates: {
      notificationDate: '2024-11-01',
      applicationStart: '2024-11-07',
      applicationEnd: '2024-11-27',
      examDate: '2025-01-05',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Preliminary Examination',
        description: 'English Language, Numerical Ability, Reasoning Ability',
      },
      {
        order: 2,
        name: 'Main Examination',
        description:
          'General / Financial Awareness, Quantitative Aptitude, Reasoning & Computer Aptitude, English Language',
      },
      { order: 3, name: 'Local Language Test (Provisional)' },
      { order: 4, name: 'Document Verification & Medical Examination' },
    ],

    requiredDocuments: [
      'Valid photo ID proof',
      'Graduation certificate and mark sheets',
      'Birth certificate / 10th certificate',
      'Category certificate (SC/ST/OBC/EWS/PwBD), if applicable',
      'Ex-Servicemen discharge certificate, if applicable',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online through the SBI recruitment portal at sbi.co.in/careers. Candidates must register first, then complete the application form and fee payment.',

    officialLinks: {
      officialWebsite: 'https://sbi.co.in/careers',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'closed',
    dataQuality: 'demo',
    lastUpdated: '2025-01-01',
    tags: ['banking', 'sbi', 'clerk', 'graduate', 'central-banking'],
  },

  // ------------------------------------------------------------------
  // 5. UP Police Constable — Demo (open, future deadline)
  // ------------------------------------------------------------------
  {
    id: 'up-police-constable-2024',
    recruitmentId: 'UP Police Constable 2026 (Illustrative)',
    department: 'Uttar Pradesh Police Recruitment & Promotion Board (UPPRPB)',
    title: 'Constable (Civil Police)',
    sector: 'defense_police',
    shortDescription:
      'UPPRPB recruits Constable (Civil Police) for the state of Uttar Pradesh. Candidates must be 12th pass and meet physical standards.',

    minQualification: ['12th_general', '12th_pcm'],
    qualificationNote:
      'Intermediate (12th pass) or equivalent from a recognised board. No minimum marks percentage specified — refer to official notification.',

    ageLimit: {
      min: 18,
      max: 22,
      relaxations: [
        { category: 'OBC (UP domicile)', relaxationYears: 3 },
        { category: 'SC/ST (UP domicile)', relaxationYears: 5 },
        { category: 'Ex-Servicemen', relaxationYears: 5 },
        { category: 'PwBD', relaxationYears: 15 },
      ],
    },
    nationality: 'Indian Citizen with UP domicile (conditions apply)',
    physicalStandards:
      'Male (General/OBC/SC): Height ≥ 168 cm, Chest 79 cm (83 expanded). Male (ST): Height ≥ 160 cm. Female (General/OBC/SC): Height ≥ 152 cm. Refer to notification for complete standards.',

    totalVacancies: 60244,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 24720 },
      { category: 'OBC', count: 16266 },
      { category: 'SC', count: 12652 },
      { category: 'ST', count: 600 },
      { category: 'EWS', count: 6006 },
    ],

    salary: {
      payLevel: 'Pay Band ₹21,700 + Grade Pay ₹2,000',
      displayText: '₹21,700 + Grade Pay ₹2,000 + allowances',
    },

    applicationFee: {
      general: 400,
      obc: 400,
      scSt: 400,
      exServicemen: 400,
      currency: 'INR',
      note: 'Online payment only. Fee once paid is non-refundable.',
    },

    importantDates: {
      notificationDate: '2026-09-20',
      applicationStart: '2026-09-25',
      applicationEnd: '2026-12-31',
      examDate: '2027-03-15',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Written Examination (Computer-Based)',
        description:
          'General Hindi, General Knowledge, Numerical & Mental Ability, Mental Aptitude / IQ / Reasoning',
      },
      { order: 2, name: 'Physical Efficiency Test (PET)', description: 'Running / Endurance test' },
      { order: 3, name: 'Physical Standard Test (PST)', description: 'Height and chest measurement' },
      { order: 4, name: 'Document Verification & Medical Examination' },
    ],

    requiredDocuments: [
      'High School (10th) marksheet and certificate',
      'Intermediate (12th) marksheet and certificate',
      'Domicile certificate (Uttar Pradesh)',
      'Category certificate, if applicable',
      'Physical disability certificate, if applicable',
      'Aadhaar card / valid photo ID',
      'Recent passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at the UPPRPB official website. Offline applications are not accepted. Mobile number and email ID required for registration.',

    officialLinks: {
      officialWebsite: 'https://uppbpb.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'open',
    dataQuality: 'demo',
    lastUpdated: '2026-09-20',
    tags: ['police', 'constable', 'state-govt', 'up', '12th-pass', 'physical'],
  },

  // ------------------------------------------------------------------
  // 6. IBPS PO — Demo (result declared)
  // ------------------------------------------------------------------
  {
    id: 'ibps-po-2024',
    recruitmentId: 'IBPS PO/MT XIV – 2024 (Illustrative)',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    title: 'Probationary Officer / Management Trainee (PO/MT)',
    sector: 'banking',
    shortDescription:
      'IBPS CRP PO/MT recruits Probationary Officers / Management Trainees in participating public sector banks across India. Graduation is the minimum qualification.',

    minQualification: ['graduate'],
    qualificationNote:
      'Graduation in any discipline from a University recognised by the Government of India. Final year students appearing in qualifying examination are also eligible, subject to conditions.',

    ageLimit: {
      min: 20,
      max: 30,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 5 },
      ],
    },

    totalVacancies: 4455,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 1837 },
      { category: 'OBC', count: 1204 },
      { category: 'SC', count: 668 },
      { category: 'ST', count: 334 },
      { category: 'EWS', count: 412 },
    ],

    salary: {
      payLevel: 'JMG Scale-I',
      payScale: '₹36,000 – ₹63,840',
      displayText: '₹36,000 – ₹63,840 (JMG Scale-I) + DA + other allowances',
    },

    applicationFee: {
      general: 850,
      obc: 850,
      scSt: 175,
      exServicemen: 175,
      currency: 'INR',
      note: 'Inclusive of GST. Online payment through Debit/Credit card or Internet Banking.',
    },

    importantDates: {
      notificationDate: '2024-07-01',
      applicationStart: '2024-07-01',
      applicationEnd: '2024-07-21',
      examDate: '2024-10-19',
      resultDate: '2025-01-15',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Preliminary Examination',
        description: 'English Language, Quantitative Aptitude, Reasoning Ability',
      },
      {
        order: 2,
        name: 'Main Examination',
        description:
          'Reasoning & Computer Aptitude, Data Analysis & Interpretation, General Economy & Banking Awareness, English Language',
      },
      { order: 3, name: 'Interview', description: 'Conducted by participating banks' },
      { order: 4, name: 'Document Verification' },
    ],

    requiredDocuments: [
      'Graduation certificate / consolidated mark sheet',
      '10th / 12th pass certificate',
      'Valid photo ID (Aadhaar / Passport / Voter ID / Driving Licence)',
      'Category certificate, if applicable',
      'PwBD certificate, if applicable',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at ibps.in. Register first using basic details, then log in to fill the complete application and pay the fee.',

    officialLinks: {
      officialWebsite: 'https://ibps.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'result_declared',
    dataQuality: 'demo',
    lastUpdated: '2025-01-15',
    tags: ['banking', 'ibps', 'po', 'probationary-officer', 'graduate', 'public-sector-bank'],
  },

  // ------------------------------------------------------------------
  // 7. SSC MTS — Demo (closed)
  // ------------------------------------------------------------------
  {
    id: 'ssc-mts-2024',
    recruitmentId: 'SSC MTS 2024 (Illustrative)',
    department: 'Staff Selection Commission (SSC)',
    title: 'Multi-Tasking (Non-Technical) Staff & Havaldar Examination',
    sector: 'ssc',
    shortDescription:
      'SSC MTS recruits Multi-Tasking Staff (MTS) and Havaldar in Central Government offices and CBIC/CBN. Minimum qualification is 10th pass.',

    minQualification: ['10th', '12th_general', '12th_pcm', 'graduate', 'iti_diploma'],
    qualificationNote: '10th pass (Matriculation) from a recognised Board is the minimum qualification.',

    ageLimit: {
      min: 18,
      max: 25,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 3 },
        { category: 'Central Govt. Employees (MTS Havaldar)', relaxationYears: 5 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 9583,
    vacancyBreakdown: [
      { post: 'Multi-Tasking Staff (MTS)', count: 6144 },
      { post: 'Havaldar (CBIC & CBN)', count: 3439 },
    ],

    salary: {
      payLevel: 'Level 1 (MTS) and Level 2 (Havaldar) — 7th CPC',
      payScale: '₹18,000 – ₹22,900',
      displayText: '₹18,000 – ₹22,900 (Pay Level 1–2)',
    },

    applicationFee: {
      general: 100,
      obc: 100,
      scSt: 0,
      exServicemen: 0,
      women: 0,
      currency: 'INR',
      note: 'Female / SC / ST / PwBD / Ex-Servicemen candidates are exempted.',
    },

    importantDates: {
      notificationDate: '2024-06-27',
      applicationStart: '2024-06-27',
      applicationEnd: '2024-07-31',
      examDate: '2024-11-30',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Session-I: Numerical & Mathematical Ability, Reasoning & Problem Solving',
        description: 'Objective MCQ test',
      },
      {
        order: 2,
        name: 'Session-II: General Awareness, English Language & Comprehension',
        description: 'Objective MCQ test',
      },
      {
        order: 3,
        name: 'Physical Efficiency Test (PET) / Physical Standard Test (PST)',
        description: 'Only for Havaldar post',
      },
      { order: 4, name: 'Document Verification' },
    ],

    requiredDocuments: [
      '10th certificate and mark sheet',
      'Category certificate (SC/ST/OBC/EWS), if applicable',
      'PwBD certificate, if applicable',
      'Ex-Servicemen discharge book, if applicable',
      'Valid photo ID (Aadhaar / Voter ID / Passport)',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at ssc.gov.in. Candidates should register on SSC One-Time Registration portal before applying. Mobile number must be linked to Aadhaar for OTP-based verification.',

    officialLinks: {
      officialWebsite: 'https://ssc.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'closed',
    dataQuality: 'demo',
    lastUpdated: '2025-01-01',
    tags: ['ssc', 'mts', 'havaldar', '10th-pass', 'central-govt', 'group-c'],
  },

  // ------------------------------------------------------------------
  // 8. RRB Group D — Demo (open, future deadline)
  // ------------------------------------------------------------------
  {
    id: 'rrb-group-d-2025',
    recruitmentId: 'CEN 02/2026 (Illustrative)',
    department: 'Railway Recruitment Boards (RRBs)',
    title: 'Level-1 Posts (Group D)',
    sector: 'railways',
    shortDescription:
      'RRB Group D recruits Track Maintainer, Helper/Assistant in Electrical/Engineering/Mechanical/Signal & Telecommunication departments, and other Level-1 posts across Indian Railways.',

    minQualification: ['10th', '12th_general', '12th_pcm', 'iti_diploma'],
    qualificationNote:
      '10th pass + ITI (NCVT/SCVT) in relevant trade, OR 10th pass + 2 years National Apprenticeship Certificate, OR 12th pass. Refer to official notification for post-wise trades.',

    ageLimit: {
      min: 18,
      max: 36,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 3 },
      ],
    },

    totalVacancies: 32438,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 13350 },
      { category: 'OBC', count: 8758 },
      { category: 'SC', count: 4866 },
      { category: 'ST', count: 2435 },
      { category: 'EWS', count: 3229 },
    ],

    salary: {
      payLevel: 'Level 1 (7th CPC)',
      payScale: '₹18,000 – ₹56,900',
      displayText: '₹18,000 (starting) + DA + allowances',
    },

    applicationFee: {
      general: 500,
      obc: 500,
      scSt: 250,
      exServicemen: 250,
      women: 250,
      currency: 'INR',
      note: 'Fee partially refunded on appearing in CBT.',
    },

    importantDates: {
      notificationDate: '2026-09-15',
      applicationStart: '2026-09-15',
      applicationEnd: '2026-11-15',
      examDate: '2027-02-20',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Computer-Based Test (CBT)',
        description:
          'Mathematics, General Intelligence & Reasoning, General Science, General Awareness & Current Affairs',
      },
      {
        order: 2,
        name: 'Physical Efficiency Test (PET)',
        description:
          '35 kg carry for 100 m in 2 minutes (male); 20 kg carry for 100 m in 2 minutes (female)',
      },
      { order: 3, name: 'Document Verification & Medical Examination' },
    ],

    requiredDocuments: [
      '10th certificate and mark sheet',
      'ITI / NAC certificate (if applicable)',
      '12th certificate (if applicable)',
      'Category certificate, if applicable',
      'Ex-Servicemen discharge certificate, if applicable',
      'Valid photo ID',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online through the respective RRB regional website. Single application per CEN — applying to multiple RRBs will lead to rejection.',

    officialLinks: {
      officialWebsite: 'https://indianrailways.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'open',
    dataQuality: 'demo',
    lastUpdated: '2026-09-15',
    tags: ['railway', 'group-d', 'level-1', '10th-pass', 'iti', 'track-maintainer'],
  },

  // ------------------------------------------------------------------
  // 9. SSC CGL — Demo (upcoming)
  // ------------------------------------------------------------------
  {
    id: 'ssc-cgl-2026',
    recruitmentId: 'SSC CGL 2026 (Illustrative)',
    department: 'Staff Selection Commission (SSC)',
    title: 'Combined Graduate Level (CGL) Examination',
    sector: 'ssc',
    shortDescription:
      'SSC CGL recruits for Group B and C posts in various Ministries, Departments, and Organisations of the Government of India. Graduation is the minimum qualification.',

    minQualification: ['graduate'],
    qualificationNote:
      'Graduation in any discipline from a recognised University. Some posts require specific degrees — refer to the official notification for post-wise educational criteria.',

    ageLimit: {
      min: 18,
      max: 32,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 3 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 17727,
    vacancyBreakdown: [
      { post: 'Assistant Section Officer (CSS)', count: 1392 },
      { post: 'Assistant (MEA)', count: 47 },
      { post: 'Inspector (CBIC)', count: 3614 },
      { post: 'Inspector (CBI)', count: 218 },
      { post: 'Sub-Inspector (CBI)', count: 116 },
      { post: 'Tax Assistant (CBDT/CBIC)', count: 4543 },
      { post: 'Statistical Investigator Grade-II', count: 756 },
      { post: 'Other posts', count: 7041 },
    ],

    salary: {
      payLevel: 'Pay Level 4 to Pay Level 8 (7th CPC)',
      payScale: '₹25,500 – ₹1,12,400',
      displayText: '₹25,500 – ₹1,12,400 (Pay Level 4–8)',
    },

    applicationFee: {
      general: 100,
      obc: 100,
      scSt: 0,
      exServicemen: 0,
      women: 0,
      currency: 'INR',
      note: 'Female / SC / ST / PwBD / Ex-Servicemen candidates are exempted from application fee.',
    },

    importantDates: {
      notificationDate: '2026-12-01',
      applicationStart: '2026-12-05',
      applicationEnd: '2027-01-05',
      examDate: '2027-04-01',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Tier-I: Objective CBT',
        description: 'General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, English Comprehension',
      },
      {
        order: 2,
        name: 'Tier-II: Objective CBT',
        description: 'Mathematical Abilities, Reasoning & General Intelligence, English Language, General Awareness, Computer Knowledge',
      },
      { order: 3, name: 'Document Verification' },
    ],

    requiredDocuments: [
      'Graduation certificate and mark sheets',
      '10th / 12th pass certificate',
      'Category certificate, if applicable',
      'PwBD certificate, if applicable',
      'Valid photo ID (Aadhaar / Passport / Voter ID)',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at ssc.gov.in. Complete SSC One-Time Registration (OTR) before applying. Keep registration number and password safe for future reference.',

    officialLinks: {
      officialWebsite: 'https://ssc.gov.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'upcoming',
    dataQuality: 'demo',
    lastUpdated: '2026-10-01',
    tags: ['ssc', 'cgl', 'graduate', 'group-b', 'group-c', 'central-govt', 'officer'],
  },

  // ------------------------------------------------------------------
  // 10. IBPS Clerk — Demo (open, closing soon)
  // ------------------------------------------------------------------
  {
    id: 'ibps-clerk-2026',
    recruitmentId: 'IBPS CRP Clerk XVI – 2026 (Illustrative)',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    title: 'Common Recruitment Process – Clerical Cadre (CRP Clerk)',
    sector: 'banking',
    shortDescription:
      'IBPS CRP Clerk recruits for clerical cadre positions in participating public sector banks. Graduation in any discipline is the minimum qualification.',

    minQualification: ['graduate'],
    qualificationNote:
      'Degree (Graduation) in any discipline from a University recognised by the Govt. of India. Proficiency in official language of the state applied for is preferred.',

    ageLimit: {
      min: 20,
      max: 28,
      relaxations: [
        { category: 'OBC (Non-Creamy Layer)', relaxationYears: 3 },
        { category: 'SC/ST', relaxationYears: 5 },
        { category: 'PwBD (General)', relaxationYears: 10 },
        { category: 'Ex-Servicemen', relaxationYears: 5 },
        { category: 'Widows / Divorced women', relaxationYears: 9 },
      ],
    },
    nationality:
      'Indian Citizen / Nepalese / Bhutanese / Tibetan Refugee / Person of Indian Origin as per notification',

    totalVacancies: 6128,
    vacancyBreakdown: [
      { category: 'General (UR)', count: 2529 },
      { category: 'OBC', count: 1655 },
      { category: 'SC', count: 919 },
      { category: 'ST', count: 413 },
      { category: 'EWS', count: 612 },
    ],

    salary: {
      payLevel: 'Basic Pay ₹19,900 + allowances',
      displayText: '₹19,900 basic + DA + HRA + other allowances',
    },

    applicationFee: {
      general: 850,
      obc: 850,
      scSt: 175,
      exServicemen: 175,
      currency: 'INR',
      note: 'Online payment through Net Banking / Debit Card / Credit Card / UPI.',
    },

    importantDates: {
      notificationDate: '2026-09-01',
      applicationStart: '2026-09-05',
      applicationEnd: '2026-10-25',
      examDate: '2026-12-06',
    },

    selectionProcess: [
      {
        order: 1,
        name: 'Preliminary Examination',
        description: 'English Language, Numerical Ability, Reasoning Ability',
      },
      {
        order: 2,
        name: 'Main Examination',
        description: 'Reasoning, Quantitative Aptitude, English Language, General / Financial Awareness, Computer Knowledge',
      },
      { order: 3, name: 'Document Verification' },
    ],

    requiredDocuments: [
      'Graduation certificate and mark sheets',
      '10th and 12th pass certificate',
      'Category certificate, if applicable',
      'PwBD certificate, if applicable',
      'Valid photo ID',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at ibps.in. New candidates must register first. Existing registered candidates can login directly.',

    officialLinks: {
      officialWebsite: 'https://ibps.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'closing_soon',
    dataQuality: 'demo',
    lastUpdated: '2026-09-05',
    tags: ['banking', 'ibps', 'clerk', 'graduate', 'public-sector-bank'],
  },

  // ------------------------------------------------------------------
  // 11. Indian Army Agniveer — Demo (open)
  // ------------------------------------------------------------------
  {
    id: 'army-agniveer-2026',
    recruitmentId: 'Agniveer Army 01/2026 (Illustrative)',
    department: 'Indian Army',
    title: 'Agniveer (General Duty, Clerk/SKT, Technical, Tradesmen)',
    sector: 'defense_police',
    shortDescription:
      'Indian Army recruits Agniveers under the Agnipath scheme for a four-year tenure across General Duty, Clerk, Technical, and Tradesman categories. 10th/12th/ITI pass candidates may apply depending on category.',

    minQualification: ['10th', '12th_general', '12th_pcm', 'iti_diploma'],
    qualificationNote:
      'Minimum qualification varies by category: GD – 10th pass (45% aggregate, 33% per subject); Clerk/SKT – 12th pass (60% aggregate); Technical – 12th pass with Physics, Chemistry, Math & English (50% aggregate); Tradesman – 10th/8th pass or ITI. Refer to official notification.',

    ageLimit: {
      min: 17,
      max: 23,
      relaxations: [
        { category: 'SC/ST', relaxationYears: 0 },
      ],
    },
    nationality: 'Indian Citizen',
    physicalStandards:
      'Height varies by category (157–170 cm). Weight proportional. Medical fitness as per Army standards. Vision 6/6 for GD/Technical; relaxed for others.',

    totalVacancies: 25000,
    vacancyBreakdown: [
      { category: 'Agniveer GD (General Duty)', count: 13000 },
      { category: 'Agniveer Clerk / SKT', count: 4500 },
      { category: 'Agniveer Technical', count: 5000 },
      { category: 'Agniveer Tradesmen (10th)', count: 2000 },
      { category: 'Agniveer Tradesmen (8th)', count: 500 },
    ],

    salary: {
      payLevel: 'Customised Package (Year 1–4)',
      displayText: '₹30,000/month (Year 1) scaling to ₹40,000/month (Year 4) + benefits',
    },

    applicationFee: {
      general: 250,
      obc: 250,
      scSt: 250,
      exServicemen: 0,
      currency: 'INR',
      note: 'Online fee payment only.',
    },

    importantDates: {
      notificationDate: '2026-08-01',
      applicationStart: '2026-08-10',
      applicationEnd: '2026-11-10',
      examDate: '2026-12-20',
    },

    selectionProcess: [
      { order: 1, name: 'Common Entrance Exam (CEE)', description: 'Online exam for Clerk, Technical categories' },
      { order: 2, name: 'Physical Fitness Test (PFT)', description: '1.6 km run, pull-ups, beam balance, 9 feet ditch' },
      { order: 3, name: 'Medical Examination', description: 'Army medical fitness standards' },
      { order: 4, name: 'Document Verification & Merit List' },
    ],

    requiredDocuments: [
      '10th certificate (date of birth / education proof)',
      '12th / ITI certificate as applicable',
      'Aadhaar card',
      'Domicile / Relationship certificate',
      'Category certificate, if applicable',
      'NCC / Sports certificate, if applicable',
      'Passport-size photographs',
    ],

    applicationInstructions:
      'Apply online at joinindianarmy.nic.in. Candidates must register and apply online only. Physical rally dates and venues are announced separately for each recruitment zone.',

    officialLinks: {
      officialWebsite: 'https://joinindianarmy.nic.in',
      notificationPdf: undefined,
      applyOnline: undefined,
      verified: false,
      lastVerified: undefined,
    },

    status: 'open',
    dataQuality: 'demo',
    lastUpdated: '2026-08-10',
    tags: ['army', 'agniveer', 'agnipath', 'defense', '10th-pass', '12th-pass', 'iti', 'gd', 'technical'],
  },
];
