# Google OAuth Fix - Complete Checklist

## Project Analysis Summary ✅

Your project structure is **correct** and routes are properly configured:

### ✅ Verified Components

1. **Backend Server (`server.js`)**
   - Imports auth routes: `const authRoutes = require("./routes/auth.routes");`
   - Imports Google routes: `const googleRoutes = require("./routes/google.routes");`
   - Mounts auth routes: `app.use("/api/auth", authRoutes);`
   - Mounts Google routes: `app.use("/api/auth", googleRoutes);` → Serves `/api/auth/google`
   - Passport middleware initialized: `app.use(passport.initialize());`

2. **Google Routes (`backend/routes/google.routes.js`)**
   - ✅ `GET /google` endpoint exists - redirects to Google OAuth consent screen
   - ✅ `GET /google/callback` endpoint exists - handles Google callback and returns JWT token
   - ✅ Uses environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - ✅ Sets callback URL from `BACKEND_URL` env variable
   - ✅ Auto-registers users via Google profile data
   - ✅ Returns JWT token for subsequent API requests

3. **Frontend Implementation**
   - ✅ `src/services/api.js` has `googleLogin()` function that redirects to `${API_BASE}/auth/google`
   - ✅ `src/pages/auth/LoginPage.jsx` has Google Sign-In button
   - ✅ `src/pages/auth/GoogleCallbackPage.jsx` handles redirect back from Google

4. **Backend `.env` Configuration**
   - ✅ `GOOGLE_CLIENT_ID=your_google_client_id`
   - ✅ `GOOGLE_CLIENT_SECRET=your_google_client_secret`
   - ✅ `BACKEND_URL=https://your-backend-name.onrender.com`

---

## Why "Cannot GET /api/auth/google" on Render?

The 404 error occurs because environment variables are **NOT SET in Render**. The backend is looking for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, but they only exist in your local `.env` file.

**Local .env files are NOT uploaded to Render!**

---

## Step-by-Step Fix

### **Step 1: Deploy to Render and Set Environment Variables**

1. **Push your code to GitHub branch `azeb`** (already done):

   ```
   git push origin azeb
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com/)**

3. **Create/Update Backend Web Service:**
   - Name: `aastu-backend`
   - GitHub repo: Connect your repo
   - Branch: `azeb`
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Runtime: Node (auto-selected)

4. **Set Environment Variables in Render Dashboard:**

   Navigate to your service → **Environment**

   Add these environment variables:

   ```
   NODE_ENV=production
   PORT=10000

   JWT_SECRET=your_super_secret_jwt_key_change_this_in_render_dashboard

   DB_TYPE=mysql
   DB_HOST=your-mysql-host.com
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=aastu_events

   CORS_ORIGIN=https://your-frontend-url.onrender.com
   FRONTEND_URL=https://your-frontend-url.onrender.com

   GOOGLE_CLIENT_ID=(your-client-id-from-google-cloud-console)
   GOOGLE_CLIENT_SECRET=(your-client-secret-from-google-cloud-console)
   BACKEND_URL=https://aastu-backend.onrender.com
   ```

   ⚠️ **IMPORTANT: Use your actual Render backend URL for `BACKEND_URL` and `GOOGLE_REDIRECT_URI`**

5. **Create/Update Frontend Static Site:**
   - Name: `aastu-frontend`
   - GitHub repo: Connect your repo
   - Branch: `azeb`
   - Build command: `npm install && npm run build`
   - Publish path: `frontend/dist`

6. **Set Frontend Environment Variable:**
   ```
   VITE_API_URL=https://aastu-backend.onrender.com/api
   ```

---

### **Step 2: Configure Google Cloud Console**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Update OAuth 2.0 Authorized Redirect URIs:**
   - Find your OAuth application
   - Go to **Credentials** → **OAuth 2.0 Client IDs**
   - Update the redirect URI to match your Render URL:
     ```
     https://aastu-backend.onrender.com/api/auth/google/callback
     ```
   - ⚠️ Replace `aastu-backend` with your actual Render backend service name

3. **Verify these settings:**
   - **Client ID**: (from Google Cloud Console) ✓
   - **Client Secret**: (from Google Cloud Console - keep secret!) ✓
   - **Redirect URI**: `https://aastu-backend.onrender.com/api/auth/google/callback` ✓ (Update with your domain)

---

### **Step 3: Update Database Configuration**

Choose **ONE** option:

#### **Option A: Use Managed MySQL (Recommended)**

- Sign up at [PlanetScale](https://planetscale.com/) or [Supabase](https://supabase.com/)
- Create a database
- Run `backend/schema.sql` to create tables
- Set DB credentials in Render environment variables

#### **Option B: Use SQLite (Not Recommended for Production)**

- Set `DB_TYPE=sqlite` in Render
- ⚠️ Data may be lost on redeploy (ephemeral filesystem)

---

### **Step 4: Test the Deployment**

1. **Test backend health endpoint:**

   ```
   https://aastu-backend.onrender.com/
   ```

   Expected response: `{ "success": true, "message": "AASTU Events API Running" }`

2. **Test Google OAuth redirect:**
   - Go to your frontend: `https://your-frontend.onrender.com/login`
   - Click "Sign in with Google"
   - Should redirect to: `https://aastu-backend.onrender.com/api/auth/google`
   - Then to Google consent screen
   - After approval, should redirect back to frontend with JWT token

3. **Check Render logs:**
   - Backend service → **Logs**
   - Look for: `🚀 Server running on port 10000`
   - Check for passport/Google auth messages

---

## Environment Variables Reference

### Local Development (`.env` file)

```dotenv
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=(from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(from Google Cloud Console - keep secret!)
BACKEND_URL=http://localhost:5000
```

### Production (Render Dashboard)

```
NODE_ENV=production
PORT=10000
DB_TYPE=mysql
DB_HOST=your-mysql-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=aastu_events
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
GOOGLE_CLIENT_ID=(from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(from Google Cloud Console - keep secret!)
BACKEND_URL=https://aastu-backend.onrender.com
```

---

## Troubleshooting

### "Cannot GET /api/auth/google"

- ✅ Solution: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render dashboard

### "Invalid redirect_uri"

- ✅ Solution: Update Google Cloud Console OAuth redirect URI to match your Render backend URL
- Must be: `https://aastu-backend.onrender.com/api/auth/google/callback`

### "Error: getaddrinfo ENOTFOUND db"

- ✅ Solution: Set correct `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Render dashboard

### CORS errors

- ✅ Solution: Update `CORS_ORIGIN` and `FRONTEND_URL` to your actual Render frontend URL

### "Cannot find module 'passport-google-oauth20'"

- ✅ Solution: Run `cd backend && npm install` (ensure dependencies are installed)

---

## Summary

| Issue                           | Status         | Fix                              |
| ------------------------------- | -------------- | -------------------------------- |
| Routes mounted correctly        | ✅ OK          | No changes needed                |
| Google routes exist             | ✅ OK          | No changes needed                |
| Auth router exported            | ✅ OK          | No changes needed                |
| Environment variables in `.env` | ✅ OK          | No changes needed                |
| Environment variables in Render | ❌ **MISSING** | **Set them in Render dashboard** |
| Google Cloud redirect URI       | ❌ **Check**   | Update to your Render URL        |

**Next Action:** Set the environment variables in your Render dashboard as shown in Step 1, then test the deployment.
