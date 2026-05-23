const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://aastu-event-hub.onrender.com",
  "https://aastu-events-hub.onrender.com",
  "https://aastu-events-frontend.onrender.com",
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((o) => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`⚠️  CORS blocked: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());

// ── Health check (no DB needed) ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "AASTU Events API Running", env: process.env.NODE_ENV || "development" });
});

// ── Mount routes ──────────────────────────────────────────────────────────────
// Routes are loaded AFTER DB is ready (see startServer below)
function mountRoutes() {
  app.use("/api/auth",          require("./routes/auth.routes"));
  app.use("/api/auth",          require("./routes/google.routes"));
  app.use("/api/events",        require("./routes/events.routes"));
  app.use("/api/registrations", require("./routes/registration.routes"));
  app.use("/api/notifications", require("./routes/notifications.routes"));
  app.use("/api/proposals",     require("./routes/proposals.routes"));
  app.use("/api/checkin",       require("./routes/checkin.routes"));
  app.use("/api/analytics",     require("./routes/analytics.routes"));
  app.use("/api/users",         require("./routes/users.routes"));
  app.use("/api/organizer",     require("./routes/organizer.routes"));
  app.use("/api/suggestions",   require("./routes/suggestions.routes"));
  app.use("/api/feedback",      require("./routes/feedback.routes"));
  app.use("/api/dev",           require("./routes/dev.routes"));
  app.use(errorHandler);
}

// ── Start server after DB is ready ────────────────────────────────────────────
async function startServer() {
  try {
    // Import db — this triggers the async DB initialization
    const db = require("./config/db");

    // Wait up to 15 seconds for DB to be ready
    let attempts = 0;
    while (attempts < 30) {
      try {
        await db.execute("SELECT 1");
        console.log("✅ Database ready");
        break;
      } catch {
        attempts++;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    mountRoutes();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   NODE_ENV : ${process.env.NODE_ENV || "development"}`);
      console.log(`   DB_TYPE  : ${process.env.DB_TYPE || "sqlite"}`);
      console.log(`   CORS     : ${allowedOrigins.join(", ")}`);
      console.log(`   Seed URL : GET /api/dev/seed-demo`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
