# 🚀 Class Mate — Production Deployment Guide

This guide details how to deploy **Class Mate** to production. Class Mate is architected as a full-stack web application with a React 18 + Vite frontend and an Express Node.js backend.

---

## 📋 Recommended Deployment Options

| Platform | Difficulty | Tier | Recommended For |
| :--- | :---: | :---: | :--- |
| **Render** | ⭐ Easy (1-Click) | Free Tier Available | **Single Full-Stack Web Service (Recommended)** |
| **Railway** | ⭐ Easy | Free Trial | Full-Stack Container / Node App |
| **Vercel + Render** | ⭐⭐ Intermediate | Free Tier Available | Decoupled Frontend (Vercel) + API (Render) |
| **Docker / VPS** | ⭐⭐ Intermediate | Self-Hosted | AWS, DigitalOcean, GCP Cloud Run, Linode |

---

## Option 1: Deploy to Render (Easiest — 1-Click Full Stack)

Render automatically detects the included `render.yaml` blueprint or root `package.json`.

### Steps:
1. Go to [render.com](https://render.com/) and log in (e.g. with GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/dwarakalokeshsadhu-bit/classMate`.
4. Configure the service:
   * **Name**: `class-mate`
   * **Region**: Choose the region closest to you (e.g., Singapore, Frankfurt, Oregon)
   * **Branch**: `main`
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
   * **Plan**: `Free`
5. **Environment Variables**:
   Under **Advanced** → **Add Environment Variable**:
   * `NODE_ENV`: `production`
   * `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/). If omitted, Class Mate runs its built-in smart demo offline engine.
6. Click **Create Web Service**.
7. In ~2 minutes, your live URL will be active at: `https://class-mate-xxxx.onrender.com`.

> [!TIP]
> In production, Express automatically serves the compiled Vite frontend from `client/dist` and handles API requests on `/api/*` on the exact same port. No CORS configuration or reverse proxies needed!

---

## Option 2: Deploy to Railway

Railway detects either the root `package.json` or the included `Dockerfile`.

### Steps:
1. Go to [railway.app](https://railway.app/) and log in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `dwarakalokeshsadhu-bit/classMate`.
4. Railway will automatically build using the multi-stage `Dockerfile` or `npm run build`.
5. Under **Variables**, add:
   * `NODE_ENV`: `production`
   * `PORT`: `5000` (or leave default for Railway assigned port)
   * `GEMINI_API_KEY`: *(Optional)* Your Gemini API key.
6. Under **Settings** → **Networking**, click **Generate Domain**.
7. Your app is live!

---

## Option 3: Decoupled (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel's global edge CDN:

### 1. Deploy the Backend on Render
- Follow Option 1, setting root directory to `server`.
- Build Command: `npm install`
- Start Command: `npm start`
- Note your backend URL, e.g.: `https://class-mate-api.onrender.com`

### 2. Deploy the Frontend on Vercel
- Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
- Select the `classMate` repository.
- Root Directory: `client`
- Build Command: `vite build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL`: `https://class-mate-api.onrender.com`
- Click **Deploy**. Vercel uses the included `client/vercel.json` for SPA routing.

---

## Option 4: Docker Container Deployment (Self-Hosted / Cloud Run)

The repository includes a production multi-stage `Dockerfile` that packages both the frontend and backend into an Alpine Linux container (~150 MB).

### Build & Run Locally:
```bash
# 1. Build the Docker image
docker build -t class-mate .

# 2. Run container on port 5000
docker run -d -p 5000:5000 --name class-mate-app -e GEMINI_API_KEY=your_key class-mate

# 3. Open browser
http://localhost:5000
```

### Deploy to Google Cloud Run:
```bash
gcloud run deploy class-mate \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

---

## 🔒 Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Port for the Express web server (cloud hosts set this automatically). |
| `NODE_ENV` | No | `development` | Set to `production` for production static file serving and optimizations. |
| `GEMINI_API_KEY` | Optional | `none` | Enables live multimodal and text generation with Google Gemini 2.5. |
| `CORS_ORIGIN` | Optional | `*` | Comma-separated list of allowed origins (e.g. `https://my-app.vercel.app`). |

---

## ✅ Healthcheck Endpoint

Verify that your deployment is active by calling:
```http
GET https://your-domain.com/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "Class Mate API",
  "team": "Team 07",
  "llmConfigured": true,
  "mode": "live-ai",
  "environment": "production",
  "timestamp": "2026-09-10T08:30:00.000Z"
}
```
