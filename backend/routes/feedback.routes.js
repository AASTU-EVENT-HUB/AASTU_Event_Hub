const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
  submitFeedback, getAllFeedback, hideFeedback, getStudentFeedback,
} = require("../controllers/feedback.controller");

router.post("/", auth, submitFeedback);
router.get("/mine", auth, getStudentFeedback);
router.get("/admin", auth, adminOnly, getAllFeedback);
router.patch("/admin/:id/hide", auth, adminOnly, hideFeedback);

module.exports = router;
