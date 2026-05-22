const express = require("express");
const router = express.Router();

const {
  getProposals,
  createProposal,
  updateProposal,
  deleteProposal,
} = require("../controllers/proposals.controller");

router.get("/", getProposals);
router.post("/", createProposal);
router.put("/:id", updateProposal);
router.delete("/:id", deleteProposal);

module.exports = router;
