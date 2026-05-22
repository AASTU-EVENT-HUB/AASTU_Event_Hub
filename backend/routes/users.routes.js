const express = require("express");
const router = express.Router();
const { getUsers, updateRole, deleteUser } = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", auth, adminOnly, getUsers);
router.put("/:id/role", auth, adminOnly, updateRole);
router.delete("/:id", auth, adminOnly, deleteUser);

module.exports = router;
