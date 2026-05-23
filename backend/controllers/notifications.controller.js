const db = require("../config/db");

// GET /api/notifications — returns notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ success: true, notifications: [] });

    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const notifications = rows.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      icon: n.icon || "🔔",
      event: n.event_ref,
      read: Boolean(n.is_read),
      time: formatTime(n.created_at),
    }));

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("getNotifications error:", err.message);
    res.json({ success: true, notifications: [] });
  }
};

// POST /api/notifications — organizer/admin sends a notification to users
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, icon, event: eventRef, targetUserId } = req.body;
    const { createForUser } = require("../utils/notify");

    if (targetUserId) {
      await createForUser(targetUserId, { type, title, message, icon, eventRef });
    } else if (eventRef) {
      // Send to all students registered for this event
      const [regs] = await db.execute(
        "SELECT DISTINCT student_id FROM registrations WHERE event_id = ?", [eventRef]
      );
      for (const reg of regs) {
        await createForUser(reg.student_id, { type, title, message, icon, eventRef });
      }
    } else {
      // Broadcast to all students
      const [students] = await db.execute("SELECT id FROM users WHERE role = 'student'");
      for (const s of students) {
        await createForUser(s.id, { type, title, message, icon, eventRef });
      }
    }

    res.status(201).json({ success: true, message: "Notification sent" });
  } catch (err) {
    console.error("createNotification error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    await db.execute(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [id, userId]
    );
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
};

// DELETE /api/notifications/:id
exports.clearNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    await db.execute(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?", [id, userId]
    );
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
};

function formatTime(dateStr) {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
