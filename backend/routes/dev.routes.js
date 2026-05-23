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
// Always resets demo user passwords so credentials are guaranteed to work.
router.post("/seed-demo", async (req, res) => {
  console.log("🌱 DEV SEED ROUTE HIT");

  try {
    const results = [];

    // Hash password once — reuse for both users
    const adminHash = await bcrypt.hash("12345678", 10);
    const studentHash = await bcrypt.hash("12345678", 10);

    // ── Admin user ──────────────────────────────────────────────────────────
    const adminEmail = "admin@aastu.edu.et";
    const [existingAdmin] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      // ALWAYS reset password so demo credentials are guaranteed to work
      await db.execute(
        "UPDATE users SET password = ?, role = 'admin', is_first_login = 0 WHERE email = ?",
        [adminHash, adminEmail]
      );
      results.push({ user: adminEmail, action: "password_reset_role_ensured" });
      console.log("✓ Admin password reset:", adminEmail);
    } else {
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
      // ALWAYS reset password so demo credentials are guaranteed to work
      await db.execute(
        "UPDATE users SET password = ?, is_first_login = 0 WHERE email = ?",
        [studentHash, studentEmail]
      );
      results.push({ user: studentEmail, action: "password_reset" });
      console.log("✓ Student password reset:", studentEmail);
    } else {
      await db.execute(
        `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["Test Student", studentEmail, "AAU-2024-CS-001", "Computer Science", studentHash, "student", 0]
      );
      results.push({ user: studentEmail, action: "created", role: "student" });
      console.log("✓ Created student user:", studentEmail);
    }

    // ── Organizer demo user ─────────────────────────────────────────────────
    const organizerEmail = "organizer@aastu.edu.et";
    const [existingOrg] = await db.execute(
      "SELECT id FROM users WHERE email = ?", [organizerEmail]
    );
    const orgHash = await bcrypt.hash("12345678", 10);
    if (existingOrg.length > 0) {
      await db.execute(
        "UPDATE users SET password = ?, role = 'organizer', is_first_login = 0 WHERE email = ?",
        [orgHash, organizerEmail]
      );
      results.push({ user: organizerEmail, action: "password_reset" });
    } else {
      await db.execute(
        `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["Demo Organizer", organizerEmail, "ORG-001", "Computer Science", orgHash, "organizer", 0]
      );
      results.push({ user: organizerEmail, action: "created", role: "organizer" });
    }
    // Ensure organizer profile exists
    const [orgRow] = await db.execute("SELECT id FROM users WHERE email = ?", [organizerEmail]);
    const orgUserId = orgRow[0]?.id;
    if (orgUserId) {
      const [orgProfile] = await db.execute("SELECT id FROM organizer_profiles WHERE user_id = ?", [orgUserId]);
      if (orgProfile.length === 0) {
        await db.execute(
          `INSERT INTO organizer_profiles (user_id, club_name, bio, application_status, approved_at)
           VALUES (?, ?, ?, 'approved', datetime('now'))`,
          [orgUserId, "AASTU Tech Club", "Official demo organizer account"]
        );
      }
    }
    const [eventsCheck] = await db.execute("SELECT id FROM events LIMIT 1");
    if (eventsCheck.length === 0) {
      const [adminRow] = await db.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
      const adminId = adminRow[0]?.id || 1;
      const [orgRow2] = await db.execute("SELECT id FROM users WHERE email = ?", [organizerEmail]);
      const orgId = orgRow2[0]?.id || adminId;

      // All 12 mock events assigned to the demo organizer
      const mockEvents = [
        ["AASTU Grand Hackathon 2024", "Ethiopia's premier collegiate innovation challenge. 48 hours of intense creation, networking with industry leaders, and competing for over 500,000 ETB in prizes.", "Hackathons", "Computer Science", "2026-05-31", "2026-06-02", "AASTU Tech Hall, Addis Ababa", 500, "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80", 1, "Hackathon,Competition,Tech", 458],
        ["HackAASTU 24: 48h Coding Sprint", "A 48-hour coding sprint focused on building real-world solutions for Ethiopian startups.", "Hackathons", "Software Engineering", "2026-05-23", "2026-05-25", "Main Tech Hall, Block B", 500, "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", 1, "Hackathon,Coding,Sprint", 425],
        ["AASTU Creative Arts Gala", "An evening celebrating creativity, culture, and artistic expression from AASTU students.", "Cultural", "Architecture", "2026-05-23", "2026-05-23", "University Amphitheater", 200, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80", 0, "Cultural,Arts,Gala", 120],
        ["Architecture & Sustainability Forum", "Exploring sustainable design principles and green architecture for Ethiopian cities.", "Seminars", "Architecture", "2026-06-01", "2026-06-01", "Hall 5B, Design Wing", 150, "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80", 0, "Architecture,Sustainability,Forum", 45],
        ["The Startup Mindset Workshop", "Learn the fundamentals of startup thinking, lean methodology, and pitching to investors.", "Workshops", "Business", "2026-06-07", "2026-06-07", "Incubation Center", 80, "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80", 0, "Startup,Workshop,Business", 74],
        ["Bio-Tech & Ethics Summit", "Examining the ethical dimensions of modern biotechnology and its impact on society.", "Seminars", "Biotechnology", "2026-06-14", "2026-06-14", "Seminar Hall 1A", 300, "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80", 0, "Biotech,Ethics,Science", 135],
        ["Drama Society: Annual Play", "The annual theatrical production showcasing AASTU student talent in performing arts.", "Cultural", "Arts", "2026-06-21", "2026-06-21", "Main Theater", 400, "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80", 0, "Drama,Theater,Cultural", 312],
        ["Data Science Workshop", "Hands-on workshop covering Python, pandas, and machine learning fundamentals.", "Workshops", "Computer Science", "2026-06-06", "2026-06-06", "AASTU Library", 60, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80", 0, "Data Science,Python,ML", 58],
        ["Robotics Expo 2024", "Showcase of student-built robots and automation projects from across departments.", "Tech", "Mechanical Engineering", "2026-05-18", "2026-05-20", "Mechanical Wing", 200, "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80", 0, "Robotics,Tech,Expo", 200],
        ["Cybersecurity Summit", "Deep dive into ethical hacking, network security, and digital forensics.", "Tech", "Computer Science", "2026-05-13", "2026-05-14", "Main Auditorium", 300, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80", 0, "Cybersecurity,Hacking,Tech", 300],
        ["Startup Pitch Night", "Student startups pitch their ideas to a panel of investors and industry mentors.", "Networking", "Business", "2026-06-12", "2026-06-12", "Innovation Hub", 150, "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80", 0, "Startup,Pitch,Networking", 89],
        ["Industrial Automation 4.0", "Exploring Industry 4.0 technologies including IoT, AI, and smart manufacturing.", "Tech", "Mechanical Engineering", "2026-05-23", "2026-05-23", "Engineering Block, Hall B", 200, "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80", 0, "Automation,IoT,Industry 4.0", 45],
      ];

      for (const [title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, registration_count] of mockEvents) {
        await db.execute(
          `INSERT INTO events (title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, created_by, organizer_id, status, registration_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
          [title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, orgId, orgId, registration_count]
        );
      }
      results.push({ action: "created_sample_events", count: mockEvents.length });
      console.log(`✓ Created ${mockEvents.length} sample events assigned to organizer`);

      // Register student to first event
      const [studentRow] = await db.execute("SELECT id FROM users WHERE email = ?", [studentEmail]);
      const [eventRow] = await db.execute("SELECT id FROM events WHERE title = ? LIMIT 1", ["AASTU Grand Hackathon 2024"]);
      const studentId = studentRow[0]?.id;
      const eventId = eventRow[0]?.id;
      if (studentId && eventId) {
        await db.execute(
          `INSERT OR IGNORE INTO registrations (student_id, event_id, qr_code, status) VALUES (?, ?, ?, ?)`,
          [studentId, eventId, `QR-DEMO-${Date.now()}`, "confirmed"]
        );
        results.push({ action: "registered_student_to_event" });
      }
    } else {
      // Update existing events to assign to organizer if they have no organizer_id
      if (orgUserId) {
        await db.execute(
          "UPDATE events SET organizer_id = ?, created_by = ? WHERE organizer_id IS NULL OR organizer_id = 0",
          [orgUserId, orgUserId]
        ).catch(() => {});
        results.push({ action: "assigned_existing_events_to_organizer" });
      }
    }

    console.log("🌱 Seed complete:", results);

    return res.status(200).json({
      success: true,
      message: "Demo data seeded successfully — passwords reset",
      credentials: {
        admin: { email: "admin@aastu.edu.et", password: "12345678" },
        organizer: { email: "organizer@aastu.edu.et", password: "12345678" },
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

// GET /api/dev/health
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Dev routes active", timestamp: new Date().toISOString() });
});

module.exports = router;
