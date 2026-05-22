const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const mysql = require("mysql2/promise");

const DB_TYPE = process.env.DB_TYPE || "sqlite";
const SQLITE_FILE = path.resolve(__dirname, "..", "data", "database.sqlite");

const ensureSqliteDirectory = () => {
  const dir = path.dirname(SQLITE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const sqliteRun = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const sqliteAll = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const sqliteExec = (db, sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const createSqliteTables = async (db) => {
  await sqliteExec(
    db,
    `PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      student_id TEXT UNIQUE,
      department TEXT,
      password TEXT,
      role TEXT DEFAULT 'student',
      is_first_login INTEGER DEFAULT 1
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
      registration_count INTEGER DEFAULT 0,
      FOREIGN KEY (created_by) REFERENCES users(id)
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
    );`
  );
};

const createMysqlPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aastu_events",
    waitForConnections: true,
    connectionLimit: 10,
  });

const createSqliteClient = async () => {
  ensureSqliteDirectory();
  const db = new sqlite3.Database(SQLITE_FILE);
  await createSqliteTables(db);

  return {
    execute: async (sql, params = []) => {
      const trimmed = sql.trim().toUpperCase();

      if (trimmed.startsWith("SELECT")) {
        const rows = await sqliteAll(db, sql, params);
        return [rows, null];
      }

      const result = await sqliteRun(db, sql, params);
      return [
        {
          insertId: result.lastID,
          affectedRows: result.changes,
        },
      ];
    },
    query: async (sql, params = []) => {
      const rows = await sqliteAll(db, sql, params);
      return [rows, null];
    },
  };
};

const createDbClient = async () => {
  if (DB_TYPE === "mysql") {
    return createMysqlPool();
  }
  return await createSqliteClient();
};

let dbClient;

const getDbClient = () => {
  if (!dbClient) {
    throw new Error("Database client not initialized");
  }
  return dbClient;
};

(async () => {
  try {
    dbClient = await createDbClient();
    if (DB_TYPE === "sqlite") {
      console.log("Using SQLite database at", SQLITE_FILE);
    } else {
      console.log("Using MySQL database");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();

module.exports = {
  execute: async (...args) => {
    const db = getDbClient();
    return db.execute(...args);
  },
  query: async (...args) => {
    const db = getDbClient();
    return db.query(...args);
  },
};
