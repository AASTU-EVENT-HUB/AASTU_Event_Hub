const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/users — admin only
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    let sql = `SELECT id, name, email, student_id, department, role, is_first_login, created_at FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role && role !== "all") {
      sql += ` AND role = ?`;
      params.push(role);
    }

    sql += ` ORDER BY id DESC`;
    const [users] = await db.execute(sql, params);

    // Attach registration counts
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [rows] = await db.execute(
          `SELECT COUNT(*) as cnt FROM registrations WHERE student_id = ?`,
          [u.id]
        );
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          studentId: u.student_id,
          department: u.department,
          role: u.role,
          isFirstLogin: Boolean(u.is_first_login),
          eventsAttended: rows[0]?.cnt || 0,
          status: "active", // extend schema later for suspension
          joinedAt: u.created_at || "—",
          avatar: `https://i.pravatar.cc/40?u=${u.id}`,
        };
      })
    );

    res.json({ success: true, users: enriched });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/role — admin only
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    await db.execute(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id — admin only
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute(`DELETE FROM registrations WHERE student_id = ?`, [id]);
    await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
