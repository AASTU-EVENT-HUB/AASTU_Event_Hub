/**
 * Run this script once to set up an admin user:
 *   node seed-admin.js
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const initSqlJs = require("sql.js");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const SQLITE_FILE = path.resolve(__dirname, "data", "database.sqlite");
const WASM = path.join(__dirname, "node_modules", "sql.js", "dist", "sql-wasm.wasm");

async function main() {
  const SQL = await initSqlJs({ locateFile: () => WASM });

  const dir = path.dirname(SQLITE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buf = fs.existsSync(SQLITE_FILE) ? fs.readFileSync(SQLITE_FILE) : null;
  const db = buf ? new SQL.Database(buf) : new SQL.Database();

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT UNIQUE, student_id TEXT UNIQUE,
      department TEXT, password TEXT, role TEXT DEFAULT 'student',
      is_first_login INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT,
      category TEXT, department TEXT, start_date TEXT, end_date TEXT,
      location TEXT, capacity INTEGER, banner_image TEXT,
      is_team_event INTEGER DEFAULT 0, tags TEXT, created_by INTEGER,
      registration_count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL, qr_code TEXT, status TEXT DEFAULT 'confirmed',
      registered_at TEXT DEFAULT (datetime('now')),
      UNIQUE (student_id, event_id)
    );
  `);

  const adminEmail = "admin@aastu.edu.et";
  // demo password requested: 12345678
  const adminPassword = await bcrypt.hash("12345678", 10);

  // Check if admin exists
  const existing = db.exec(`SELECT id FROM users WHERE email = '${adminEmail}'`);
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(`UPDATE users SET role = 'admin' WHERE email = '${adminEmail}'`);
    console.log("✓ Updated existing user to admin role:", adminEmail);
  } else {
    db.run(
      `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
       VALUES ('Admin User', '${adminEmail}', 'ADM-001', 'Administration', '${adminPassword}', 'admin', 0)`
    );
    console.log("✓ Created admin user:", adminEmail, "/ password: admin123");
  }

  // Also ensure student@aastu.edu.et exists
  const studentEmail = "student@aastu.edu.et";
  // demo password requested: 12345678
  const studentPassword = await bcrypt.hash("12345678", 10);
  const existingStudent = db.exec(`SELECT id FROM users WHERE email = '${studentEmail}'`);
  if (existingStudent.length === 0 || existingStudent[0].values.length === 0) {
    db.run(
      `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
       VALUES ('Test Student', '${studentEmail}', 'AAU-2024-CS-001', 'Computer Science', '${studentPassword}', 'student', 0)`
    );
    console.log("✓ Created student user:", studentEmail, "/ password: 12345678");
  }

  // Create sample events if not present
  const eventsExist = db.exec(`SELECT id FROM events LIMIT 1`);
  if (eventsExist.length === 0 || eventsExist[0].values.length === 0) {
    // find admin id
    const adminRow = db.exec(`SELECT id FROM users WHERE email = '${adminEmail}'`);
    const adminId = (adminRow && adminRow[0] && adminRow[0].values && adminRow[0].values[0]) ? adminRow[0].values[0][0] : 1;

    db.run(`INSERT INTO events (title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, created_by, registration_count)
      VALUES ('Intro to AI Workshop', 'Hands-on workshop on AI basics and practical exercises.', 'Workshop', 'Computer Science', '2026-06-15', '2026-06-15', 'AASTU Hall A', 120, '', 0, 'AI,Workshop', ${adminId}, 0)`);

    db.run(`INSERT INTO events (title, description, category, department, start_date, end_date, location, capacity, banner_image, is_team_event, tags, created_by, registration_count)
      VALUES ('Inter-College Hackathon', '48-hour hackathon with prizes.', 'Hackathon', 'All', '2026-07-10', '2026-07-12', 'Main Campus Grounds', 300, '', 1, 'Hackathon,Teams', ${adminId}, 0)`);

    console.log('✓ Created two sample events (Intro to AI Workshop, Inter-College Hackathon)');

    // register the test student to the first event
    const studentRow = db.exec(`SELECT id FROM users WHERE email = '${studentEmail}'`);
    const studentId = (studentRow && studentRow[0] && studentRow[0].values && studentRow[0].values[0]) ? studentRow[0].values[0][0] : null;
    const eventRow = db.exec(`SELECT id FROM events WHERE title = 'Intro to AI Workshop' LIMIT 1`);
    const eventId = (eventRow && eventRow[0] && eventRow[0].values && eventRow[0].values[0]) ? eventRow[0].values[0][0] : null;
    if (studentId && eventId) {
      db.run(`INSERT OR IGNORE INTO registrations (student_id, event_id, qr_code, status) VALUES (${studentId}, ${eventId}, 'QR-DEMO-${Date.now()}', 'confirmed')`);
      db.run(`UPDATE events SET registration_count = registration_count + 1 WHERE id = ${eventId}`);
      console.log('✓ Registered demo student for Intro to AI Workshop');
    }
  }

  const data = db.export();
  fs.writeFileSync(SQLITE_FILE, Buffer.from(data));
  console.log("✓ Database saved to", SQLITE_FILE);
  console.log("\nLogin credentials:");
  console.log("  Admin:   admin@aastu.edu.et / 12345678");
  console.log("  Student: student@aastu.edu.et / 12345678");
}

main().catch(console.error);
