const db = require("../config/db");

const generateQR = require("../utils/generateQR");

exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const studentId = req.user.id;

    const [events] = await db.execute("SELECT * FROM events WHERE id = ?", [
      eventId,
    ]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const event = events[0];

    if (event.registration_count >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event full",
      });
    }

    const [existing] = await db.execute(
      `
      SELECT id FROM registrations
      WHERE student_id = ? AND event_id = ?
      `,
      [studentId, eventId],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Already registered",
      });
    }

    const [result] = await db.execute(
      `
      INSERT INTO registrations
      (student_id, event_id)
      VALUES (?, ?)
      `,
      [studentId, eventId],
    );

    const qrCode = await generateQR({
      registrationId: result.insertId,
      studentId,
      eventId,
    });

    await db.execute(
      `
      UPDATE registrations
      SET qr_code = ?
      WHERE id = ?
      `,
      [qrCode, result.insertId],
    );

    await db.execute(
      `
      UPDATE events
      SET registration_count =
      registration_count + 1
      WHERE id = ?
      `,
      [eventId],
    );

    res.status(201).json({
      success: true,
      registration: {
        id: result.insertId,
        eventId,
        studentId,
        qrCode,
        status: "confirmed",
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT
        r.id AS registrationId,
        r.status,
        r.qr_code AS qrCode,
        r.registered_at AS registeredAt,
        e.id AS eventId,
        e.title,
        e.description,
        e.category,
        e.department,
        e.start_date AS startDate,
        e.end_date AS endDate,
        e.location,
        e.capacity,
        e.banner_image AS banner,
        e.is_team_event AS isTeamEvent,
        e.tags,
        e.registration_count AS registered
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
      `,
      [studentId],
    );

    const registrations = rows.map((row) => ({
      registrationId: row.registrationId,
      status: row.status,
      qrCode: row.qrCode,
      registeredAt: row.registeredAt,
      event: {
        id: row.eventId,
        title: row.title,
        description: row.description,
        category: row.category,
        department: row.department,
        startDate: row.startDate,
        endDate: row.endDate,
        location: row.location,
        capacity: row.capacity,
        banner: row.banner,
        isTeamEvent: Boolean(row.isTeamEvent),
        tags: row.tags,
        registered: row.registered,
      },
    }));

    res.json({ success: true, registrations });
  } catch (error) {
    next(error);
  }
};
