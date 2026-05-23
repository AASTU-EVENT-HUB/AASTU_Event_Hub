const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ── Helpers ───────────────────────────────────────────────────────────────────

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  console.log("📝 REGISTER REQUEST:", req.body?.email);
  try {
    const { name, email, studentId, department, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    const missing = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");
    if (!studentId) missing.push("studentId");
    if (!department) missing.push("department");
    if (!password) missing.push("password");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // ── Duplicate check ─────────────────────────────────────────────────────
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const [existingStudentId] = await db.execute(
      "SELECT id FROM users WHERE student_id = ?",
      [studentId]
    );
    if (existingStudentId.length > 0) {
      return res.status(409).json({ success: false, message: "This Student ID is already registered" });
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Insert user ─────────────────────────────────────────────────────────
    const [result] = await db.execute(
      `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, studentId, department, hashedPassword, "student", 1]
    );

    const userId = result.insertId;
    console.log("✅ REGISTER SUCCESS: user id =", userId, "email =", email);

    const token = signToken({ id: userId, role: "student", name });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        role: "student",
        department,
        isFirstLogin: true,
        onboardingComplete: false,
      },
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error.message, error.stack);
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  console.log("🔐 LOGIN REQUEST:", req.body?.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // ── Find user ───────────────────────────────────────────────────────────
    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log("❌ LOGIN FAILED: no user found for", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];

    // ── Password check ──────────────────────────────────────────────────────
    if (!user.password) {
      console.log("❌ LOGIN FAILED: user has no password (OAuth account?)", email);
      return res.status(401).json({ success: false, message: "This account uses Google sign-in. Please use 'Sign in with Google'." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("❌ LOGIN FAILED: wrong password for", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // ── Sign token ──────────────────────────────────────────────────────────
    const token = signToken({ id: user.id, role: user.role, name: user.name });

    console.log("✅ LOGIN SUCCESS:", email, "role =", user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.student_id,
        isFirstLogin: Boolean(user.is_first_login),
        // onboardingComplete mirrors isFirstLogin (false = onboarding done)
        onboardingComplete: !Boolean(user.is_first_login),
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message, error.stack);
    next(error);
  }
};
