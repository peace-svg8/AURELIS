# Aurelis Launch Checklist & Scaling Guide

This document contains the critical steps required to deploy the application and scale it to handle 2,000 concurrent users. 

## 1. Hosting Architecture
- **Frontend:** Vercel (Auto-deploys perfectly)
- **Backend:** Render (Run the `server` folder as a Node Web Service)

## 2. Environment Variables Configuration

### On Vercel (Frontend)
- `VITE_API_URL`: Set this to your Render backend URL (e.g., `https://your-backend-name.onrender.com`). **Do not include a trailing slash.**

### On Render (Backend)
- `FRONTEND_URL`: Set to your Vercel domain (e.g., `https://your-frontend.vercel.app`). This fixes the CORS Network Errors.
- `ADMIN_PASSWORD`: Your password for the admin dashboard (e.g., `aurelis2026`).
- `RESEND_API_KEY`: Your email API key.

## 3. Scaling for 2,000 Concurrent Users (Launch Day)

If you expect a massive spike of 2,000 concurrent buyers, you MUST complete these three steps or the server/database will crash.

### Step A: Upgrade Supabase to Transaction Pooling (Crucial)
If 2,000 users buy a watch, they will open 2,000 direct database connections, instantly crashing the free Postgres tier.
1. Go to your Supabase Dashboard -> **Settings -> Database -> Connection String**
2. Make sure you select the **"Connection Pooling"** tab (not Direct Connection).
3. The port in the URL should be **`6543`** (not `5432`), and it should end with `?pgbouncer=true`.
4. Use this URL for your `DATABASE_URL` and use the direct `5432` URL for `DIRECT_URL` on Render.

### Step B: Enable Redis Caching (Crucial)
Your Node.js server will buckle if 2,000 people load the homepage and it has to ask the database for the watches catalog 2,000 times a second. 
The code already has caching built-in, you just need to provide a database!
1. Go to Upstash or Render and create a free Redis database.
2. Take the connection string they give you and add it as the **`REDIS_URL`** environment variable on your Render backend.
3. Node.js will now serve the catalog from memory in ~2 milliseconds instead of querying the DB.

### Step C: Scale Up Your Render Plan
The free/hobby tier of Render gives you 512MB of RAM and a fraction of a CPU. 
1. Upgrade your Render web service to at least the "Standard" or "Pro" tier for launch day. 
2. You can safely scale it back down to a cheaper tier the day after the launch traffic subsides.

*(Note: The codebase has already been updated with the `trust proxy` setting to ensure the rate-limiter handles Render's reverse proxy correctly during high traffic!)*
