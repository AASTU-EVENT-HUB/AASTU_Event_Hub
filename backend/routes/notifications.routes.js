const express = require("express");
const router = express.Router();

const {
  getNotifications,
  createNotification,
  markRead,
  clearNotification,
} = require("../controllers/notifications.controller");

router.get("/", getNotifications);
router.post("/", createNotification);
router.post("/:id/read", markRead);
router.delete("/:id", clearNotification);

module.exports = router;
