# Render Deployment: Step-by-Step Instructions

## Part 1: Create Backend Web Service

### Step 1: Go to Render Dashboard

1. Open https://dashboard.render.com/
2. Click **"+ New"** → Select **"Web Service"**

### Step 2: Connect GitHub Repository

1. Select your GitHub account
2. Find and click on: `AASTU_Event_Hub`
3. Click **"Connect"**

### Step 3: Configure Web Service

**Name:** `aastu-backend`

**Environment:** Node

**Region:** Oregon (or closest to you)

**Branch:** `azeb`

**Build Command:**

```bash
cd backend && npm install
```

**Start Command:**

```bash
cd backend && npm start
```

**Plan:** Free (for now)

Click **"Create Web Service"**

---

## Part 2: Set Environment Variables for Backend

After the service is created:

### Step 1: Go to Environment Tab

1. Click on your service **aastu-backend**
2. Click **"Environment"** tab (on the left sidebar)

### Step 2: Add Environment Variables

Click **"+ Add Environment Variable"** for each of these:

#### Server Configuration

| Key        | Value        |
| ---------- | ------------ |
| `NODE_ENV` | `production` |
| `PORT`     | `10000`      |

#### JWT

| Key          | Value                               |
| ------------ | ----------------------------------- |
| `JWT_SECRET` | `(Generate a strong random secret)` |

Example JWT_SECRET: `sk-proj-abc123xyz789ghi456jkl789mno012pqr345stu678vwx901yz`

#### Google OAuth (CRITICAL)

| Key                    | Value                                      |
| ---------------------- | ------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | (from Google Cloud Console)                |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud Console - keep secret!) |
| `BACKEND_URL`          | `https://aastu-backend.onrender.com`       |

#### CORS & Frontend

| Key            | Value                                 |
| -------------- | ------------------------------------- |
| `CORS_ORIGIN`  | `https://aastu-frontend.onrender.com` |
| `FRONTEND_URL` | `https://aastu-frontend.onrender.com` |

#### Database (Choose ONE option)

**Option A: Use SQLite (Simplest, not recommended for production)**
| Key | Value |
|-----|-------|
| `DB_TYPE` | `sqlite` |

**Option B: Use MySQL (Recommended)**

First, create a managed MySQL database:

- Sign up at [PlanetScale](https://planetscale.com/) (free tier available)
- Create a database
- Note: connection string, username, password
- Run `backend/schema.sql` to initialize tables

Then add these variables:

| Key           | Value                |
| ------------- | -------------------- |
| `DB_TYPE`     | `mysql`              |
| `DB_HOST`     | `(from PlanetScale)` |
| `DB_USER`     | `(from PlanetScale)` |
| `DB_PASSWORD` | `(from PlanetScale)` |
| `DB_NAME`     | `aastu_events`       |

### Step 3: Save

- After adding all variables, they auto-save
- The service will redeploy automatically

---

## Part 3: Create Frontend Static Site

### Step 1: Create New Static Site

1. Go to https://dashboard.render.com/
2. Click **"+ New"** → Select **"Static Site"**

### Step 2: Connect Repository

1. Select your GitHub account
2. Click on: `AASTU_Event_Hub`
3. Click **"Connect"**

### Step 3: Configure Static Site

**Name:** `aastu-frontend`

**Region:** Oregon (same as backend)

**Branch:** `azeb`

**Build Command:**

```bash
npm install && npm run build
```

**Publish Directory:**

```
frontend/dist
```

**Plan:** Free

Click **"Create Static Site"**

---

## Part 4: Set Frontend Environment Variables

After the frontend is created:

### Step 1: Go to Environment Tab

1. Click on **aastu-frontend**
2. Click **"Environment"** tab

### Step 2: Add Environment Variable

| Key            | Value                                    |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | `https://aastu-backend.onrender.com/api` |

This tells the frontend where your backend API is located.

### Step 3: Save & Redeploy

- The frontend will automatically rebuild and redeploy

---

## Part 5: Update Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Open https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find OAuth 2.0 Client ID

1. Look for your OAuth client application
2. Click on it to edit

### Step 3: Add Redirect URI

In the **"Authorized redirect URIs"** section, add:

```
https://aastu-backend.onrender.com/api/auth/google/callback
```

⚠️ Replace `aastu-backend` with your actual Render service name if different.

Click **"Save"**

---

## Part 6: Test the Deployment

### Test 1: Backend Health Check

1. Open your browser
2. Go to: `https://aastu-backend.onrender.com/`
3. Expected response:
   ```json
   { "success": true, "message": "AASTU Events API Running" }
   ```

### Test 2: Frontend Loads

1. Go to: `https://aastu-frontend.onrender.com/`
2. Should load without errors
3. Check browser console for any CORS errors

### Test 3: Google Sign-In Flow

1. Go to frontend URL
2. Click **Login** in navbar
3. Click **"Sign in with Google"**
4. Should redirect to Google consent screen
5. After approval, should see "Loading..." then redirect to dashboard

### Test 4: Check Logs

If something fails:

**Backend Logs:**

1. Go to **aastu-backend** service
2. Click **"Logs"** tab
3. Look for errors or warnings
4. Common errors:
   - `Cannot find module 'passport-google-oauth20'` → Dependencies not installed
   - `Error: getaddrinfo ENOTFOUND db` → Database connection failed
   - `GOOGLE_CLIENT_ID is required` → Env variable not set

**Frontend Logs:**

1. Go to **aastu-frontend** service
2. Click **"Logs"** tab
3. Look for build errors

---

## Troubleshooting

### Error: "Cannot GET /api/auth/google"

**Cause:** `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set in Render

**Fix:**

1. Go to aastu-backend → Environment
2. Add the two variables
3. Service will redeploy automatically

### Error: "Invalid redirect_uri"

**Cause:** Google Cloud Console doesn't have the Render callback URL

**Fix:**

1. Go to Google Cloud Console
2. Add to OAuth redirect URIs: `https://aastu-backend.onrender.com/api/auth/google/callback`
3. Wait ~1 minute for changes to propagate

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** `CORS_ORIGIN` doesn't match frontend URL

**Fix:**

1. Go to aastu-backend → Environment
2. Update `CORS_ORIGIN` to exact frontend URL (e.g., `https://aastu-frontend.onrender.com`)
3. Redeploy

### Error: "Database connection failed"

**Cause:** `DB_HOST`, `DB_USER`, or `DB_PASSWORD` is incorrect

**Fix:**

1. Verify credentials from PlanetScale/MySQL provider
2. Update in Render Environment variables
3. Test connection locally first

### Frontend shows "Cannot reach API"

**Cause:** `VITE_API_URL` is wrong

**Fix:**

1. Go to aastu-frontend → Environment
2. Update `VITE_API_URL` to your backend URL
3. Redeploy frontend

---

## Environment Variables Quick Reference

### Backend (aastu-backend)

```
NODE_ENV=production
PORT=10000
JWT_SECRET=(your-secret)
GOOGLE_CLIENT_ID=(your-client-id-from-google-cloud-console)
GOOGLE_CLIENT_SECRET=(your-client-secret-from-google-cloud-console)
BACKEND_URL=https://aastu-backend.onrender.com
CORS_ORIGIN=https://aastu-frontend.onrender.com
FRONTEND_URL=https://aastu-frontend.onrender.com
DB_TYPE=mysql (or sqlite)
DB_HOST=(for MySQL)
DB_USER=(for MySQL)
DB_PASSWORD=(for MySQL)
DB_NAME=aastu_events
```

### Frontend (aastu-frontend)

```
VITE_API_URL=https://aastu-backend.onrender.com/api
```

---

## Important URLs

After deployment, your URLs will be:

- **Frontend:** `https://aastu-frontend.onrender.com`
- **Backend:** `https://aastu-backend.onrender.com`
- **Google Callback:** `https://aastu-backend.onrender.com/api/auth/google/callback`

---

## Security Notes

✅ **Good practices:**

- Never commit `.env` file to GitHub
- Always set secrets in Render dashboard (never in render.yaml)
- Use strong JWT_SECRET (32+ characters, random)
- Keep GOOGLE_CLIENT_SECRET private

✅ **Your credentials are safe if:**

- GOOGLE_CLIENT_SECRET is only in Render dashboard ✓
- JWT_SECRET is only in Render dashboard ✓
- Database password is only in Render dashboard ✓

---

## Next Steps

After successful deployment:

1. ✅ Test Google Sign-In
2. ✅ Test user registration and login
3. ✅ Test event browsing and registration
4. ✅ Monitor logs for errors
5. 🔄 Set up CI/CD (optional, Render auto-deploys on push)
6. 📊 Monitor performance in Render dashboard
7. 💾 Set up database backups (if using PlanetScale/external DB)

---

## Support

If you encounter issues:

1. **Check Render Logs** → Service → Logs tab
2. **Check Browser Console** → F12 → Console tab
3. **Check Network Tab** → F12 → Network tab (see API calls)
4. **Verify Environment Variables** → Render Dashboard → Environment
5. **Verify Google Console** → OAuth redirect URIs
6. **Verify Database Connection** → Try local connection first
