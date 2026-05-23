const db = require("../config/db");
const { createForUser } = require("../utils/notify");

// POST /api/events — organizer creates event (status=pending), admin creates approved
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, category, department, startDate, endDate,
      location, capacity, bannerImage, isTeamEvent, tags } = req.body;

    const role = req.user.role;
    const status = role === "admin" ? "approved" : "pending";
    const organizerId = req.user.id;

    const [result] = await db.execute(
      `INSERT INTO events (title, description, category, department, start_date, end_date,
        location, capacity, banner_image, is_team_event, tags, created_by, organizer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, department, startDate, endDate,
        location, capacity || 100, bannerImage || "", isTeamEvent ? 1 : 0,
        JSON.stringify(tags || []), organizerId, organizerId, status]
    );

    // Notify admin if organizer created
    if (role === "organizer") {
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, icon)
         SELECT id, 'event_pending', 'New Event Pending Approval',
           'Organizer submitted: ' || ?, '📋'
         FROM users WHERE role = 'admin'`,
        [title]
      ).catch(() => {}); // notifications table may not exist yet — ignore
    }

    const [rows] = await db.execute("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, eventId: result.insertId, event: rows[0] });
  } catch (error) {
    next(error);
  }
};

// GET /api/events — public, only approved events (or all for admin)
exports.getEvents = async (req, res, next) => {
  try {
    const { category, department, search, page = 1, limit = 20, status } = req.query;
    const role = req.user?.role;

    let sql = `SELECT e.*, u.name AS organizer_name FROM events e
               LEFT JOIN users u ON u.id = e.organizer_id WHERE 1=1`;
    let params = [];

    // Non-admins only see approved events
    if (role !== "admin") {
      sql += ` AND e.status = 'approved'`;
    } else if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    if (category) { sql += ` AND e.category = ?`; params.push(category); }
    if (department) { sql += ` AND e.department = ?`; params.push(department); }
    if (search) { sql += ` AND e.title LIKE ?`; params.push(`%${search}%`); }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;
    sql += ` ORDER BY e.start_date ASC LIMIT ${limitNum} OFFSET ${offset}`;

    const [events] = await db.execute(sql, params);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [events] = await db.execute(
      `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email
       FROM events e LEFT JOIN users u ON u.id = e.organizer_id
       WHERE e.id = ?`, [id]
    );
    if (events.length === 0) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event: events[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id — organizer edits own event, admin edits any
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [events] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
    if (events.length === 0) return res.status(404).json({ success: false, message: "Event not found" });

    const event = events[0];
    const { role, id: userId } = req.user;

    if (role === "organizer" && event.organizer_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only edit your own events" });
    }

    const { title, description, category, department, startDate, endDate,
      location, capacity, bannerImage, tags } = req.body;

    const tagData = Array.isArray(tags) ? JSON.stringify(tags)
      : JSON.stringify(tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []);

    await db.execute(
      `UPDATE events SET title=?, description=?, category=?, department=?,
        start_date=?, end_date=?, location=?, capacity=?, banner_image=?, tags=?
       WHERE id=?`,
      [title, description, category, department, startDate, endDate,
        location, capacity, bannerImage, tagData, id]
    );

    const [updated] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
    res.json({ success: true, event: updated[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id — organizer deletes own, admin deletes any
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [events] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
    if (events.length === 0) return res.status(404).json({ success: false, message: "Event not found" });

    const { role, id: userId } = req.user;
    if (role === "organizer" && events[0].organizer_id !== userId) {
      return res.status(403).json({ success: false, message: "You can only delete your own events" });
    }

    await db.execute("DELETE FROM registrations WHERE event_id = ?", [id]);
    await db.execute("DELETE FROM feedback WHERE event_id = ?", [id]).catch(() => {});
    await db.execute("DELETE FROM events WHERE id = ?", [id]);
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/events — organizer sees only their events
exports.getOrganizerEvents = async (req, res, next) => {
  try {
    const [events] = await db.execute(
      `SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/events/:id/approve
exports.approveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Event not found" });

    await db.execute(`UPDATE events SET status = 'approved', rejection_reason = NULL WHERE id = ?`, [id]);

    // Notify organizer
    if (rows[0].organizer_id) {
      createForUser(rows[0].organizer_id, {
        type: "event_approved",
        title: "Event Approved ✅",
        message: `Your event "${rows[0].title}" has been approved and is now live!`,
        icon: "🎉",
        eventRef: String(id),
      });
    }

    res.json({ success: true, message: "Event approved" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/events/:id/reject
exports.rejectEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Rejection reason required" });

    const [rows] = await db.execute("SELECT * FROM events WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Event not found" });

    await db.execute(`UPDATE events SET status = 'rejected', rejection_reason = ? WHERE id = ?`, [reason, id]);

    // Notify organizer
    if (rows[0].organizer_id) {
      createForUser(rows[0].organizer_id, {
        type: "event_rejected",
        title: "Event Not Approved ❌",
        message: `Your event "${rows[0].title}" was not approved. Reason: ${reason}`,
        icon: "❌",
        eventRef: String(id),
      });
    }

    res.json({ success: true, message: "Event rejected" });
  } catch (error) {
    next(error);
  }
};
