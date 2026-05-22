const db = require("../config/db");

// GET /api/analytics/admin — admin only
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const [userCount] = await db.execute(`SELECT COUNT(*) as cnt FROM users`);
    const [eventCount] = await db.execute(`SELECT COUNT(*) as cnt FROM events`);
    const [regCount] = await db.execute(`SELECT COUNT(*) as cnt FROM registrations`);
    const [checkinCount] = await db.execute(
      `SELECT COUNT(*) as cnt FROM registrations WHERE status = 'checked_in'`
    );

    // Registrations per category
    const [catRows] = await db.execute(
      `SELECT e.category, COUNT(r.id) as count
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       GROUP BY e.category`
    );

    // Top events by registration
    const [topEvents] = await db.execute(
      `SELECT e.id, e.title, e.category, e.registration_count as registered, e.capacity
       FROM events e
       ORDER BY e.registration_count DESC
       LIMIT 5`
    );

    // Registrations per day (last 7 days)
    const [dailyRows] = await db.execute(
      `SELECT DATE(registered_at) as day, COUNT(*) as count
       FROM registrations
       GROUP BY DATE(registered_at)
       ORDER BY day DESC
       LIMIT 7`
    );

    res.json({
      success: true,
      analytics: {
        totalUsers: userCount[0]?.cnt || 0,
        totalEvents: eventCount[0]?.cnt || 0,
        totalRegistrations: regCount[0]?.cnt || 0,
        totalCheckins: checkinCount[0]?.cnt || 0,
        registrationsByCategory: catRows,
        topEvents,
        dailyRegistrations: dailyRows.reverse(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/student — auth required
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const [regs] = await db.execute(
      `SELECT r.status, r.registered_at, e.category, e.title, e.start_date, e.location, e.banner_image
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.student_id = ?
       ORDER BY r.registered_at DESC`,
      [studentId]
    );

    const totalRegistered = regs.length;
    const totalAttended = regs.filter((r) => r.status === "checked_in").length;

    // Category breakdown
    const catMap = {};
    regs.forEach((r) => {
      catMap[r.category] = (catMap[r.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Monthly activity (last 10 months)
    const monthMap = {};
    regs.forEach((r) => {
      const d = new Date(r.registered_at);
      const key = d.toLocaleString("en-US", { month: "short" });
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthlyActivity = Object.entries(monthMap).map(([month, events]) => ({ month, events }));

    res.json({
      success: true,
      analytics: {
        totalRegistered,
        totalAttended,
        categoryBreakdown,
        monthlyActivity,
        history: regs.map((r) => ({
          title: r.title,
          category: r.category,
          startDate: r.start_date,
          location: r.location,
          banner: r.banner_image,
          status: r.status,
          registeredAt: r.registered_at,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
