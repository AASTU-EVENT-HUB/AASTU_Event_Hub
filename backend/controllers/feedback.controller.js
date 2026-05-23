const db = require("../config/db");

// POST /api/feedback — student submits feedback (must be checked in)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, review } = req.body;
    const userId = req.user.id;

    if (!eventId || !rating) return res.status(400).json({ success: false, message: "eventId and rating required" });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be 1–5" });

    // Must be checked in
    const [reg] = await db.execute(
      "SELECT status FROM registrations WHERE student_id = ? AND event_id = ?", [userId, eventId]
    );
    if (reg.length === 0) return res.status(403).json({ success: false, message: "You are not registered for this event" });
    if (reg[0].status !== "checked_in") return res.status(403).json({ success: false, message: "You must attend the event before leaving feedback" });

    // One feedback per student per event
    const [existing] = await db.execute(
      "SELECT id FROM feedback WHERE event_id = ? AND user_id = ?", [eventId, userId]
    );
    if (existing.length > 0) return res.status(409).json({ success: false, message: "You already submitted feedback for this event" });

    const [result] = await db.execute(
      `INSERT INTO feedback (event_id, user_id, rating, review) VALUES (?, ?, ?, ?)`,
      [eventId, userId, rating, review || ""]
    );

    res.status(201).json({ success: true, feedbackId: result.insertId });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/feedback — feedback for organizer's events
exports.getOrganizerFeedback = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const [rows] = await db.execute(
      `SELECT f.*, e.title AS event_title, u.name AS reviewer_name
       FROM feedback f
       JOIN events e ON e.id = f.event_id
       JOIN users u ON u.id = f.user_id
       WHERE e.organizer_id = ? AND f.is_visible = 1
       ORDER BY f.created_at DESC`,
      [organizerId]
    );

    // Group by event with avg rating
    const eventMap = {};
    rows.forEach(f => {
      if (!eventMap[f.event_id]) {
        eventMap[f.event_id] = { eventId: f.event_id, eventTitle: f.event_title, reviews: [], avgRating: 0 };
      }
      eventMap[f.event_id].reviews.push({
        id: f.id, rating: f.rating, review: f.review,
        reviewerName: f.reviewer_name, createdAt: f.created_at,
      });
    });

    Object.values(eventMap).forEach(e => {
      e.avgRating = e.reviews.length
        ? (e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length).toFixed(1)
        : 0;
    });

    res.json({ success: true, feedback: Object.values(eventMap) });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/feedback — all feedback
exports.getAllFeedback = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.*, e.title AS event_title, u.name AS reviewer_name
       FROM feedback f
       JOIN events e ON e.id = f.event_id
       JOIN users u ON u.id = f.user_id
       ORDER BY f.created_at DESC`
    );
    res.json({ success: true, feedback: rows });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/feedback/:id/hide
exports.hideFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute("UPDATE feedback SET is_visible = 0 WHERE id = ?", [id]);
    res.json({ success: true, message: "Feedback hidden" });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/feedback — student's own feedback + eligible events
exports.getStudentFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Events student attended (checked in) + whether they left feedback
    const [rows] = await db.execute(
      `SELECT e.id AS eventId, e.title, e.end_date, e.banner_image,
         f.id AS feedbackId, f.rating, f.review
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       LEFT JOIN feedback f ON f.event_id = e.id AND f.user_id = ?
       WHERE r.student_id = ? AND r.status = 'checked_in'
       ORDER BY e.end_date DESC`,
      [userId, userId]
    );
    res.json({ success: true, events: rows });
  } catch (error) {
    next(error);
  }
};
