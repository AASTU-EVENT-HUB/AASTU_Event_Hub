const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

const DB_TYPE = process.env.DB_TYPE || "sqlite";
const SQLITE_FILE = path.resolve(__dirname, "..", "data", "database.sqlite");
const SQLJS_WASM = path.join(__dirname, "..", "node_modules", "sql.js", "dist", "sql-wasm.wasm");

// ─── SQLite via sql.js (pure JS, no native compilation) ──────────────────────

let sqlJsDb = null;
let saveTimer = null;

const ensureDir = () => {
  const dir = path.dirname(SQLITE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Persist the in-memory DB to disk (debounced)
const persistDb = () => {
  if (!sqlJsDb) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      ensureDir();
      const data = sqlJsDb.export();
      fs.writeFileSync(SQLITE_FILE, Buffer.from(data));
    } catch (e) {
      console.error("Failed to persist SQLite DB:", e.message);
    }
  }, 200);
};

const CREATE_TABLES = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  student_id TEXT UNIQUE,
  department TEXT,
  password TEXT,
  role TEXT DEFAULT 'student',
  is_first_login INTEGER DEFAULT 1,
  is_suspended INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organizer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  club_name TEXT,
  bio TEXT,
  logo TEXT,
  application_status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  applied_at TEXT DEFAULT (datetime('now')),
  approved_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  category TEXT,
  department TEXT,
  start_date TEXT,
  end_date TEXT,
  location TEXT,
  capacity INTEGER,
  banner_image TEXT,
  is_team_event INTEGER DEFAULT 0,
  tags TEXT,
  created_by INTEGER,
  organizer_id INTEGER,
  status TEXT DEFAULT 'approved',
  rejection_reason TEXT,
  registration_count INTEGER DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  qr_code TEXT,
  status TEXT DEFAULT 'confirmed',
  registered_at TEXT DEFAULT (datetime('now')),
  UNIQUE (student_id, event_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  preferred_date TEXT,
  suggested_by INTEGER NOT NULL,
  upvote_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  claimed_by INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (suggested_by) REFERENCES users(id),
  FOREIGN KEY (claimed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS suggestion_upvotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suggestion_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (suggestion_id, user_id),
  FOREIGN KEY (suggestion_id) REFERENCES suggestions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  is_visible INTEGER DEFAULT 1,
  UNIQUE (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const initSqlJs = async () => {
  const initSqlJsFn = require("sql.js");
  const SQL = await initSqlJsFn({
    locateFile: () => SQLJS_WASM,
  });

  ensureDir();
  let db;
  if (fs.existsSync(SQLITE_FILE)) {
    const fileBuffer = fs.readFileSync(SQLITE_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(CREATE_TABLES);
  persistDb();

  return db;
};

// Convert sql.js result to array of row objects
const stmtToRows = (stmt) => {
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

// Wrap sql.js in a mysql2-compatible async interface
const createSqlJsClient = (db) => {
  const execute = async (sql, params = []) => {
    const trimmed = sql.trim().toUpperCase();

    // Convert ? placeholders to named params for sql.js
    // sql.js uses positional params as array
    const bindParams = params.map((p) => {
      if (p === null || p === undefined) return null;
      if (typeof p === "boolean") return p ? 1 : 0;
      return p;
    });

    if (
      trimmed.startsWith("SELECT") ||
      trimmed.startsWith("PRAGMA") ||
      trimmed.startsWith("WITH")
    ) {
      const stmt = db.prepare(sql);
      stmt.bind(bindParams);
      const rows = stmtToRows(stmt);
      return [rows, null];
    }

    // INSERT / UPDATE / DELETE
    db.run(sql, bindParams);
    const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0;
    const changes = db.exec("SELECT changes() as c")[0]?.values[0]?.[0] || 0;
    persistDb();
    return [{ insertId: lastId, affectedRows: changes }];
  };

  const query = async (sql, params = []) => {
    const bindParams = (params || []).map((p) => (p === null || p === undefined ? null : p));
    const stmt = db.prepare(sql);
    stmt.bind(bindParams);
    const rows = stmtToRows(stmt);
    return [rows, null];
  };

  return { execute, query };
};

// ─── MySQL pool ───────────────────────────────────────────────────────────────

const createMysqlPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aastu_events",
    waitForConnections: true,
    connectionLimit: 10,
  });

// ─── Initialization ───────────────────────────────────────────────────────────

let dbClient;

const getDbClient = () => {
  if (!dbClient) throw new Error("Database client not initialized");
  return dbClient;
};

(async () => {
  try {
    if (DB_TYPE === "mysql") {
      dbClient = createMysqlPool();
      console.log("Using MySQL database");
    } else {
      const db = await initSqlJs();
      dbClient = createSqlJsClient(db);
      console.log("Using SQLite database (sql.js) at", SQLITE_FILE);
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();

module.exports = {
  execute: async (...args) => getDbClient().execute(...args),
  query: async (...args) => getDbClient().query(...args),
};
