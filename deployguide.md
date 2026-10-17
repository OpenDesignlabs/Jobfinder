# Jobfinder / JobDirect — Complete Deployment Guide 🚀

This document provides complete, step-by-step instructions to deploy every component of **Jobfinder / JobDirect**:
1. **Frontend Web App (React 19 + Vite + Tailwind CSS SPA)**
2. **Backend REST API Server (Node.js + Express v3.0)**
3. **Database (PostgreSQL or Zero-Config Flat-File)**
4. **Android Native Mobile App (Capacitor Android)**

---

## Architecture Overview

```
                                 ┌───────────────────────────────┐
                                 │      GitHub Repository        │
                                 │    OpenDesignlabs/Jobfinder   │
                                 └──────────────┬────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐       ┌──────────────────────────────┐
│     OPTION 1: All-in-One     │       │     OPTION 2: Decoupled      │       │     OPTION 3: Production     │
│   Render / Railway / Koyeb   │       │   Frontend: Vercel / Cloud   │       │          Self-Hosted         │
│  (Single URL for Web & API)  │       │   Backend: Render / Railway  │       │      Ubuntu VPS + Nginx      │
└──────────────────────────────┘       └──────────────────────────────┘       └──────────────────────────────┘
```

The repository includes ready-to-use configuration files:
- [`render.yaml`](./render.yaml): Automatic 1-click full-stack configuration for Render.
- [`vercel.json`](./vercel.json): Client-side SPA routing and proxy rules for Vercel.
- [`package.json`](./package.json): Standard scripts (`npm run build`, `npm start`, `npm run cap:build`).

---

## Option 1: All-in-One Full-Stack Deployment (Render — Easiest & Free)

In this approach, the Express server (`server/server.js`) hosts both the API endpoints (`/api/*`) and serves the compiled React single-page application (`dist/`). Both live on a single custom domain or free `onrender.com` subdomain.

### Method A: One-Click Deploy via Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository: `OpenDesignlabs/Jobfinder`.
4. Render will detect [`render.yaml`](./render.yaml) automatically:
   - **Service Name**: `jobfinder-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Apply**.
6. Wait 2–3 minutes for the build to complete. Your application will be live at `https://jobfinder-app.onrender.com`.

### Method B: Manual Web Service Setup on Render
1. Click **New +** → **Web Service**.
2. Select repository: `OpenDesignlabs/Jobfinder`.
3. Fill in the following fields:
   - **Name**: `jobfinder`
   - **Region**: `Singapore` (Recommended for Gujarat/India users for low latency)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Advanced** → **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `ADMIN_API_KEY` = `<your-secure-custom-key>`
5. Click **Create Web Service**.

---

## Option 2: Decoupled Deployment (High-Performance Edge CDN + Backend)

Deploying the frontend to a global edge CDN (Vercel or Cloudflare Pages) ensures instant page loading across India, while the backend API runs independently.

### Step 1: Deploy Web Frontend to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import the `OpenDesignlabs/Jobfinder` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.
5. Vercel will use [`vercel.json`](./vercel.json) to handle React Router client-side routes smoothly.

### Step 2: Deploy Backend REST API to Render or Railway
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `npm run server`
4. Note your backend URL (e.g. `https://jobfinder-api.onrender.com`).
5. (Optional) In Vercel, set the environment variable:
   - `VITE_API_URL` = `https://jobfinder-api.onrender.com`

---

## Option 3: Production VPS Self-Hosted (Ubuntu 24.04 / Hetzner / AWS / DigitalOcean)

Ideal for high traffic, custom domains, and full privacy compliance with Gujarat government standards.

### 1. Server Prerequisites
- Ubuntu 22.04 or 24.04 LTS VPS ($4–$6/month, 1-2 vCPU, 2GB RAM).
- Connect via SSH:
  ```bash
  ssh root@your-server-ip
  ```

### 2. Install Node.js, Nginx, and PM2
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# Install PM2 Process Manager
sudo npm install -g pm2
```

### 3. Clone Repository & Build Application
```bash
# Clone to web root
sudo git clone https://github.com/OpenDesignlabs/Jobfinder.git /var/www/jobfinder
cd /var/www/jobfinder

# Install dependencies and build client bundle
sudo npm install
sudo npm run build

# Start server under PM2
sudo pm2 start server/server.js --name "jobfinder"
sudo pm2 startup
sudo pm2 save
```

### 4. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/jobfinder`:
```nginx
server {
    server_name jobfinder.yourdomain.com;

    # Gzip compression for fast mobile loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/jobfinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Install Free SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d jobfinder.yourdomain.com
```
Certbot will automatically renew your certificates.

### 6. (Optional) Setting Up Production PostgreSQL Database
If switching from the default JSON flat-file storage to PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```
```sql
CREATE DATABASE jobfinder_db;
CREATE USER jobfinder_user WITH ENCRYPTED PASSWORD 'StrongSecretPasswordHere';
GRANT ALL PRIVILEGES ON DATABASE jobfinder_db TO jobfinder_user;
\q
```
Initialize the schema:
```bash
psql -U jobfinder_user -d jobfinder_db -f /var/www/jobfinder/server/schema.sql
```

---

## Option 4: Android Mobile App Deployment

The application is fully synchronized with Capacitor Android in the [`android/`](./android) directory.

### 1. Build Production Web Assets and Sync
Run from project root:
```bash
npm run cap:build
```
This runs `npm run build` and updates `android/app/src/main/assets/public`.

### 2. Direct APK Distribution (Website Download or GitHub Releases)
To build a test/debug APK:
```powershell
cd android
cmd.exe /c "gradlew.bat assembleDebug"
```
- **Generated APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- You can copy this APK to `public/download/jobfinder.apk` or upload it directly to a **GitHub Release** on `OpenDesignlabs/Jobfinder`.

### 3. Google Play Store Release (AAB)
To generate an Android App Bundle (`.aab`) for Google Play Console:

1. **Generate a signing keystore** (if you don't already have one):
   ```bash
   keytool -genkey -v -keystore jobfinder-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias jobfinder-alias
   ```
2. **Configure Signing in `android/app/build.gradle`**:
   Add signing configs under `android`:
   ```groovy
   signingConfigs {
       release {
           storeFile file("jobfinder-release-key.jks")
           storePassword System.getenv("KEYSTORE_PASSWORD")
           keyAlias "jobfinder-alias"
           keyPassword System.getenv("KEY_PASSWORD")
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
   }
   ```
3. **Build Release Bundle**:
   ```powershell
   cd android
   cmd.exe /c "gradlew.bat bundleRelease"
   ```
- **Output File**: `android/app/build/outputs/bundle/release/app-release.aab`
- Upload this `.aab` file to the [Google Play Console](https://play.google.com/console) under **Production** or **Open Testing**.

---

## Verification & Health Checks

Once deployed, verify your endpoints:

| Endpoint | Method | Expected Output | Purpose |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | `{"status":"ok","timestamp":...}` | Server health monitor |
| `/api/v1/recruitments` | `GET` | Array of 20 verified Gujarat recruitments | Data feeds |
| `/api/v1/recruitments/:id/eligibility-check` | `POST` | `{"overall_status":"likely_eligible",...}` | GAD Statutory Calculator |
| `/api/v1/admin/dashboard` | `GET` | Stats and counts (requires `x-api-key`) | Admin overview |
| `/` | `GET` | HTML index of React web application | Web user interface |

---

## Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode optimizations |
| `PORT` | `3000` (or host assigned e.g. `10000`) | Port the Express server listens on |
| `ADMIN_API_KEY` | `jobdirect-secret-key-2026` | Secret key required for admin review endpoints |
| `DATABASE_URL` | *(Optional)* | PostgreSQL connection URI if connecting to external DB |

---

## Helpful Commands Summary

```bash
# Run development server (Vite)
npm run dev

# Run local backend REST API
npm run server

# Full production build + Android sync
npm run cap:build

# Run production server locally
npm start

# Open Android Studio
npm run cap:open
```
