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

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "AASTU Events API Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);       // Google OAuth: /api/auth/google
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
