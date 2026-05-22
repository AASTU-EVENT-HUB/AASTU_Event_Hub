const express = require("express");
const router = express.Router();
const { scanQR, getCheckinStats } = require("../controllers/checkin.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.post("/scan", auth, adminOnly, scanQR);
router.get("/:eventId/stats", auth, adminOnly, getCheckinStats);

module.exports = router;
