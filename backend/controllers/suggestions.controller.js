const db = require("../config/db");

const UPVOTE_THRESHOLD = 10; // lower threshold for demo (was 50)

// POST /api/suggestions
exports.createSuggestion = async (req, res, next) => {
  try {
    const { title, description, category, preferredDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const [result] = await db.execute(
      `INSERT INTO suggestions (title, description, category, preferred_date, suggested_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || "", category || "", preferredDate || null, req.user.id]
    );
    const [rows] = await db.execute("SELECT * FROM suggestions WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, suggestion: rows[0] });
  } catch (error) {
    next(error);
  }
};

// GET /api/suggestions — public
exports.getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const [rows] = await db.execute(
      `SELECT s.*, u.name AS suggester_name,
         CASE WHEN sv.id IS NOT NULL THEN 1 ELSE 0 END AS user_has_upvoted
       FROM suggestions s
       JOIN users u ON u.id = s.suggested_by
       LEFT JOIN suggestion_upvotes sv ON sv.suggestion_id = s.id AND sv.user_id = ?
       ORDER BY s.upvote_count DESC, s.created_at DESC`,
      [userId || 0]
    );
    res.json({ success: true, suggestions: rows });
  } catch (error) {
    next(error);
  }
};

// POST /api/suggestions/:id/upvote — toggle upvote
exports.toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.execute(
      "SELECT id FROM suggestion_upvotes WHERE suggestion_id = ? AND user_id = ?", [id, userId]
    );

    if (existing.length > 0) {
      // Remove upvote
      await db.execute("DELETE FROM suggestion_upvotes WHERE suggestion_id = ? AND user_id = ?", [id, userId]);
      await db.execute("UPDATE suggestions SET upvote_count = MAX(0, upvote_count - 1) WHERE id = ?", [id]);
      return res.json({ success: true, action: "removed" });
    }

    // Add upvote
    await db.execute(
      "INSERT INTO suggestion_upvotes (suggestion_id, user_id) VALUES (?, ?)", [id, userId]
    );
    await db.execute("UPDATE suggestions SET upvote_count = upvote_count + 1 WHERE id = ?", [id]);

    // Check threshold
    const [rows] = await db.execute("SELECT upvote_count FROM suggestions WHERE id = ?", [id]);
    if (rows[0]?.upvote_count >= UPVOTE_THRESHOLD) {
      console.log(`🔔 Suggestion #${id} reached threshold (${rows[0].upvote_count} upvotes)`);
    }

    res.json({ success: true, action: "added", upvoteCount: rows[0]?.upvote_count });
  } catch (error) {
    next(error);
  }
};

// GET /api/organizer/suggestions — suggestions at or above threshold
exports.getThresholdSuggestions = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, u.name AS suggester_name
       FROM suggestions s JOIN users u ON u.id = s.suggested_by
       WHERE s.upvote_count >= ? AND s.status = 'open'
       ORDER BY s.upvote_count DESC`,
      [UPVOTE_THRESHOLD]
    );
    res.json({ success: true, suggestions: rows, threshold: UPVOTE_THRESHOLD });
  } catch (error) {
    next(error);
  }
};

// POST /api/organizer/suggestions/:id/claim
exports.claimSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;

    const [rows] = await db.execute("SELECT * FROM suggestions WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Suggestion not found" });
    if (rows[0].status !== "open") return res.status(409).json({ success: false, message: "Already claimed or converted" });

    await db.execute(
      "UPDATE suggestions SET status = 'claimed', claimed_by = ? WHERE id = ?", [organizerId, id]
    );

    // Auto-create a draft event from the suggestion
    const s = rows[0];
    const [result] = await db.execute(
      `INSERT INTO events (title, description, category, start_date, end_date, location,
         capacity, banner_image, is_team_event, tags, created_by, organizer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [s.title, s.description || "", s.category || "Workshop",
        s.preferred_date || "", s.preferred_date || "",
        "TBD", 100, "", 0, "[]", organizerId, organizerId]
    );

    res.json({
      success: true,
      message: "Suggestion claimed! A draft event has been created.",
      draftEventId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/suggestions/:id
exports.deleteSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM suggestion_upvotes WHERE suggestion_id = ?", [id]);
    await db.execute("DELETE FROM suggestions WHERE id = ?", [id]);
    res.json({ success: true, message: "Suggestion deleted" });
  } catch (error) {
    next(error);
  }
};
