# JobDirect (Jobfinder)

> A modern, distraction-free government jobs platform for Indian job seekers. Built with React 19, TypeScript, Tailwind CSS, and Capacitor for Web & Android.

JobDirect simplifies government job discovery by converting complex official notifications into structured, verified, easy-to-read listings without spam, predatory ads, or clickbait.

---

## 🌟 Key Features

- **Ad-Free & Trustworthy**: Direct facts, official links with domain verification, and zero third-party ads.
- **Smart Filtering & Search**:
  - Educational qualification matching (10th, 12th, Graduate, Post Graduate, Engineering, Medical, Law)
  - Categories (Central Govt, Defense, Railways, Banking, State Govt, Police, Teaching, Engineering, Healthcare)
  - Status indicators (Active / Open, Closing Soon, Upcoming)
  - Location/State filters
- **Safe Official Links**: Warns users before opening external sites, verifies government domains (`.gov.in`, `.nic.in`), and prevents malicious redirection.
- **Detailed Recruitment Breakdown**: Modal drawer showing breakdown of vacancies, age criteria, fee exemptions, selection stages, and official PDF links.
- **Dual Experience**:
  - **Desktop/Web**: Sleek, responsive, dark/light mode enabled web interface.
  - **Android Native App**: Full-featured Capacitor Android APK with native toolbar and device optimizations.
- **Clear Data Integrity**: Clearly distinguishes between demonstration records and verified recruitment data.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React
- **Mobile Engine**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/browser`)
- **Code Quality**: Oxlint (0 warnings, 0 errors) & strict TypeScript checks
- **CI/CD**: GitHub Actions workflow for automatic APK compilation and web build

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- *(Optional for local APK build)*: JDK 17 or 21 and Android SDK Command-line Tools

### Installation & Web Development

```bash
# Clone the repository
git clone <your-repo-url>
cd Jobfinder

# Install dependencies
npm install

# Run web development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📦 Building & Deployment

### 1. Web Deployment (Vercel / Netlify / Cloudflare / Static Hosting)

```bash
npm run build
```

The compiled production assets will be in `dist/`.
- **Vercel**: Connect your GitHub repository; Vercel automatically detects Vite with `npm run build` and output directory `dist`.
- **Netlify**: Set build command `npm run build` and publish directory `dist`.
- **Cloudflare Pages / GitHub Pages**: Deploy directory `dist`.

---

### 2. Android APK Generation

#### Option A: Automatic via GitHub Actions (Cloud Build)
Whenever you push your code to GitHub on `main`:
1. The included `.github/workflows/build-apk.yml` workflow automatically runs.
2. It compiles the web bundle, syncs the native Android project, and compiles `app-debug.apk`.
3. Go to your GitHub repository -> **Actions** tab -> Click the latest run -> Download the **jobdirect-debug-apk** artifact!

#### Option B: Local Android Build

To build the APK locally on your computer:

```bash
# 1. Build web assets and sync to Android project
npm run cap:build

# 2. Compile Debug APK with Gradle (Windows)
cd android
.\gradlew.bat assembleDebug

# On Linux / macOS:
cd android
./gradlew assembleDebug
```

The generated APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

You can transfer this `.apk` to any Android device and install it directly.

#### Option C: Open in Android Studio
```bash
npm run cap:open
```

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── build-apk.yml       # Automated GitHub Actions APK build workflow
├── android/                    # Native Android Gradle project (Capacitor)
├── public/                     # Static assets (favicons, icons)
├── src/
│   ├── assets/                 # App assets and illustrations
│   ├── components/             # Reusable UI components
│   │   ├── DeadlineBadge.tsx   # Urgency badge (Closing soon / Open)
│   │   ├── EmptyState.tsx      # Friendly zero-results UI
│   │   ├── FilterPanel.tsx     # Qualification, Category, State filters
│   │   ├── JobCard.tsx         # Job card with eligibility tags
│   │   ├── JobDetailModal.tsx  # In-depth vacancy & syllabus details
│   │   ├── Navbar.tsx          # Brand header with Dark/Light toggle
│   │   ├── OfficialLinkButton  # Safe external link handling
│   │   └── SearchBar.tsx       # Live search input
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Light/Dark mode state
│   ├── data/
│   │   └── jobs.ts             # Government jobs database (demo & verified)
│   ├── pages/
│   │   └── DashboardPage.tsx   # Main job board dashboard
│   ├── types/
│   │   └── job.ts              # Job and filter TypeScript definitions
│   └── utils/
│       ├── dateUtils.ts        # Date calculation & formatting
│       ├── eligibilityUtils.ts # Educational matching utilities
│       └── filterUtils.ts      # Multi-facet search & filter engine
├── capacitor.config.ts         # Capacitor Android application configuration
└── package.json
```

---

## 🛡️ License & Disclaimer

JobDirect is an independent platform for informational purposes only. It is not affiliated with or endorsed by any government authority. Information should always be verified against official notifications published on official `.gov.in` and `.nic.in` portals.
