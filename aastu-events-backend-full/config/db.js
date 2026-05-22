const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "trufat@0992", // or empty if XAMPP
  database: "aastu_events",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;