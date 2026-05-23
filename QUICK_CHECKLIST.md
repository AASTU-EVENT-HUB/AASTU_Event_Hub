# ⚡ QUICK ACTION CHECKLIST - Google OAuth on Render

Copy this checklist and work through it step by step.

---

## ✅ Pre-Deployment Checklist (Code)

- [x] Google routes are mounted in `server.js`
- [x] `/api/auth/google` endpoint exists
- [x] `/api/auth/google/callback` endpoint exists
- [x] Passport Google Strategy is configured
- [x] Frontend has Google Sign-In button
- [x] `.env` file has Google credentials
- [x] Code is pushed to GitHub branch `azeb`

**Status:** ✅ All code checks passed!

---

## 📋 Render Setup Checklist

### Backend Service

- [ ] Go to https://dashboard.render.com/
- [ ] Click **"+ New"** → **"Web Service"**
- [ ] Connect GitHub → Select `AASTU_Event_Hub`
- [ ] Fill in:
  - Name: `aastu-backend`
  - Environment: Node
  - Branch: `azeb`
  - Build: `cd backend && npm install`
  - Start: `cd backend && npm start`
  - Plan: Free
- [ ] Click **"Create Web Service"**

**Status:** Service created

---

## 🔑 Render Environment Variables Checklist

### Add to aastu-backend Service

Go to: **aastu-backend** → **Environment** tab

Add each variable (click "+ Add Environment Variable"):

#### Critical - Google OAuth

- [ ] `GOOGLE_CLIENT_ID` = (from Google Cloud Console)
- [ ] `GOOGLE_CLIENT_SECRET` = (from Google Cloud Console - keep secret!)
- [ ] `BACKEND_URL` = `https://aastu-backend.onrender.com`

#### Required - Server Config

- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = (generate random secret, 32+ chars)
- [ ] `PORT` = `10000`

#### Required - Frontend URLs

- [ ] `CORS_ORIGIN` = `https://aastu-frontend.onrender.com`
- [ ] `FRONTEND_URL` = `https://aastu-frontend.onrender.com`

#### Database - Choose ONE

**Option A: SQLite (Simple, not production-ready)**

- [ ] `DB_TYPE` = `sqlite`

**Option B: MySQL (Recommended)**

- [ ] Create account at: https://planetscale.com/
- [ ] Create database and get connection string
- [ ] Run `backend/schema.sql` in database
- [ ] `DB_TYPE` = `mysql`
- [ ] `DB_HOST` = (from PlanetScale)
- [ ] `DB_USER` = (from PlanetScale)
- [ ] `DB_PASSWORD` = (from PlanetScale)
- [ ] `DB_NAME` = `aastu_events`

**Status:** All environment variables set

---

## 🎨 Frontend Service Checklist

- [ ] Go to https://dashboard.render.com/
- [ ] Click **"+ New"** → **"Static Site"**
- [ ] Connect GitHub → Select `AASTU_Event_Hub`
- [ ] Fill in:
  - Name: `aastu-frontend`
  - Branch: `azeb`
  - Build: `npm install && npm run build`
  - Publish: `frontend/dist`
  - Plan: Free
- [ ] Click **"Create Static Site"**
- [ ] Go to **Environment** tab
- [ ] Add: `VITE_API_URL` = `https://aastu-backend.onrender.com/api`

**Status:** Frontend deployed

---

## 🔐 Google Cloud Console Checklist

- [ ] Go to https://console.cloud.google.com/
- [ ] Select your project
- [ ] Go to **APIs & Services** → **Credentials**
- [ ] Find your OAuth client (should be the one with your Client ID)
- [ ] Click to edit
- [ ] Find **"Authorized redirect URIs"** section
- [ ] Add: `https://aastu-backend.onrender.com/api/auth/google/callback`
- [ ] Click **"Save"**
- [ ] Wait 1-2 minutes for changes to apply

**Status:** Google Cloud updated

---

## 🧪 Testing Checklist

### Test 1: Backend Health

- [ ] Open: `https://aastu-backend.onrender.com/`
- [ ] Should see: `{"success": true, "message": "AASTU Events API Running"}`
- [ ] If error: Check backend logs in Render dashboard

### Test 2: Frontend Loads

- [ ] Open: `https://aastu-frontend.onrender.com/`
- [ ] Page should load without errors
- [ ] Check browser console (F12) for errors

### Test 3: Google Sign-In (Main Test)

- [ ] Open: `https://aastu-frontend.onrender.com/login`
- [ ] Click **"Sign in with Google"**
- [ ] Should redirect to Google consent screen
- [ ] After approval, should show loading then redirect to dashboard
- [ ] Should be logged in

### Test 4: Verify Backend Logs

- [ ] Go to Render dashboard
- [ ] Click **aastu-backend** service
- [ ] Click **Logs** tab
- [ ] Look for:
  - `🚀 Server running on port 10000` ✅
  - No `GOOGLE_CLIENT_ID is required` error ✅
  - No database connection errors ✅

**Status:** All tests passing ✅

---

## ❌ Troubleshooting Checklist

### Problem: "Cannot GET /api/auth/google"

**Check 1:** Environment variables set in Render?

- [ ] Go to aastu-backend → Environment
- [ ] Verify `GOOGLE_CLIENT_ID` exists
- [ ] Verify `GOOGLE_CLIENT_SECRET` exists
- [ ] If missing, add them and redeploy

**Check 2:** Backend logs show error?

- [ ] Go to aastu-backend → Logs
- [ ] Look for `GOOGLE_CLIENT_ID is required`
- [ ] If found, variables not loaded properly

**Check 3:** Service redeployed?

- [ ] After adding env variables, wait 2-3 minutes
- [ ] Render auto-redeploys when variables change
- [ ] Check "Latest deploy" status

### Problem: "Invalid redirect_uri from Google"

**Check 1:** Google Cloud Console updated?

- [ ] Go to https://console.cloud.google.com/
- [ ] Verify OAuth redirect URI is set to:
      `https://aastu-backend.onrender.com/api/auth/google/callback`
- [ ] If different, update and wait 1-2 minutes

**Check 2:** Service name correct?

- [ ] Is your backend service called `aastu-backend`?
- [ ] If different name, use actual name in URL
- [ ] Example: `https://my-backend-name.onrender.com/api/auth/google/callback`

### Problem: "CORS Error - No Access-Control-Allow-Origin header"

**Check 1:** CORS_ORIGIN variable set?

- [ ] Go to aastu-backend → Environment
- [ ] Find `CORS_ORIGIN` variable
- [ ] Should match frontend URL exactly
- [ ] Example: `https://aastu-frontend.onrender.com`

**Check 2:** Frontend URL correct?

- [ ] What's your actual frontend URL? (from Render)
- [ ] Update `CORS_ORIGIN` to match it exactly
- [ ] Redeploy backend

### Problem: "Database connection failed"

**Check 1:** Using SQLite?

- [ ] If using SQLite, set `DB_TYPE=sqlite`
- [ ] No other DB variables needed
- [ ] SQLite creates file automatically

**Check 2:** Using MySQL?

- [ ] Verify connection details in Render variables:
  - `DB_HOST` - is it correct?
  - `DB_USER` - is it correct?
  - `DB_PASSWORD` - is it correct?
  - `DB_NAME` - should be `aastu_events`
- [ ] Test connection with MySQL client first
- [ ] Run `backend/schema.sql` in database

---

## 📊 Final Status Board

| Component                 | Status      | Action      |
| ------------------------- | ----------- | ----------- |
| Code (Routes)             | ✅ Verified | None needed |
| Google Credentials        | ✅ Present  | None needed |
| Render Backend Service    | [ ]         | Create it   |
| Render Environment Vars   | [ ]         | Add them    |
| Render Frontend Service   | [ ]         | Create it   |
| Google Cloud Redirect URI | [ ]         | Update it   |
| Backend Health Check      | [ ]         | Test it     |
| Google Sign-In Flow       | [ ]         | Test it     |

---

## 📞 Need Help?

If you get stuck:

1. **Check the detailed guides:**
   - `GOOGLE_OAUTH_FIX.md` - Detailed checklist & troubleshooting
   - `OAUTH_FLOW_DIAGRAM.md` - Visual diagrams
   - `RENDER_DEPLOYMENT_GUIDE.md` - Step-by-step screenshots

2. **Check Render Logs:**
   - Service → Logs tab
   - Shows real error messages

3. **Check Browser Console:**
   - F12 → Console tab
   - Shows frontend errors

4. **Verify URLs:**
   - Backend: `https://aastu-backend.onrender.com/`
   - Frontend: `https://aastu-frontend.onrender.com/`
   - Replace with your actual service names if different

---

## ✨ You're Done When:

- ✅ `https://aastu-backend.onrender.com/` returns API running message
- ✅ `https://aastu-frontend.onrender.com/` loads without errors
- ✅ Clicking "Sign in with Google" redirects to Google
- ✅ After approval, you're logged in to your app
- ✅ No errors in browser console or Render logs

---

**Good luck! You've got this! 🚀**
