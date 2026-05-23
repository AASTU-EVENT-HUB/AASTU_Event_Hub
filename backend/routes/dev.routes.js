/**
 * DEV / SEED routes — Mounted at: /api/dev
 * Both GET and POST /seed-demo work so you can trigger it from a browser tab.
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ── Seed handler (shared by GET and POST) ────────────────────────────────────
async function handleSeed(req, res) {
  console.log("🌱 DEV SEED ROUTE HIT");
  try {
    const results = [];

    // ── Run migrations on existing DB ─────────────────────────────────────
    // Add columns that may be missing from older DB versions
    const migrations = [
      "ALTER TABLE users ADD COLUMN is_suspended INTEGER DEFAULT 0",
      "ALTER TABLE users ADD COLUMN avatar TEXT",
      "ALTER TABLE events ADD COLUMN organizer_id INTEGER",
      "ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'approved'",
      "ALTER TABLE events ADD COLUMN rejection_reason TEXT",
      "CREATE TABLE IF NOT EXISTS organizer_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, club_name TEXT, bio TEXT, logo TEXT, application_status TEXT DEFAULT 'pending', rejection_reason TEXT, applied_at TEXT DEFAULT (datetime('now')), approved_at TEXT)",
      "CREATE TABLE IF NOT EXISTS suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, category TEXT, preferred_date TEXT, suggested_by INTEGER NOT NULL, upvote_count INTEGER DEFAULT 0, status TEXT DEFAULT 'open', claimed_by INTEGER, created_at TEXT DEFAULT (datetime('now')))",
      "CREATE TABLE IF NOT EXISTS suggestion_upvotes (id INTEGER PRIMARY KEY AUTOINCREMENT, suggestion_id INTEGER NOT NULL, user_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE (suggestion_id, user_id))",
      "CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, review TEXT, created_at TEXT DEFAULT (datetime('now')), is_visible INTEGER DEFAULT 1, UNIQUE (event_id, user_id))",
      "CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT, title TEXT, message TEXT, icon TEXT DEFAULT '🔔', event_ref TEXT, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))",
    ];

    for (const sql of migrations) {
      try {
        await db.execute(sql);
      } catch (e) {
        // Ignore "duplicate column" and "table already exists" errors
        if (!e.message?.includes("duplicate column") && !e.message?.includes("already exists")) {
          console.warn("Migration warning:", e.message);
        }
      }
    }
    results.push({ action: "migrations_applied" });
    console.log("✓ Migrations applied");
    const adminHash    = await bcrypt.hash("12345678", 10);
    const studentHash  = await bcrypt.hash("12345678", 10);
    const orgHash      = await bcrypt.hash("12345678", 10);

    // ── Admin ──────────────────────────────────────────────────────────────
    const adminEmail = "admin@aastu.edu.et";
    const [existingAdmin] = await db.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (existingAdmin.length > 0) {
      await db.execute("UPDATE users SET password=?, role='admin', is_first_login=0 WHERE email=?", [adminHash, adminEmail]);
      results.push({ user: adminEmail, action: "password_reset" });
    } else {
      await db.execute(
        "INSERT INTO users (name,email,student_id,department,password,role,is_first_login) VALUES (?,?,?,?,?,?,?)",
        ["Admin User", adminEmail, "ADM-001", "Administration", adminHash, "admin", 0]
      );
      results.push({ user: adminEmail, action: "created" });
    }

    // ── Student ────────────────────────────────────────────────────────────
    const studentEmail = "student@aastu.edu.et";
    const [existingStudent] = await db.execute("SELECT id FROM users WHERE email = ?", [studentEmail]);
    if (existingStudent.length > 0) {
      await db.execute("UPDATE users SET password=?, is_first_login=0 WHERE email=?", [studentHash, studentEmail]);
      results.push({ user: studentEmail, action: "password_reset" });
    } else {
      await db.execute(
        "INSERT INTO users (name,email,student_id,department,password,role,is_first_login) VALUES (?,?,?,?,?,?,?)",
        ["Test Student", studentEmail, "AAU-2024-CS-001", "Computer Science", studentHash, "student", 0]
      );
      results.push({ user: studentEmail, action: "created" });
    }

    // ── Organizer ──────────────────────────────────────────────────────────
    const organizerEmail = "organizer@aastu.edu.et";
    const [existingOrg] = await db.execute("SELECT id FROM users WHERE email = ?", [organizerEmail]);
    if (existingOrg.length > 0) {
      await db.execute("UPDATE users SET password=?, role='organizer', is_first_login=0 WHERE email=?", [orgHash, organizerEmail]);
      results.push({ user: organizerEmail, action: "password_reset" });
    } else {
      await db.execute(
        "INSERT INTO users (name,email,student_id,department,password,role,is_first_login) VALUES (?,?,?,?,?,?,?)",
        ["Demo Organizer", organizerEmail, "ORG-001", "Computer Science", orgHash, "organizer", 0]
      );
      results.push({ user: organizerEmail, action: "created" });
    }

    // Ensure organizer profile
    const [orgRow] = await db.execute("SELECT id FROM users WHERE email=?", [organizerEmail]);
    const orgUserId = orgRow[0]?.id;
    if (orgUserId) {
      const [op] = await db.execute("SELECT id FROM organizer_profiles WHERE user_id=?", [orgUserId]);
      if (op.length === 0) {
        await db.execute(
          "INSERT INTO organizer_profiles (user_id,club_name,bio,application_status,approved_at) VALUES (?,?,?,'approved',datetime('now'))",
          [orgUserId, "AASTU Tech Club", "Official demo organizer account"]
        );
      }
    }

    // ── Events ─────────────────────────────────────────────────────────────
    const [eventsCheck] = await db.execute("SELECT id FROM events LIMIT 1");
    if (eventsCheck.length === 0) {
      const [orgRow2] = await db.execute("SELECT id FROM users WHERE email=?", [organizerEmail]);
      const orgId = orgRow2[0]?.id || 1;

      const mockEvents = [
        ["AASTU Grand Hackathon 2024","Ethiopia's premier collegiate innovation challenge. 48 hours of intense creation, networking with industry leaders, and competing for over 500,000 ETB in prizes.","Hackathons","Computer Science","2026-05-31","2026-06-02","AASTU Tech Hall, Addis Ababa",500,"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",1,"Hackathon,Competition,Tech",458],
        ["HackAASTU 24: 48h Coding Sprint","A 48-hour coding sprint focused on building real-world solutions for Ethiopian startups.","Hackathons","Software Engineering","2026-05-23","2026-05-25","Main Tech Hall, Block B",500,"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",1,"Hackathon,Coding,Sprint",425],
        ["AASTU Creative Arts Gala","An evening celebrating creativity, culture, and artistic expression from AASTU students.","Cultural","Architecture","2026-05-23","2026-05-23","University Amphitheater",200,"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",0,"Cultural,Arts,Gala",120],
        ["Architecture & Sustainability Forum","Exploring sustainable design principles and green architecture for Ethiopian cities.","Seminars","Architecture","2026-06-01","2026-06-01","Hall 5B, Design Wing",150,"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",0,"Architecture,Sustainability,Forum",45],
        ["The Startup Mindset Workshop","Learn the fundamentals of startup thinking, lean methodology, and pitching to investors.","Workshops","Business","2026-06-07","2026-06-07","Incubation Center",80,"https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",0,"Startup,Workshop,Business",74],
        ["Bio-Tech & Ethics Summit","Examining the ethical dimensions of modern biotechnology and its impact on society.","Seminars","Biotechnology","2026-06-14","2026-06-14","Seminar Hall 1A",300,"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80",0,"Biotech,Ethics,Science",135],
        ["Drama Society: Annual Play","The annual theatrical production showcasing AASTU student talent in performing arts.","Cultural","Arts","2026-06-21","2026-06-21","Main Theater",400,"https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80",0,"Drama,Theater,Cultural",312],
        ["Data Science Workshop","Hands-on workshop covering Python, pandas, and machine learning fundamentals.","Workshops","Computer Science","2026-06-06","2026-06-06","AASTU Library",60,"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",0,"Data Science,Python,ML",58],
        ["Robotics Expo 2024","Showcase of student-built robots and automation projects from across departments.","Tech","Mechanical Engineering","2026-05-18","2026-05-20","Mechanical Wing",200,"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",0,"Robotics,Tech,Expo",200],
        ["Cybersecurity Summit","Deep dive into ethical hacking, network security, and digital forensics.","Tech","Computer Science","2026-05-13","2026-05-14","Main Auditorium",300,"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",0,"Cybersecurity,Hacking,Tech",300],
        ["Startup Pitch Night","Student startups pitch their ideas to a panel of investors and industry mentors.","Networking","Business","2026-06-12","2026-06-12","Innovation Hub",150,"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",0,"Startup,Pitch,Networking",89],
        ["Industrial Automation 4.0","Exploring Industry 4.0 technologies including IoT, AI, and smart manufacturing.","Tech","Mechanical Engineering","2026-05-23","2026-05-23","Engineering Block, Hall B",200,"https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80",0,"Automation,IoT,Industry 4.0",45],
      ];

      for (const [title,desc,cat,dept,sd,ed,loc,cap,banner,team,tags,regCount] of mockEvents) {
        await db.execute(
          "INSERT INTO events (title,description,category,department,start_date,end_date,location,capacity,banner_image,is_team_event,tags,created_by,organizer_id,status,registration_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'approved',?)",
          [title,desc,cat,dept,sd,ed,loc,cap,banner,team,tags,orgId,orgId,regCount]
        );
      }
      results.push({ action: "created_events", count: mockEvents.length });

      // Register student to first event
      const [sRow] = await db.execute("SELECT id FROM users WHERE email=?", [studentEmail]);
      const [eRow] = await db.execute("SELECT id FROM events WHERE title=? LIMIT 1", ["AASTU Grand Hackathon 2024"]);
      if (sRow[0]?.id && eRow[0]?.id) {
        await db.execute(
          "INSERT OR IGNORE INTO registrations (student_id,event_id,qr_code,status) VALUES (?,?,?,?)",
          [sRow[0].id, eRow[0].id, `QR-DEMO-${Date.now()}`, "confirmed"]
        );
        results.push({ action: "registered_student_to_hackathon" });
      }
    } else {
      // Assign existing events to organizer if missing
      if (orgUserId) {
        await db.execute(
          "UPDATE events SET organizer_id=?, created_by=? WHERE organizer_id IS NULL OR organizer_id=0",
          [orgUserId, orgUserId]
        ).catch(() => {});
        results.push({ action: "assigned_events_to_organizer" });
      }
      results.push({ action: "events_already_exist" });
    }

    console.log("🌱 Seed complete:", results);
    return res.status(200).json({
      success: true,
      message: "Seeded successfully — passwords reset",
      credentials: {
        admin:     { email: "admin@aastu.edu.et",     password: "12345678" },
        organizer: { email: "organizer@aastu.edu.et", password: "12345678" },
        student:   { email: "student@aastu.edu.et",   password: "12345678" },
      },
      results,
    });
  } catch (err) {
    console.error("❌ Seed error:", err);
    return res.status(500).json({ success: false, message: "Seed failed: " + err.message });
  }
}

// Both GET and POST work — GET lets you trigger it directly from a browser tab
router.get("/seed-demo", handleSeed);
router.post("/seed-demo", handleSeed);

// Health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Dev routes active", timestamp: new Date().toISOString() });
});

module.exports = router;
