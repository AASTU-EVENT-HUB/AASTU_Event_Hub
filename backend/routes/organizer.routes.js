const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const organizerOnly = require("../middleware/organizerOnly");
const organizerOrAdmin = require("../middleware/organizerOrAdmin");
const adminOnly = require("../middleware/adminOnly");

const {
  applyOrganizer, getApplicationStatus,
  getApplications, approveApplication, rejectApplication,
  getOrganizerRegistrations, getCheckinList, manualCheckin,
  scanQR, getOrganizerAnalytics,
} = require("../controllers/organizer.controller");

const {
  getThresholdSuggestions, claimSuggestion,
} = require("../controllers/suggestions.controller");

const { getOrganizerFeedback } = require("../controllers/feedback.controller");
const { getOrganizerEvents } = require("../controllers/events.controller");

// ── Student applies to become organizer ──────────────────────────────────────
router.post("/apply", auth, applyOrganizer);
router.get("/apply/status", auth, getApplicationStatus);

// ── Admin manages applications ───────────────────────────────────────────────
router.get("/admin/applications", auth, adminOnly, getApplications);
router.patch("/admin/applications/:id/approve", auth, adminOnly, approveApplication);
router.patch("/admin/applications/:id/reject", auth, adminOnly, rejectApplication);

// ── Organizer routes ─────────────────────────────────────────────────────────
router.get("/events", auth, organizerOnly, getOrganizerEvents);
router.get("/registrations", auth, organizerOnly, getOrganizerRegistrations);
router.get("/checkin/:eventId", auth, organizerOrAdmin, getCheckinList);
router.patch("/checkin/:eventId/:registrationId", auth, organizerOrAdmin, manualCheckin);
router.post("/scanner/:eventId", auth, organizerOrAdmin, scanQR);
router.get("/analytics", auth, organizerOnly, getOrganizerAnalytics);
router.get("/suggestions", auth, organizerOnly, getThresholdSuggestions);
router.post("/suggestions/:id/claim", auth, organizerOnly, claimSuggestion);
router.get("/feedback", auth, organizerOnly, getOrganizerFeedback);

module.exports = router;
