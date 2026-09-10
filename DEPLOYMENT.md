# 🚀 Class Mate — Production Deployment Guide

This guide walks you step-by-step through deploying **Class Mate**:
- **Backend API Server** $\to$ **Render** (`https://<your-backend>.onrender.com`)
- **Frontend React App** $\to$ **Vercel** (`https://<your-frontend>.vercel.app`)
- **Repository**: [https://github.com/dwarakalokeshsadhu-bit/classMate](https://github.com/dwarakalokeshsadhu-bit/classMate)

---

## 📌 Architecture Overview

```
┌────────────────────────────────┐         ┌─────────────────────────────────┐
│     Vercel (Frontend)          │         │       Render (Backend)          │
│  https://classmate.vercel.app  │ ──────> │ https://classmate.onrender.com  │
│  (React + Vite Single Page App)│  HTTPS  │ (Express + Node.js API + Gemini)│
└────────────────────────────────┘         └─────────────────────────────────┘
```

> [!IMPORTANT]
> **Always deploy the Backend on Render FIRST**, so that you obtain your Render backend URL (e.g. `https://classmate-backend.onrender.com`). You will paste this URL into Vercel as `VITE_API_URL`.

---

## 1️⃣ STEP 1: Deploy Backend to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **"New +"** button at the top right and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select or connect `dwarakalokeshsadhu-bit/classMate`.
4. Configure the service settings:
   - **Name**: `classmate-api` *(or any name you prefer)*
   - **Region**: Select the region closest to you (e.g., `Singapore`, `Frankfurt`, or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `server` *(CRITICAL: Type `server` here)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**:

| Key | Recommended Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `5000` | Render automatically binds this port |
| `CORS_ORIGIN` | `*` | Or specify your Vercel URL once deployed |
| `GEMINI_API_KEY` | `your_api_key_here` | *(Optional)* If omitted, Class Mate runs in Smart Demo AI mode |

6. Click **"Deploy Web Service"**.
7. Wait ~1–2 minutes for the build to complete. Once finished, Render will display your live backend URL at the top:
   ```
   https://classmate-api.onrender.com
   ```
8. **Verify Backend Health**:
   Open `https://<your-backend-url>.onrender.com/api/health` in your browser. You should see:
   ```json
   {
     "status": "ok",
     "service": "Class Mate API",
     "llmConfigured": true,
     "mode": "live-ai"
   }
   ```

---

## 2️⃣ STEP 2: Deploy Frontend to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** $\to$ **"Project"**.
3. Import your GitHub repository: `dwarakalokeshsadhu-bit/classMate`.
4. Configure the project settings:
   - **Project Name**: `classmate` *(or any name you prefer)*
   - **Framework Preset**: `Vite` *(Vercel usually auto-detects Vite)*
   - **Root Directory**: Click **Edit** and select `client` *(CRITICAL: Must point to `client`)*
   - **Build Command**: `npm run build` *(Default)*
   - **Output Directory**: `dist` *(Default)*
   - **Install Command**: `npm install` *(Default)*
5. Expand the **"Environment Variables"** section and add:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://classmate-api.onrender.com` | **Replace with your actual Render URL from Step 1 (NO trailing slash)** |

6. Click **"Deploy"**.
7. Vercel will build and deploy your app in ~30–45 seconds.
8. Click the preview card to open your live application:
   ```
   https://classmate.vercel.app
   ```

---

## 3️⃣ STEP 3: Verification & Test Checklist

- [ ] **Home Page**: The landing page loads with the announcement banner, StudyFetch-inspired mega menus, and feature showcase.
- [ ] **Sign In / Create Account**: Enter student credentials (or click Sign In). The student workspace opens showing the decent student profile avatar.
- [ ] **Toggle Bar**:
  - `User Details` button opens the Student Profile Modal.
  * Bottom user card displays the student avatar image, name, and `[👤 Details]` button.
  * Clicking `Details` shows streak, subjects, academic ID, and allows profile editing.
- [ ] **AI Study Tools**: Paste or upload class notes $\to$ click **"Generate Study Resources"**. Flashcards, 60-second summary, adaptive quiz, and AI tutor work seamlessly.
- [ ] **Study Plan**: Click **"Study Plan"**, select any exam date or preset pill (1d, 3d, 7d, 14d), and verify the dynamic day schedule renders.

---

## ❓ Common "What If" Questions & Troubleshooting

### Q1: What if Render's Free Tier goes to sleep?
- **Behavior**: On Render's Free plan, web services spin down after 15 minutes of inactivity. When a new request arrives, Render takes **~30–50 seconds** to wake up (known as a "cold start").
- **How Class Mate handles this**: The app checks `/api/health` asynchronously in the background. Subsequent requests are lightning-fast.
- **Tip**: You can use a free uptime monitor (like [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org/)) to ping `https://your-backend.onrender.com/api/health` every 10 minutes to keep your Render instance warm 24/7!

### Q2: What if page refresh on Vercel gives a 404?
- **Solved**: We added `client/vercel.json` with rewrite rules pointing all routes to `/index.html`. Single Page Application (SPA) routing is 100% supported.

### Q3: What if I update my backend URL or API key later?
- In **Vercel**: Go to *Project Settings* $\to$ *Environment Variables* $\to$ update `VITE_API_URL` $\to$ click *Redeploy*.
- In **Render**: Go to *Environment* $\to$ update `GEMINI_API_KEY` $\to$ Render auto-redeploys.

### Q4: Can I change the default profile picture?
- Yes! The default decent avatar image is stored at `client/public/avatar.png`.
- You can replace this file anytime with any square image (`.png` or `.jpg`), and every user account will automatically display the new picture.
