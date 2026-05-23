const express = require("express");
const router = express.Router();
const {
  createEvent, getEvents, getEventById, updateEvent, deleteEvent,
  approveEvent, rejectEvent,
} = require("../controllers/events.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const organizerOrAdmin = require("../middleware/organizerOrAdmin");

// Public — attach user if token present (for status filtering)
router.get("/", (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try { req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET); } catch {}
  }
  next();
}, getEvents);

router.get("/:id", getEventById);

// Organizer or Admin can create/edit/delete
router.post("/", auth, organizerOrAdmin, createEvent);
router.put("/:id", auth, organizerOrAdmin, updateEvent);
router.delete("/:id", auth, organizerOrAdmin, deleteEvent);

// Admin-only approval
router.patch("/:id/approve", auth, adminOnly, approveEvent);
router.patch("/:id/reject", auth, adminOnly, rejectEvent);

module.exports = router;
