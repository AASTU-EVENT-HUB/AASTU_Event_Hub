# Visual Summary: The Problem and The Fix

## The Error You're Seeing

```
Error: Cannot GET /api/auth/google
Status: 404
```

---

## Why This Happens (The Technical Explanation)

### Local Development (WORKS ✅)

```javascript
// When you run: npm run dev
// Node loads: require("dotenv").config()
//
// This reads from: backend/.env file
//
// .env has:
//   GOOGLE_CLIENT_ID=312934010372-...
//   GOOGLE_CLIENT_SECRET=GOCSPX-1lh...
//
// So process.env.GOOGLE_CLIENT_ID is defined ✅
// Google routes work ✅
```

**Result:** Clicking Google Sign-In works locally

### Production on Render (BROKEN ❌)

```javascript
// When deployed to Render:
// Node looks for: require("dotenv").config()
//
// But .env file is NOT uploaded to Render! ❌
// (Git ignores .env files for security)
//
// process.env.GOOGLE_CLIENT_ID is undefined ❌
//
// Backend code checks:
//   if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
//     return res.status(501).json({
//       success: false,
//       message: "Google OAuth is not configured"
//     });
//   }
//
// Returns 501 error ❌
```

**Result:** "Cannot GET /api/auth/google" error

---

## The Solution (The Fix)

```javascript
// Set environment variables in Render Dashboard:
//
// GOOGLE_CLIENT_ID=312934010372-...
// GOOGLE_CLIENT_SECRET=GOCSPX-1lh...
//
// Render injects these into process.env at runtime ✅
//
// Backend code now finds:
//   GOOGLE_CLIENT_ID ✅
//   GOOGLE_CLIENT_SECRET ✅
//
// Google routes work ✅
```

**Result:** "Cannot GET /api/auth/google" error is FIXED ✅

---

## Side-by-Side Comparison

### ❌ BEFORE (Current - Broken)

```
Frontend
  └─ Click "Sign in with Google"
     └─ window.location.href = "https://aastu-backend.onrender.com/api/auth/google"
        └─ Backend receives request
           └─ Checks: process.env.GOOGLE_CLIENT_ID
              └─ undefined (because .env not in Render)
                 └─ Returns 501 error
                    └─ Browser shows: "Cannot GET /api/auth/google"
```

### ✅ AFTER (Fixed)

```
Frontend
  └─ Click "Sign in with Google"
     └─ window.location.href = "https://aastu-backend.onrender.com/api/auth/google"
        └─ Backend receives request
           └─ Checks: process.env.GOOGLE_CLIENT_ID
              └─ Found! (set in Render Dashboard)
                 └─ Passport redirects to Google consent screen
                    └─ User approves
                       └─ Google redirects back to callback URL
                          └─ Backend exchanges code for access token
                             └─ Backend generates JWT token
                                └─ Redirect to frontend with token
                                   └─ User is logged in ✅
```

---

## The Three Places Your Credentials Live

### 1️⃣ Local Development

```
File: backend/.env
├─ GOOGLE_CLIENT_ID=312934010372-...
├─ GOOGLE_CLIENT_SECRET=GOCSPX-1lh...
└─ BACKEND_URL=http://localhost:5000

Used by: Node server when you run npm run dev
Access: Via require("dotenv").config()
```

### 2️⃣ Production on Render

```
Location: Render Dashboard → Service → Environment
├─ GOOGLE_CLIENT_ID=312934010372-...
├─ GOOGLE_CLIENT_SECRET=GOCSPX-1lh...
└─ BACKEND_URL=https://aastu-backend.onrender.com

Used by: Node server running on Render
Access: Via process.env (injected by Render at runtime)
```

### 3️⃣ Google Cloud Console

```
Location: console.cloud.google.com → APIs & Services → Credentials
├─ Client ID: 312934010372-...
├─ Client Secret: GOCSPX-1lh...
└─ Authorized redirect URIs:
   ├─ Local: http://localhost:5000/api/auth/google/callback
   └─ Production: https://aastu-backend.onrender.com/api/auth/google/callback

Used by: Google's OAuth servers
Access: Public (Client ID) and Private (Client Secret)
```

---

## The Fix in 4 Simple Steps

### Step 1: Open Render Dashboard

```
Go to: https://dashboard.render.com/
Click on: aastu-backend service
Click on: Environment tab
```

### Step 2: Add Three Critical Variables

```
Key: GOOGLE_CLIENT_ID
Value:your_google_client_id
googleusercontent.com

Key: GOOGLE_CLIENT_SECRET
Value: your_google_client_secret

Key: BACKEND_URL
Value: https://your-backend-name.onrender.com
```

### Step 3: Update Google Cloud Console

```
Go to: https://console.cloud.google.com/
Find: Your OAuth 2.0 Client ID
Update Redirect URI to: https://aastu-backend.onrender.com/api/auth/google/callback
```

### Step 4: Test

```
1. Wait 2 minutes for Render to redeploy
2. Go to: https://aastu-frontend.onrender.com/login
3. Click "Sign in with Google"
4. Should work! ✅
```

---

## What's Happening Behind the Scenes

### Code Flow for Google Sign-In

```
User clicks button on Frontend (LoginPage.jsx)
    │
    ├─ <button onClick={() => authAPI.googleLogin()}>
    │
    └─ authAPI.googleLogin() in api.js
        │
        └─ window.location.href = "https://aastu-backend.onrender.com/api/auth/google"
            │
            └─ GET /api/auth/google hits Backend (google.routes.js)
                │
                ├─ Check: if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)
                │
                ├─ NO ❌ → Server doesn't have these variables → 501 error
                │
                └─ YES ✅ → Server has these variables → Continue to Passport
                    │
                    └─ passport.authenticate("google", { scope: ["profile", "email"] })
                        │
                        └─ Redirect to: https://accounts.google.com/o/oauth2/v2/auth?...
                            │
                            └─ Google Consent Screen (User approves)
                                │
                                └─ Google redirects to: https://aastu-backend.onrender.com/api/auth/google/callback?code=...
                                    │
                                    └─ GET /api/auth/google/callback (Backend)
                                        │
                                        ├─ Exchange code for access token from Google
                                        ├─ Get user profile from Google
                                        ├─ Create/update user in database
                                        ├─ Generate JWT token with jwt.sign()
                                        │
                                        └─ Redirect to: https://aastu-frontend.onrender.com/auth/google/callback?token=...&user=...
                                            │
                                            └─ Frontend (GoogleCallbackPage.jsx)
                                                │
                                                ├─ Extract token from URL
                                                ├─ Store in localStorage
                                                │
                                                └─ Redirect to dashboard ✅
```

---

## Debugging: How to Know If It's Fixed

### Check 1: Render Logs Show "Configured"

```
Command: Go to aastu-backend → Logs tab

BEFORE (Broken):
  ❌ "GOOGLE_CLIENT_ID is required"
  ❌ "Google OAuth is not configured"

AFTER (Fixed):
  ✅ "🚀 Server running on port 10000"
  ✅ No auth-related errors
```

### Check 2: Browser Shows OAuth Flow

```
BEFORE (Broken):
  1. Click "Sign in with Google"
  2. See: 404 error "Cannot GET /api/auth/google"
  3. Stuck on login page

AFTER (Fixed):
  1. Click "Sign in with Google"
  2. Redirected to Google consent screen
  3. After approval, redirected to dashboard
  4. User is logged in
```

### Check 3: Network Tab Shows Correct Responses

```
BEFORE (Broken):
  GET /api/auth/google → 501 Internal Server Error

AFTER (Fixed):
  GET /api/auth/google → 302 Redirect (to Google)
  (Browser follows redirects automatically)
```

---

## Security Note

Your credentials are:

```
Client ID: (from Google Cloud Console)
Client Secret: (from Google Cloud Console - keep secret!)
```

✅ It's OK to share Client ID (it's in the frontend)
❌ NEVER share Client Secret (only in backend)

Make sure:

- ✅ `.env` file is in `.gitignore` (not committed to Git)
- ✅ Client Secret is ONLY in Render Dashboard (not in code)
- ✅ No screenshots/emails with Client Secret
- ✅ If leaked, regenerate in Google Cloud Console

---

## Summary

| Item             | Local Dev   | Render          | Status                      |
| ---------------- | ----------- | --------------- | --------------------------- |
| Code structure   | ✅ OK       | ✅ Same         | Correct                     |
| Routes mounted   | ✅ OK       | ✅ Same         | Correct                     |
| OAuth endpoints  | ✅ Exist    | ✅ Exist        | Correct                     |
| .env file        | ✅ Has vars | ❌ Not uploaded | Local only                  |
| Render env vars  | N/A         | ❌ NOT SET      | **← FIX HERE**              |
| Google Cloud URI | ✅ Correct  | ❌ Check it     | May need update             |
| **Result**       | ✅ Works    | ❌ 404 Error    | **Fixed after above steps** |

---

**Your fix is literally just 3 variables in the Render Dashboard!**

After you set them, the exact same code that works locally will work in production. 🚀
