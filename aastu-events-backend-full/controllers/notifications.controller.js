let notifications = [
  {
    id: 1,
    type: "registration",
    title: "Registration Confirmed",
    message: "You're registered for AASTU Grand Hackathon 2024",
    time: "Just now",
    read: false,
    icon: "🎟",
  },
  {
    id: 2,
    type: "waitlist",
    title: "Waitlist Update",
    message: "You moved to #2 on the waitlist for Data Science Workshop",
    time: "1 hour ago",
    read: false,
    icon: "⏳",
  },
];

exports.getNotifications = async (req, res) => {
  res.json({ success: true, notifications });
};

exports.createNotification = async (req, res) => {
  const { type, title, message, icon, event, sentAt } = req.body;
  const n = {
    id: Date.now(),
    type,
    title,
    event,
    message,
    time: sentAt || "Just now",
    sentAt:
      sentAt ||
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    read: false,
    icon,
  };
  notifications.unshift(n);
  res.status(201).json({ success: true, notification: n });
};

exports.markRead = async (req, res) => {
  const id = Number(req.params.id);
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  res.json({ success: true });
};

exports.clearNotification = async (req, res) => {
  const id = Number(req.params.id);
  notifications = notifications.filter((n) => n.id !== id);
  res.json({ success: true });
};
