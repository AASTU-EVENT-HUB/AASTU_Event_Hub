const express = require("express");
const router = express.Router();
const { getAdminAnalytics, getStudentAnalytics } = require("../controllers/analytics.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/admin", auth, adminOnly, getAdminAnalytics);
router.get("/student", auth, getStudentAnalytics);

module.exports = router;
