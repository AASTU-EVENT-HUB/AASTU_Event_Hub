# 🎯 ULTIMATE ACTION PLAN - Get Google OAuth Working on Render

## Summary

Your code ✅ works perfectly. Your Render deployment ❌ needs environment variables.

**Time to fix:** ~15 minutes  
**Difficulty:** Very Easy  
**Risk:** None (no code changes)

---

## BEFORE YOU START

✅ Make sure you have:

- [ ] GitHub account with your code pushed to `azeb` branch
- [ ] Render account (free tier works): https://render.com/
- [ ] Google Cloud account with OAuth credentials
- [ ] Access to your Render dashboard

---

## 📍 STEP 1: Create Backend Service on Render (If Not Done)

### 1.1 Go to Render Dashboard

- Open: https://dashboard.render.com/
- Sign in with your account

### 1.2 Create Web Service

- Click **"+ New"** button
- Select **"Web Service"**
- Click **"Connect Account"** (if prompted)
- Select GitHub repo: `AASTU_Event_Hub`
- Click **"Connect"**

### 1.3 Configure Service

Fill in these fields:

| Field             | Value                       |
| ----------------- | --------------------------- |
| **Name**          | `aastu-backend`             |
| **Environment**   | Node                        |
| **Region**        | Oregon (or closest to you)  |
| **Branch**        | `azeb`                      |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start`   |
| **Plan**          | Free                        |

### 1.4 Click "Create Web Service"

Wait for Render to build and deploy (2-3 minutes)

✅ Backend service created!

---

## 🔑 STEP 2: Set Environment Variables in Render

### 2.1 Go to Service Settings

- In Render dashboard, click **aastu-backend** service
- Click **"Environment"** tab on the left sidebar

### 2.2 Add Variables One by One

Click **"+ Add Environment Variable"** for each:

#### Group 1: Google OAuth (CRITICAL ⭐)

| Key                    | Value                                      |
| ---------------------- | ------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | (from Google Cloud Console)                |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud Console - keep secret!) |
| `BACKEND_URL`          | `https://aastu-backend.onrender.com`       |

#### Group 2: Server Configuration

| Key          | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| `NODE_ENV`   | `production`                                                   |
| `PORT`       | `10000`                                                        |
| `JWT_SECRET` | (Generate random: `sk-proj-abcdef123456ghijkl789mnopqrstuvwx`) |

#### Group 3: Frontend URLs

| Key            | Value                                 |
| -------------- | ------------------------------------- |
| `CORS_ORIGIN`  | `https://aastu-frontend.onrender.com` |
| `FRONTEND_URL` | `https://aastu-frontend.onrender.com` |

#### Group 4: Database (Choose ONE option)

**Option A: SQLite (Simplest)**
| Key | Value |
|-----|-------|
| `DB_TYPE` | `sqlite` |

**Option B: MySQL (Recommended)**

1. Create account at: https://planetscale.com/
2. Create database
3. Copy connection details
4. Add variables:

| Key           | Value              |
| ------------- | ------------------ |
| `DB_TYPE`     | `mysql`            |
| `DB_HOST`     | (from PlanetScale) |
| `DB_USER`     | (from PlanetScale) |
| `DB_PASSWORD` | (from PlanetScale) |
| `DB_NAME`     | `aastu_events`     |

### 2.3 Auto-save

Variables auto-save and service auto-redeploys

⏳ Wait 2-3 minutes for redeploy to complete

✅ Environment variables set!

---

## 🎨 STEP 3: Create Frontend Service on Render (If Not Done)

### 3.1 Create Static Site

- Go to https://dashboard.render.com/
- Click **"+ New"** → **"Static Site"**
- Select GitHub repo: `AASTU_Event_Hub`
- Click **"Connect"**

### 3.2 Configure

| Field                 | Value                          |
| --------------------- | ------------------------------ |
| **Name**              | `aastu-frontend`               |
| **Branch**            | `azeb`                         |
| **Build Command**     | `npm install && npm run build` |
| **Publish Directory** | `frontend/dist`                |
| **Plan**              | Free                           |

### 3.3 Click "Create Static Site"

Wait for build (2-3 minutes)

### 3.4 Add Environment Variable

- Click **"Environment"** tab
- Add:

| Key            | Value                                    |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | `https://aastu-backend.onrender.com/api` |

✅ Frontend service created!

---

## 🔐 STEP 4: Update Google Cloud Console

### 4.1 Go to Google Cloud

- Open: https://console.cloud.google.com/
- Select your project from dropdown

### 4.2 Navigate to Credentials

- Left sidebar → **APIs & Services**
- Click **Credentials**

### 4.3 Find Your OAuth Client

- Look for your OAuth 2.0 Client ID
- Should have your Client ID: `312934010372-...`

### 4.4 Edit OAuth Client

- Click on it to open editor
- Find: **"Authorized redirect URIs"** section

### 4.5 Add Render Callback URL

Add this URL:

```
https://aastu-backend.onrender.com/api/auth/google/callback
```

Click **"Save"**

⏳ Wait 1-2 minutes for Google to apply changes

✅ Google Console updated!

---

## 🧪 STEP 5: Test Everything

### Test 5.1: Backend Health Check

```
1. Go to: https://aastu-backend.onrender.com/
2. Should see: {"success": true, "message": "AASTU Events API Running"}
3. If error: Check backend logs (see troubleshooting below)
```

✅ Backend responding!

### Test 5.2: Frontend Loads

```
1. Go to: https://aastu-frontend.onrender.com/
2. Should load without errors
3. Check browser console (F12) for errors
```

✅ Frontend loaded!

### Test 5.3: Google Sign-In Flow (Main Test)

```
1. Go to: https://aastu-frontend.onrender.com/login
2. Click "Sign in with Google" button
3. Should redirect to Google consent screen
4. Click "Allow"
5. Should show loading then redirect to dashboard
6. Should be logged in ✅
```

✅ Google OAuth working!

### Test 5.4: Check Logs for Errors

**Backend Logs:**

- Go to Render → aastu-backend service
- Click "Logs" tab
- Look for errors (scroll to bottom)

**Expected log entries:**

```
✅ 🚀 Server running on port 10000
✅ Connected to database
❌ Should NOT see: "GOOGLE_CLIENT_ID is required"
❌ Should NOT see: "Database connection failed"
```

**Frontend Logs:**

- Go to Render → aastu-frontend service
- Click "Logs" tab
- Should show successful build

---

## ❌ Troubleshooting

### Problem: Backend shows 501 error or "Cannot GET /api/auth/google"

**Cause:** Environment variables not set

**Fix:**

1. Go to Render → aastu-backend → Environment
2. Verify these exist:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. If missing, add them
4. Wait 2-3 minutes for redeploy

### Problem: "Invalid redirect_uri" from Google

**Cause:** Google Cloud doesn't have Render callback URL

**Fix:**

1. Go to https://console.cloud.google.com/
2. Add to OAuth redirect URIs:
   ```
   https://aastu-backend.onrender.com/api/auth/google/callback
   ```
3. Save
4. Wait 1-2 minutes

### Problem: CORS Error in browser console

**Cause:** Frontend URL doesn't match CORS_ORIGIN

**Fix:**

1. Go to Render → aastu-backend → Environment
2. Find `CORS_ORIGIN` variable
3. Update to match your frontend URL:
   ```
   https://aastu-frontend.onrender.com
   ```
4. Redeploy backend

### Problem: "Cannot reach API" or 502 Bad Gateway

**Cause:** Backend service crashed or not responding

**Fix:**

1. Check Render → aastu-backend → Logs
2. Look for errors (scroll to bottom)
3. Common errors:
   - Database connection failed → check DB credentials
   - Module not found → npm install failed
   - Port in use → shouldn't happen on Render
4. Restart service: Click "Restart" button

### Problem: Database connection error

**Cause:** Wrong DB credentials or DB not initialized

**Fix:**

- **For SQLite:** Just set `DB_TYPE=sqlite`, no other setup needed
- **For MySQL:**
  1. Verify PlanetScale/MySQL credentials are correct
  2. Run `backend/schema.sql` in the database
  3. Update Render env vars with correct credentials

---

## ✅ Success Checklist

When everything is working:

- [ ] `https://aastu-backend.onrender.com/` shows "API Running"
- [ ] `https://aastu-frontend.onrender.com/` loads without errors
- [ ] Can navigate to login page
- [ ] Clicking "Sign in with Google" redirects to Google
- [ ] After approval, logged in to dashboard
- [ ] No errors in browser console (F12)
- [ ] No errors in Render logs

---

## 📊 Status Board

| Step                    | Status  | What to Do      |
| ----------------------- | ------- | --------------- |
| Read this guide         | ✅      | Done            |
| Create backend service  | [ ]     | Follow Step 1   |
| Set env variables       | [ ]     | Follow Step 2   |
| Create frontend service | [ ]     | Follow Step 3   |
| Update Google Cloud     | [ ]     | Follow Step 4   |
| Test health check       | [ ]     | Follow Step 5.1 |
| Test frontend           | [ ]     | Follow Step 5.2 |
| Test Google OAuth       | [ ]     | Follow Step 5.3 |
| Check logs              | [ ]     | Follow Step 5.4 |
| **All tests passing?**  | **[ ]** | **Go live!** 🎉 |

---

## 🎯 Your Credentials (Keep Safe!)

```
GOOGLE_CLIENT_ID: (from Google Cloud Console)
GOOGLE_CLIENT_SECRET: (from Google Cloud Console - keep secret!)
```

✅ **Do's:**

- Set Client Secret ONLY in Render Dashboard
- Keep Client Secret private
- Can share Client ID (it's public)

❌ **Don'ts:**

- Never commit `.env` to GitHub
- Never share Client Secret in emails/screenshots
- Never hardcode credentials in code

---

## 📚 Additional Resources

If you need more details, I created guides:

1. **START_HERE.md** - Overview (read first)
2. **README_OAUTH_FIX.md** - Quick summary
3. **QUICK_CHECKLIST.md** - Checklist format
4. **GOOGLE_OAUTH_FIX.md** - Comprehensive guide
5. **RENDER_DEPLOYMENT_GUIDE.md** - Render-specific steps
6. **CODE_VERIFICATION_REPORT.md** - Code analysis
7. **VISUAL_PROBLEM_AND_FIX.md** - Visual diagrams

---

## ⏱️ Timeline

| Time    | Action                              |
| ------- | ----------------------------------- |
| Now     | Read this guide (5 min)             |
| +5 min  | Create Render services (5 min)      |
| +10 min | Set environment variables (5 min)   |
| +15 min | Update Google Cloud Console (2 min) |
| +17 min | Test the flow (3 min)               |
| +20 min | **Done!** 🎉                        |

---

## 🚀 You're Ready!

Everything in your code is correct. You just need to tell Render what the Google credentials are.

After you follow these steps, your Google OAuth will work perfectly on production.

**Good luck! You've got this!** 💪
