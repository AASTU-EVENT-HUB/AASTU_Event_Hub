const express = require("express");
const router = express.Router();
const { getUsers, updateRole, deleteUser } = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", auth, adminOnly, getUsers);
router.put("/:id/role", auth, adminOnly, updateRole);
router.delete("/:id", auth, adminOnly, deleteUser);

// Suspend / unsuspend
router.patch("/:id/suspend", auth, adminOnly, async (req, res, next) => {
  try {
    const db = require("../config/db");
    const { id } = req.params;
    const { suspended } = req.body;
    await db.execute("UPDATE users SET is_suspended = ? WHERE id = ?", [suspended ? 1 : 0, id]);
    res.json({ success: true, message: suspended ? "User suspended" : "User unsuspended" });
  } catch (err) { next(err); }
});

module.exports = router;
