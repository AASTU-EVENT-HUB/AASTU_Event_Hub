const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/events.controller");
const authMiddleware = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", authMiddleware, adminOnly, createEvent);
router.put("/:id", authMiddleware, adminOnly, updateEvent);
router.delete("/:id", authMiddleware, adminOnly, deleteEvent);

module.exports = router;
