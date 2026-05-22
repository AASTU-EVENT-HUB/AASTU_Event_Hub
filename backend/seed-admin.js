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
  const adminPassword = await bcrypt.hash("admin123", 10);

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
  const studentPassword = await bcrypt.hash("student123", 10);
  const existingStudent = db.exec(`SELECT id FROM users WHERE email = '${studentEmail}'`);
  if (existingStudent.length === 0 || existingStudent[0].values.length === 0) {
    db.run(
      `INSERT INTO users (name, email, student_id, department, password, role, is_first_login)
       VALUES ('Test Student', '${studentEmail}', 'AAU-2024-CS-001', 'Computer Science', '${studentPassword}', 'student', 0)`
    );
    console.log("✓ Created student user:", studentEmail, "/ password: student123");
  }

  const data = db.export();
  fs.writeFileSync(SQLITE_FILE, Buffer.from(data));
  console.log("✓ Database saved to", SQLITE_FILE);
  console.log("\nLogin credentials:");
  console.log("  Admin:   admin@aastu.edu.et / admin123");
  console.log("  Student: student@aastu.edu.et / student123");
}

main().catch(console.error);
