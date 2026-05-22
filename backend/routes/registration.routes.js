const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
} = require("../controllers/registration.controller");
const authMiddleware = require("../middleware/auth");

router.post("/:eventId", authMiddleware, registerForEvent);
router.get("/", authMiddleware, getMyRegistrations);

// Backwards-compatible endpoint used by older frontend code
router.post("/register", authMiddleware, (req, res, next) => {
  const { event_id } = req.body;
  if (!event_id) {
    return res
      .status(400)
      .json({ success: false, message: "event_id required" });
  }

  // adapt to controller signature by setting req.params.eventId
  req.params.eventId = String(event_id);
  return registerForEvent(req, res, next);
});

module.exports = router;
