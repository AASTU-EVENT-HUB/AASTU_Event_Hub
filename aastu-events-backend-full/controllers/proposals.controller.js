let proposals = [
  {
    id: "p1",
    title: "AI & Machine Learning Bootcamp",
    category: "Workshops",
    organizer: "Dr. Abebe Bekele",
    dept: "Computer Science",
    venue: "Lab Building, Room 302",
    date: "Nov 20, 2024",
    time: "9:00 AM",
    expectedAttendance: 80,
    status: "under_review",
    description:
      "A 3-day intensive bootcamp covering supervised learning, neural networks, and deployment.",
    safetyNotes: "Standard classroom setup. No special safety requirements.",
    submittedAt: "May 12, 10:45 AM",
    banner:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
    tags: ["AI", "ML", "Workshop"],
  },
  {
    id: "p2",
    title: "Grand Innovation Expo 2024",
    category: "Tech",
    organizer: "Informatics Society",
    dept: "Software Engineering",
    venue: "Main Exhibition Hall",
    date: "Dec 5, 2024",
    time: "10:00 AM",
    expectedAttendance: 500,
    status: "submitted",
    description:
      "Annual showcase of student innovation projects across all engineering departments.",
    safetyNotes:
      "Large crowd expected. Security and crowd management plan attached.",
    submittedAt: "May 12, 09:12 AM",
    banner:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    tags: ["Exhibition", "Innovation", "Public"],
  },
];

exports.getProposals = async (req, res) => {
  res.json({ success: true, proposals });
};

exports.createProposal = async (req, res) => {
  const p = { id: `p${Date.now()}`, status: "submitted", ...req.body };
  proposals.unshift(p);
  res.status(201).json({ success: true, proposal: p });
};

exports.updateProposal = async (req, res) => {
  const id = req.params.id;
  const { status, ...extra } = req.body;
  proposals = proposals.map((p) =>
    p.id === id ? { ...p, status: status || p.status, ...extra } : p,
  );
  const updated = proposals.find((p) => p.id === id);
  res.json({ success: true, proposal: updated });
};

exports.deleteProposal = async (req, res) => {
  const id = req.params.id;
  proposals = proposals.filter((p) => p.id !== id);
  res.json({ success: true });
};
