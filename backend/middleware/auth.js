const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is suspended
    const [rows] = await db.execute(
      "SELECT id, role, is_suspended FROM users WHERE id = ?", [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (rows[0].is_suspended) {
      return res.status(403).json({ success: false, message: "Your account has been suspended. Contact admin." });
    }

    req.user = { ...decoded, role: rows[0].role }; // always use DB role (not stale token role)
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
