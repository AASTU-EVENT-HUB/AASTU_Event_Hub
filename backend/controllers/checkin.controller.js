const db = require("../config/db");

// POST /api/checkin/scan — admin only
// Body: { qrData, eventId }
exports.scanQR = async (req, res, next) => {
  try {
    const { qrData, eventId } = req.body;

    if (!qrData) {
      return res.status(400).json({ success: false, message: "qrData required" });
    }

    // QR data is a JSON string: { registrationId, studentId, eventId }
    let parsed;
    try {
      parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
    } catch {
      return res.status(400).json({ success: false, message: "Invalid QR format" });
    }

    const regId = parsed.registrationId;
    const studentId = parsed.studentId;
    const qrEventId = parsed.eventId || eventId;

    // Look up the registration
    const [rows] = await db.execute(
      `SELECT r.id, r.status, r.student_id, u.name AS studentName
       FROM registrations r
       JOIN users u ON u.id = r.student_id
       WHERE r.id = ? AND r.event_id = ?`,
      [regId, qrEventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const reg = rows[0];

    if (reg.status === "checked_in") {
      return res.status(409).json({ success: false, message: "Already checked in" });
    }

    await db.execute(
      `UPDATE registrations SET status = 'checked_in' WHERE id = ?`,
      [reg.id]
    );

    res.json({ success: true, studentName: reg.studentName, registrationId: reg.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/checkin/:eventId/stats — admin only
exports.getCheckinStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const [eventRows] = await db.execute(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const [allRegs] = await db.execute(
      `SELECT r.id, r.status, r.registered_at, u.name, u.department, u.email
       FROM registrations r
       JOIN users u ON u.id = r.student_id
       WHERE r.event_id = ?
       ORDER BY r.registered_at ASC`,
      [eventId]
    );

    const totalRegistered = allRegs.length;
    const checkedIn = allRegs.filter((r) => r.status === "checked_in").length;

    const attendees = allRegs.map((r) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      status: r.status === "checked_in" ? "checked-in" : "not-yet",
      checkinTime: r.status === "checked_in" ? r.registered_at : null,
      avatar: `https://i.pravatar.cc/40?u=${r.id}`,
    }));

    // Build hourly timeline (group by hour of registered_at for checked-in)
    const hourMap = {};
    allRegs
      .filter((r) => r.status === "checked_in")
      .forEach((r) => {
        const d = new Date(r.registered_at);
        const hour = `${d.getHours()}:00`;
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      });
    const timeline = Object.entries(hourMap).map(([hour, count]) => ({ hour, count }));

    res.json({
      success: true,
      stats: {
        totalRegistered,
        checkedIn,
        attendees,
        timeline,
      },
    });
  } catch (err) {
    next(err);
  }
};
