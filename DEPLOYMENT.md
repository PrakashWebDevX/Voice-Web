# VoiceForge Deployment Guide

This guide provides step-by-step instructions for deploying the VoiceForge platform. The architecture is split into a Next.js frontend (optimized for Vercel) and a backend (optimized for Render).

## 1. Frontend Deployment (Vercel)

Vercel is the creator of Next.js and provides the best hosting experience for the frontend.

### Steps:
1. **Push Code to GitHub:**
   Ensure all your code is pushed to your GitHub repository (`https://github.com/PrakashWebDevX/Voice-Web`).
2. **Create a Vercel Account:**
   Go to [Vercel.com](https://vercel.com/) and sign up using your GitHub account.
3. **Import Project:**
   - Click **Add New...** -> **Project**.
   - Select your `Voice-Web` repository from GitHub.
4. **Configure Project:**
   - **Framework Preset:** Vercel should auto-detect `Next.js`.
   - **Root Directory:** If your Next.js app is inside a folder (like `frontend`), click `Edit` next to Root Directory and select the `frontend` folder.
   - **Environment Variables:** Copy all variables from your `frontend/.env.local.example` into the Environment Variables section in Vercel. Make sure to provide the actual production values (e.g., your real API keys).
5. **Deploy:**
   - Click the **Deploy** button.
   - Vercel will build and deploy your frontend. You'll receive a live URL (e.g., `https://voiceforge.vercel.app`).

---

## 2. Backend Deployment (Render)

Render is excellent for hosting Node.js/Express, Python, or Go backends.

### Steps:
1. **Create a Render Account:**
   Go to [Render.com](https://render.com/) and sign up with GitHub.
2. **Create a Web Service:**
   - Click **New +** -> **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect your `Voice-Web` repository.
3. **Configure Service:**
   - **Name:** e.g., `voiceforge-api`.
   - **Root Directory:** If your backend is in a folder, enter `backend` (or the respective folder name).
   - **Environment:** Select `Node` (or `Python` depending on your backend tech stack).
   - **Build Command:** Usually `npm install` or `npm run build`.
   - **Start Command:** Usually `npm start` or `node server.js`.
4. **Environment Variables:**
   - Scroll down to **Environment Variables** and add everything from your `backend/.env.example` with real production values.
   - Ensure you set any CORS settings in your backend to allow requests from your Vercel frontend URL.
5. **Deploy:**
   - Click **Create Web Service**.
   - Render will build and deploy your backend. It will provide a URL like `https://voiceforge-api.onrender.com`.

---

## 3. Post-Deployment Checklist
- Update the frontend environment variable (e.g., `NEXT_PUBLIC_API_URL`) in Vercel to point to your new Render backend URL. Redeploy Vercel if necessary.
- Test the application end-to-end (e.g., WebSocket connections, API calls) to ensure the frontend and backend communicate successfully.
