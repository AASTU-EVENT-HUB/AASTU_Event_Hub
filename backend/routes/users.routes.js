const express = require("express");
const router = express.Router();
const { getUsers, updateRole, deleteUser } = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const db = require("../config/db");

router.get("/", auth, adminOnly, getUsers);
router.put("/:id/role", auth, adminOnly, updateRole);
router.delete("/:id", auth, adminOnly, deleteUser);

// Suspend / unsuspend
router.patch("/:id/suspend", auth, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    await db.execute("UPDATE users SET is_suspended = ? WHERE id = ?", [suspended ? 1 : 0, id]);
    res.json({ success: true, message: suspended ? "User suspended" : "User unsuspended" });
  } catch (err) { next(err); }
});

// PATCH /api/users/me/avatar — update own avatar URL
router.patch("/me/avatar", auth, async (req, res, next) => {
  try {
    const { avatar } = req.body;
    await db.execute("UPDATE users SET avatar = ? WHERE id = ?", [avatar || null, req.user.id]);
    res.json({ success: true, avatar: avatar || null });
  } catch (err) { next(err); }
});

// PATCH /api/users/me — update own profile (name, department)
router.patch("/me", auth, async (req, res, next) => {
  try {
    const { name, department } = req.body;
    await db.execute(
      "UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department) WHERE id = ?",
      [name || null, department || null, req.user.id]
    );
    const [rows] = await db.execute("SELECT id, name, email, department, role, avatar FROM users WHERE id = ?", [req.user.id]);
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
