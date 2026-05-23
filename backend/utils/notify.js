/**
 * Lightweight notification helper — no module-load-time DB calls.
 * Import this in controllers that need to send notifications.
 */
const db = require("../config/db");

const createForUser = async (userId, { type, title, message, icon = "🔔", eventRef = null }) => {
  try {
    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, icon, event_ref)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, icon, eventRef || null]
    );
  } catch (err) {
    // Never crash the main request because of a notification failure
    console.error("notify.createForUser failed:", err.message);
  }
};

module.exports = { createForUser };
