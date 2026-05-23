const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Only configure if credentials are present
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        // Prefer an explicit redirect URI set in environment for production
        // Fallback to BACKEND_URL + route for local development
        callbackURL: process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) return done(null, false, { message: "No email from Google" });

          // Check if user exists
          const [existing] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
          );

          let user;
          if (existing.length > 0) {
            user = existing[0];
          } else {
            // Auto-register Google users
            const [result] = await db.execute(
              `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [name, email, `GOOGLE-${Date.now()}`, "General", "google-oauth", "student", 1]
            );
            user = {
              id: result.insertId,
              name,
              email,
              role: "student",
              department: "General",
              is_first_login: 1,
            };
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
      done(null, rows[0] || null);
    } catch (err) {
      done(err);
    }
  });
}

// GET /api/auth/google — redirect to Google
router.get(
  "/google",
  (req, res, next) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({
        success: false,
        message: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env",
      });
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  (req, res, next) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
    }
    next();
  },
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isFirstLogin: Boolean(user.is_first_login),
    };

    // Redirect to frontend with token in query param (frontend will store it)
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userData),
    });
    res.redirect(`${FRONTEND_URL}/auth/google/callback?${params.toString()}`);
  }
);

module.exports = router;
