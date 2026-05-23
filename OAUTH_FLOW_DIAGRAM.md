# Google OAuth Flow Diagram

## Local Development Flow (Working ✅)

```
Frontend (localhost:5173)
    │
    ├─ User clicks "Sign in with Google"
    │
    ├─→ authAPI.googleLogin()
    │
    ├─→ window.location.href = "http://localhost:5000/api/auth/google"
    │
    └─→ Backend (localhost:5000)
        │
        ├─ GET /api/auth/google
        │   └─ passport.authenticate("google") redirects to Google
        │
        ├─→ Google Consent Screen
        │   └─ User approves
        │
        ├─ GET /api/auth/google/callback
        │   └─ Receives authorization code from Google
        │
        ├─ Backend exchanges code for access token
        │
        ├─ Backend creates/updates user in database
        │
        ├─ Backend generates JWT token
        │
        └─→ Redirects to Frontend with token & user data
            └─ localStorage.setItem('aastu_token', token)
```

---

## Production Flow on Render (Currently Broken ❌)

```
Frontend (your-app.onrender.com)
    │
    ├─ User clicks "Sign in with Google"
    │
    ├─→ authAPI.googleLogin()
    │
    ├─→ window.location.href = "https://aastu-backend.onrender.com/api/auth/google"
    │
    └─→ Backend (aastu-backend.onrender.com)
        │
        ├─ GET /api/auth/google
        │   │
        │   ├─ Checks: if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)
        │   │
        │   ├─ ❌ GOOGLE_CLIENT_ID = undefined (not set in Render)
        │   │
        │   └─ Returns 501 Error: "Google OAuth is not configured"
        │
        ├─→ **STOPS HERE** ← FIX: Add env vars to Render dashboard
```

---

## Required Environment Variables Flow

### Backend Startup:

```javascript
// server.js loads env variables
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// google.routes.js reads them
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Check: are they defined?
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  ✅ Setup Passport Google Strategy
} else {
  ❌ Return 501 error on /api/auth/google
}
```

### Where Variables Come From:

#### **Local Development**

```
.env file → process.env → Backend reads variables ✅
```

#### **Production on Render**

```
Render Dashboard Environment Variables → process.env → Backend reads variables
⚠️ .env file is NOT uploaded to Render!
⚠️ Must set variables in Render Dashboard
```

---

## Complete Variable Dependency Map

```
GOOGLE_CLIENT_ID
    ↓
    ├─→ Used by: google.routes.js (passport configuration)
    ├─→ Set in: Render Dashboard → Environment
    └─→ Check: https://console.cloud.google.com/

GOOGLE_CLIENT_SECRET
    ↓
    ├─→ Used by: google.routes.js (passport configuration)
    ├─→ Set in: Render Dashboard → Environment
    └─→ Check: https://console.cloud.google.com/

BACKEND_URL
    ↓
    ├─→ Used by: google.routes.js for callback URL
    ├─→ Local: http://localhost:5000
    └─→ Production: https://aastu-backend.onrender.com

GOOGLE_REDIRECT_URI (Implicit)
    ↓
    ├─→ Constructed as: ${BACKEND_URL}/api/auth/google/callback
    ├─→ Local: http://localhost:5000/api/auth/google/callback
    └─→ Production: https://aastu-backend.onrender.com/api/auth/google/callback
        └─→ ⚠️ MUST match Google Cloud Console!
```

---

## Code Verification Checklist

### ✅ server.js

```javascript
const authRoutes = require("./routes/auth.routes");
const googleRoutes = require("./routes/google.routes");

app.use("/api/auth", authRoutes); // /api/auth/register, /api/auth/login
app.use("/api/auth", googleRoutes); // /api/auth/google, /api/auth/google/callback
```

### ✅ google.routes.js

```javascript
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Generate JWT and redirect
  },
);

module.exports = router;
```

### ✅ api.js (Frontend)

```javascript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authAPI = {
  googleLogin: () => {
    window.location.href = `${API_BASE}/auth/google`;
  },
};
```

### ✅ LoginPage.jsx

```jsx
<button onClick={() => authAPI.googleLogin()}>Sign in with Google</button>
```

---

## Render Deployment Checklist

- [ ] Verify code is on GitHub branch `azeb`
- [ ] Create Backend Web Service in Render
  - [ ] Name: aastu-backend
  - [ ] Build: `cd backend && npm install`
  - [ ] Start: `cd backend && npm start`
  - [ ] Branch: azeb
- [ ] Set Backend Environment Variables:
  - [ ] `GOOGLE_CLIENT_ID=your_google_client_id`
        `GOOGLE_CLIENT_SECRET=your_google_client_secret` - [ ] `BACKEND_URL=https://aastu-backend.onrender.com` (or your actual URL)
  - [ ] `JWT_SECRET=<choose-a-strong-secret>`
  - [ ] Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- [ ] Create Frontend Static Site in Render
  - [ ] Name: aastu-frontend
  - [ ] Build: `npm install && npm run build`
  - [ ] Path: `frontend/dist`
  - [ ] Branch: azeb
- [ ] Set Frontend Environment Variable:
  - [ ] `VITE_API_URL=https://aastu-backend.onrender.com/api`
- [ ] Update Google Cloud Console OAuth Redirect URI:
  - [ ] Add: `https://aastu-backend.onrender.com/api/auth/google/callback`
- [ ] Test: Visit frontend, click "Sign in with Google"

---

## Quick Reference: Your Credentials

**Keep these safe!**

```
GOOGLE_CLIENT_ID: (from Google Cloud Console)
GOOGLE_CLIENT_SECRET: (from Google Cloud Console)
```

**Production URLs (Update these after deployment):**

```
BACKEND_URL: https://aastu-backend.onrender.com
FRONTEND_URL: https://aastu-frontend.onrender.com
```

**Google Cloud Redirect URI (Must match):**

```
https://aastu-backend.onrender.com/api/auth/google/callback
```
