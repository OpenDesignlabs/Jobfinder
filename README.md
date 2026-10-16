# JobDirect (examsuchana.in) — Gujarat Government Recruitment Platform

> A modern, distraction-free government jobs & recruitment intelligence platform for Indian job seekers (focus on Gujarat state & central recruitments). Built with React 19, TypeScript, Tailwind CSS v4, Express REST API, and Capacitor for Web & Android.

---

## 🌟 Key Features Integrated from JobDirect Production

### 1. 🛡️ Gujarat GAD Rule-Based Eligibility Engine
- Implements official **General Administration Department (GAD)** age relaxation rules:
  - **SEBC / SC / ST / EWS (Male)**: +5 Years relaxation (capped at 45)
  - **General (Female)**: +5 Years relaxation (capped at 45)
  - **SEBC / SC / ST / EWS (Female)**: +10 Years relaxation (capped at 45)
  - **PwD / Divyang**: +10 Years additional relaxation
  - **Ex-Servicemen**: +3 Years additional relaxation
- Dynamically computes candidate's exact age from Date of Birth and validates against post-specific educational requirements (`HSC`, `GRADUATE`, `TECH_DIPLOMA`, `NURSING`, `COMMERCE_PG`).
- Real-time dynamic eligibility badges on every job card (`✓ Eligible via +5 Yr GAD Relaxation`, `✓ Eligible (Standard Match)`, `✕ Age Out of Range`, `⚠ Qualification Mismatch`).

### 2. 📢 Corrigendum Monitor (સુધારા જાહેરાત ટ્રેકર)
- Source-backed tracking of amendments and notices published after original advertisements.
- Side-by-side **Before (Original Clause)** vs **After (Verified Amendment)** clause diffs.
- Categorized by **Deadline Extensions**, **Vacancy Revisions**, **Eligibility Rules**, and **Fee Refund / Exam Alerts**.
- Direct section citations and Gujarati summaries (`summaryGuj`).

### 3. 📋 Saved Applications & Document Vault
- **Personal Application Pipeline**: Track application lifecycle across 6 stages:
  - *Interested* → *Preparing Docs* → *Applied* → *Admit Card* → *Exam Done* → *Result Awaited*.
- **OJAS Common Document Readiness Vault**: Standard Gujarat recruitment checklist (OTR profile, Non-Creamy Layer Parishistha-4, Caste/EWS, CCC certificate, Degree marksheets, Domicile/LC, Bank refund details) synced across saved applications.
- **In-Browser OJAS Photo & Signature Spec Checker**: Client-side validator checking file size (≤ 15 KB) and format (JPG/JPEG) before uploading to OJAS.
- **Print / PDF Export**: Clean printable readiness summary.

### 4. ⚙️ Admin & Publisher Studio
- CMS interface for verified recruitment officers to publish new verified vacancies and official corrigenda directly to the backend REST API using an API secret key (`x-api-key`).

### 5. 🚀 Production REST API & Static Server
- Standalone Node/Express server (`server/server.js`) with endpoints:
  - `GET /api/health`: Health status and service timestamp.
  - `GET /api/recruitments`: List verified recruitments (filter by agency or search query).
  - `GET /api/recruitments/:id`: Fetch single recruitment details.
  - `POST /api/recruitments`: Publish new recruitment (protected via `x-api-key`).
  - `POST /api/recruitments/:id/corrigenda`: Publish corrigendum to existing notice.
  - `GET /api/corrigenda`: Aggregated list of all corrigenda across all recruitments.
  - `POST /api/evaluate-gad`: Server-side Gujarat GAD eligibility calculation.
  - Static hosting: Serves the Vite production build (`dist/`) directly.
- Preloaded with 9 verified Gujarat recruitments (`server/verified_db.json`).
- Includes PostgreSQL / Supabase production schema (`server/schema.sql`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React
- **Backend / Server**: Node.js, Express, CORS, JSON Database, PostgreSQL schema
- **Mobile Native**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/browser`)
- **Code Quality**: Oxlint & strict TypeScript compiler checks (`tsc -b`)

---

## 🚀 Running the Project

### 1. Web Development (Frontend)
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 2. Run Production REST Server (Website & API)
```bash
npm run build
npm run server
```
- Web Application & API: [http://localhost:3000](http://localhost:3000)
- API Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Recruitments API: [http://localhost:3000/api/recruitments](http://localhost:3000/api/recruitments)
- Corrigenda API: [http://localhost:3000/api/corrigenda](http://localhost:3000/api/corrigenda)

---

## 📱 Mobile App (Android / Capacitor)

### Build Web Assets and Sync to Android Project:
```bash
npm run cap:build
```

### Open Native Project in Android Studio:
```bash
npm run cap:open
```

### Compile Debug APK locally (Windows):
```bash
cd android
.\gradlew.bat assembleDebug
```
The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📂 Project Structure

```
├── android/                         # Capacitor Android native project
├── server/                          # Production REST API & Server
│   ├── server.js                    # Express API & Static Server
│   ├── verified_db.json             # 9 verified Gujarat recruitment records
│   ├── schema.sql                   # PostgreSQL / Supabase production schema
│   └── package.json                 # Standalone server manifest
├── src/
│   ├── components/
│   │   ├── CandidateProfileBar.tsx  # GAD eligibility profile controls
│   │   ├── JobCard.tsx              # Job card with dynamic GAD badges & bookmark
│   │   ├── JobDetailModal.tsx       # Full modal with GAD check, diffs & timeline
│   │   ├── Navbar.tsx               # 4-tab responsive navigation header
│   │   ├── FilterPanel.tsx          # Qualification & Sector filters
│   │   ├── SearchBar.tsx            # Live instant search
│   │   └── OfficialLinkButton.tsx   # Verified official portal links
│   ├── contexts/
│   │   ├── CandidateProfileContext  # Age, DOB, Category & GAD profile state
│   │   ├── SavedJobsContext.tsx     # Application tracker pipeline & vault
│   │   └── ThemeContext.tsx         # Dark / Light theme toggle
│   ├── data/
│   │   └── jobs.ts                  # Verified Gujarat recruitment records (GPSC, GSSSB, etc.)
│   ├── pages/
│   │   ├── DashboardPage.tsx        # Main job feed with GAD & agency pills
│   │   ├── CorrigendumPage.tsx      # Corrigendum monitor with before/after diffs
│   │   ├── SavedPage.tsx            # Pipeline & OJAS document vault
│   │   └── AdminPage.tsx            # Publisher CMS studio
│   ├── types/
│   │   └── job.ts                   # Unified TypeScript definitions
│   └── utils/
│       ├── gadEligibilityUtils.ts   # Gujarat GAD rule relaxation engine
│       ├── dateUtils.ts             # IST deadline calculation
│       └── filterUtils.ts           # Facet search & sorting
├── capacitor.config.ts              # Capacitor Android app configuration
└── package.json
```
