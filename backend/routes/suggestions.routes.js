const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
  createSuggestion, getSuggestions, toggleUpvote, deleteSuggestion,
} = require("../controllers/suggestions.controller");

router.get("/", (req, res, next) => {
  // Attach user if token present but don't require it
  const jwt = require("jsonwebtoken");
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
}, getSuggestions);

router.post("/", auth, createSuggestion);
router.post("/:id/upvote", auth, toggleUpvote);
router.delete("/:id", auth, adminOnly, deleteSuggestion);

module.exports = router;
