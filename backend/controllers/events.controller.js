const db = require("../config/db");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      department,
      startDate,
      endDate,
      location,
      capacity,
      bannerImage,
      isTeamEvent,
      tags,
    } = req.body;

    const [result] = await db.execute(
      `
      INSERT INTO events
      (
        title,
        description,
        category,
        department,
        start_date,
        end_date,
        location,
        capacity,
        banner_image,
        is_team_event,
        tags,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        category,
        department,
        startDate,
        endDate,
        location,
        capacity,
        bannerImage,
        isTeamEvent,
        JSON.stringify(tags || []),
        req.user.id,
      ],
    );

   const [rows] = await db.query("SELECT * FROM events");

    res.status(201).json({
      success: true,
      eventId: result.insertId,
      event: rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { category, department, search, page = 1, limit = 12 } = req.query;

    let sql = `SELECT * FROM events WHERE 1=1`;
    let params = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (department) {
      sql += ` AND department = ?`;
      params.push(department);
    }

    if (search) {
      sql += ` AND title LIKE ?`;
      params.push(`%${search}%`);
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);
    const offset = (pageNum - 1) * limitNum;

    sql += ` ORDER BY start_date ASC LIMIT ${limitNum} OFFSET ${offset}`;

    const [events] = await db.execute(sql, params);

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [events] = await db.execute("SELECT * FROM events WHERE id = ?", [
      id,
    ]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event: events[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      department,
      startDate,
      endDate,
      location,
      capacity,
      bannerImage,
      tags,
    } = req.body;

    const [events] = await db.execute("SELECT * FROM events WHERE id = ?", [
      id,
    ]);
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const tagData = Array.isArray(tags)
      ? JSON.stringify(tags)
      : JSON.stringify(
          tags
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        );

    await db.execute(
      `UPDATE events SET
        title = ?,
        description = ?,
        category = ?,
        department = ?,
        start_date = ?,
        end_date = ?,
        location = ?,
        capacity = ?,
        banner_image = ?,
        tags = ?
      WHERE id = ?`,
      [
        title,
        description,
        category,
        department,
        startDate,
        endDate,
        location,
        capacity,
        bannerImage,
        tagData,
        id,
      ],
    );

    const [updatedRows] = await db.execute(
      "SELECT * FROM events WHERE id = ?",
      [id],
    );

    res.json({
      success: true,
      event: updatedRows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute("DELETE FROM registrations WHERE event_id = ?", [id]);
    await db.execute("DELETE FROM events WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
