const db = require("../config/db");

// POST /api/organizer/apply — student submits organizer application
exports.applyOrganizer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { clubName, bio } = req.body;

    if (!clubName) return res.status(400).json({ success: false, message: "Club/organization name is required" });

    // Check if already applied
    const [existing] = await db.execute(
      "SELECT id, application_status FROM organizer_profiles WHERE user_id = ?", [userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Application already submitted",
        status: existing[0].application_status,
      });
    }

    await db.execute(
      `INSERT INTO organizer_profiles (user_id, club_name, bio, application_status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, clubName, bio || ""]
    );

    res.status(201).json({ success: true, message: "Application submitted! You'll be notified once reviewed." });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/apply/status — check own application status
exports.getApplicationStatus = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM organizer_profiles WHERE user_id = ?", [req.user.id]
    );
    if (rows.length === 0) return res.json({ success: true, status: null });
    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/organizer-applications — admin sees all pending
exports.getApplications = async (req, res, next) => {
  try {
    const { status = "pending" } = req.query;
    const [rows] = await db.execute(
      `SELECT op.*, u.name, u.email, u.department
       FROM organizer_profiles op
       JOIN users u ON u.id = op.user_id
       WHERE op.application_status = ?
       ORDER BY op.applied_at DESC`,
      [status]
    );
    res.json({ success: true, applications: rows });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/organizer-applications/:id/approve
exports.approveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM organizer_profiles WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Application not found" });

    const userId = rows[0].user_id;
    await db.execute(
      `UPDATE organizer_profiles SET application_status = 'approved', approved_at = datetime('now') WHERE id = ?`, [id]
    );
    await db.execute(`UPDATE users SET role = 'organizer' WHERE id = ?`, [userId]);

    res.json({ success: true, message: "Application approved. User is now an organizer." });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/organizer-applications/:id/reject
exports.rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Rejection reason required" });

    const [rows] = await db.execute("SELECT * FROM organizer_profiles WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Application not found" });

    await db.execute(
      `UPDATE organizer_profiles SET application_status = 'rejected', rejection_reason = ? WHERE id = ?`,
      [reason, id]
    );
    res.json({ success: true, message: "Application rejected." });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/registrations — all registrations for organizer's events
exports.getOrganizerRegistrations = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const { eventId } = req.query;

    let sql = `SELECT r.id AS registrationId, r.status, r.registered_at,
                 u.name AS studentName, u.student_id AS studentId, u.email, u.department,
                 e.id AS eventId, e.title AS eventTitle
               FROM registrations r
               JOIN users u ON u.id = r.student_id
               JOIN events e ON e.id = r.event_id
               WHERE e.organizer_id = ?`;
    const params = [organizerId];

    if (eventId) { sql += ` AND e.id = ?`; params.push(eventId); }
    sql += ` ORDER BY r.registered_at DESC`;

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, registrations: rows });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/checkin/:eventId — attendee list for organizer's event
exports.getCheckinList = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const [eventRows] = await db.execute(
      "SELECT * FROM events WHERE id = ? AND organizer_id = ?", [eventId, organizerId]
    );
    if (eventRows.length === 0) {
      return res.status(403).json({ success: false, message: "Event not found or not yours" });
    }

    const [regs] = await db.execute(
      `SELECT r.id, r.status, r.registered_at, u.name, u.student_id, u.department, u.email
       FROM registrations r JOIN users u ON u.id = r.student_id
       WHERE r.event_id = ? ORDER BY u.name ASC`,
      [eventId]
    );

    const totalRegistered = regs.length;
    const checkedIn = regs.filter(r => r.status === "checked_in").length;

    res.json({
      success: true,
      event: eventRows[0],
      stats: { totalRegistered, checkedIn },
      attendees: regs.map(r => ({
        id: r.id, name: r.name, studentId: r.student_id,
        department: r.department, email: r.email,
        status: r.status === "checked_in" ? "checked-in" : "not-yet",
      })),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/organizer/checkin/:eventId/:registrationId — manual check-in
exports.manualCheckin = async (req, res, next) => {
  try {
    const { eventId, registrationId } = req.params;
    const organizerId = req.user.id;

    const [eventRows] = await db.execute(
      "SELECT id FROM events WHERE id = ? AND organizer_id = ?", [eventId, organizerId]
    );
    if (eventRows.length === 0) return res.status(403).json({ success: false, message: "Not your event" });

    await db.execute(
      `UPDATE registrations SET status = 'checked_in' WHERE id = ? AND event_id = ?`,
      [registrationId, eventId]
    );
    res.json({ success: true, message: "Checked in" });
  } catch (error) {
    next(error);
  }
};

// POST /api/organizer/scanner/:eventId — scan QR (organizer version)
exports.scanQR = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { qrData } = req.body;
    const organizerId = req.user.id;

    const [eventRows] = await db.execute(
      "SELECT id FROM events WHERE id = ? AND organizer_id = ?", [eventId, organizerId]
    );
    if (eventRows.length === 0) return res.status(403).json({ success: false, message: "Not your event" });

    let parsed;
    try { parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData; }
    catch { return res.status(400).json({ success: false, message: "Invalid QR format" }); }

    const [rows] = await db.execute(
      `SELECT r.id, r.status, u.name AS studentName, u.student_id AS studentId
       FROM registrations r JOIN users u ON u.id = r.student_id
       WHERE r.id = ? AND r.event_id = ?`,
      [parsed.registrationId, eventId]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: "Registration not found for this event" });
    if (rows[0].status === "checked_in") return res.status(409).json({ success: false, message: "Already checked in" });

    await db.execute(`UPDATE registrations SET status = 'checked_in' WHERE id = ?`, [rows[0].id]);
    res.json({ success: true, studentName: rows[0].studentName, studentId: rows[0].studentId });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/analytics
exports.getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const [events] = await db.execute(
      "SELECT id, title, registration_count, capacity FROM events WHERE organizer_id = ?", [organizerId]
    );
    const [regCount] = await db.execute(
      `SELECT COUNT(*) as cnt FROM registrations r
       JOIN events e ON e.id = r.event_id WHERE e.organizer_id = ?`, [organizerId]
    );
    const [checkinCount] = await db.execute(
      `SELECT COUNT(*) as cnt FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE e.organizer_id = ? AND r.status = 'checked_in'`, [organizerId]
    );
    const [feedbackAvg] = await db.execute(
      `SELECT AVG(f.rating) as avg_rating FROM feedback f
       JOIN events e ON e.id = f.event_id WHERE e.organizer_id = ?`, [organizerId]
    ).catch(() => [[{ avg_rating: null }]]);

    res.json({
      success: true,
      analytics: {
        totalEvents: events.length,
        totalRegistrations: regCount[0]?.cnt || 0,
        totalCheckins: checkinCount[0]?.cnt || 0,
        avgFeedbackRating: feedbackAvg[0]?.avg_rating ? parseFloat(feedbackAvg[0].avg_rating).toFixed(1) : null,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
};
