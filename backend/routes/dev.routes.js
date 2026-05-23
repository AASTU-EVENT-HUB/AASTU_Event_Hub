/**
 * DEV / SEED routes
 * Mounted at: /api/dev
 *
 * These routes are always active so the seed endpoint works in production
 * to bootstrap demo users. They are idempotent (safe to call multiple times).
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// POST /api/dev/seed-demo
// Creates demo admin + student users if they don't already exist.
router.post("/seed-demo", async (req, res) => {
  console.log("🌱 DEV SEED ROUTE HIT");

  try {
    const results = [];

    // ── Admin user ──────────────────────────────────────────────────────────
    const adminEmail = "admin@aastu.edu.et";
    const [existingAdmin] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      // Ensure role is admin in case it was changed
      await db.execute("UPDATE users SET role = 'admin', is_first_login = 0 WHERE email = ?", [adminEmail]);
      results.push({ user: adminEmail, action: "already_exists_role_ensured" });
      console.log("✓ Admin user already exists, role ensured:", adminEmail);
    } else {
      const adminHash = await bcrypt.hash("12345678", 10);
      await db.execute(
        `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["Admin User", adminEmail, "ADM-001", "Administration", adminHash, "admin", 0]
      );
      results.push({ user: adminEmail, action: "created", role: "admin" });
      console.log("✓ Created admin user:", adminEmail);
    }

    // ── Student user ────────────────────────────────────────────────────────
    const studentEmail = "student@aastu.edu.et";
    const [existingStudent] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [studentEmail]
    );

    if (existingStudent.length > 0) {
      results.push({ user: studentEmail, action: "already_exists" });
      console.log("✓ Student user already exists:", studentEmail);
    } else {
      const studentHash = await bcrypt.hash("12345678", 10);
      await db.execute(
        `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["Test Student", studentEmail, "AAU-2024-CS-001", "Computer Science", studentHash, "student", 0]
      );
      results.push({ user: studentEmail, action: "created", role: "student" });
      console.log("✓ Created student user:", studentEmail);
    }

    // ── Sample events ───────────────────────────────────────────────────────
    const [eventsCheck] = await db.execute("SELECT id FROM events LIMIT 1");
    if (eventsCheck.length === 0) {
      const [adminRow] = await db.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
      const adminId = adminRow[0]?.id || 1;

      await db.execute(
        `INSERT INTO events (title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, created_by, registration_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Intro to AI Workshop",
          "Hands-on workshop on AI basics and practical exercises.",
          "Workshop",
          "Computer Science",
          "2026-06-15",
          "2026-06-15",
          "AASTU Hall A",
          120,
          "",
          0,
          "AI,Workshop",
          adminId,
          0,
        ]
      );

      await db.execute(
        `INSERT INTO events (title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, created_by, registration_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Inter-College Hackathon",
          "48-hour hackathon with prizes.",
          "Hackathon",
          "All",
          "2026-07-10",
          "2026-07-12",
          "Main Campus Grounds",
          300,
          "",
          1,
          "Hackathon,Teams",
          adminId,
          0,
        ]
      );

      results.push({ action: "created_sample_events", count: 2 });
      console.log("✓ Created 2 sample events");

      // Register student to first event
      const [studentRow] = await db.execute("SELECT id FROM users WHERE email = ?", [studentEmail]);
      const [eventRow] = await db.execute("SELECT id FROM events WHERE title = ? LIMIT 1", ["Intro to AI Workshop"]);
      const studentId = studentRow[0]?.id;
      const eventId = eventRow[0]?.id;

      if (studentId && eventId) {
        await db.execute(
          `INSERT OR IGNORE INTO registrations (student_id, event_id, qr_code, status) VALUES (?, ?, ?, ?)`,
          [studentId, eventId, `QR-DEMO-${Date.now()}`, "confirmed"]
        );
        await db.execute(
          "UPDATE events SET registration_count = registration_count + 1 WHERE id = ?",
          [eventId]
        );
        results.push({ action: "registered_student_to_event" });
        console.log("✓ Registered demo student to Intro to AI Workshop");
      }
    } else {
      results.push({ action: "events_already_exist" });
    }

    console.log("🌱 Seed complete:", results);

    return res.status(200).json({
      success: true,
      message: "Demo data seeded successfully",
      credentials: {
        admin: { email: "admin@aastu.edu.et", password: "12345678" },
        student: { email: "student@aastu.edu.et", password: "12345678" },
      },
      results,
    });
  } catch (err) {
    console.error("❌ Seed error:", err);
    return res.status(500).json({
      success: false,
      message: "Seed failed: " + err.message,
    });
  }
});

// GET /api/dev/health — quick sanity check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Dev routes active", timestamp: new Date().toISOString() });
});

module.exports = router;
