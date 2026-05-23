const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getNotifications,
  createNotification,
  markRead,
  clearNotification,
} = require("../controllers/notifications.controller");

// All notification routes require auth
router.get("/", auth, getNotifications);
router.post("/", auth, createNotification);
router.post("/:id/read", auth, markRead);
router.delete("/:id", auth, clearNotification);

module.exports = router;
