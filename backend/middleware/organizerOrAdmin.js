module.exports = (req, res, next) => {
  if (!req.user || !["organizer", "admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Organizer or Admin access required" });
  }
  next();
};
