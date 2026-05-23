const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/events.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const proposalsRoutes = require("./routes/proposals.routes");
const registrationRoutes = require("./routes/registration.routes");
const checkinRoutes = require("./routes/checkin.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const usersRoutes = require("./routes/users.routes");
const googleRoutes = require("./routes/google.routes");
const devRoutes = require("./routes/dev.routes");
const organizerRoutes = require("./routes/organizer.routes");
const suggestionsRoutes = require("./routes/suggestions.routes");
const feedbackRoutes = require("./routes/feedback.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow multiple origins: local dev + production frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://aastu-event-hub.onrender.com",
  "https://aastu-events-hub.onrender.com",
  "https://aastu-events-frontend.onrender.com",
];

// Also support a custom CORS_ORIGIN env variable (comma-separated list)
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((o) => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "AASTU Events API Running", env: process.env.NODE_ENV || "development" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/feedback", feedbackRoutes);

// ── Dev / Seed routes ─────────────────────────────────────────────────────────
app.use("/api/dev", devRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   NODE_ENV : ${process.env.NODE_ENV || "development"}`);
  console.log(`   DB_TYPE  : ${process.env.DB_TYPE || "sqlite"}`);
  console.log(`   CORS     : ${allowedOrigins.join(", ")}`);
  console.log(`   Seed URL : POST /api/dev/seed-demo`);
});
