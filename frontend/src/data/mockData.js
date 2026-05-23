// ─────────────────────────────────────────────────────────────────────────────
// DEV_MODE — Set to false before connecting to real backend
// When false: mock users do not exist and all auth goes through the real API
// ─────────────────────────────────────────────────────────────────────────────
export const DEV_MODE = false;

export const DEV_MOCK_STUDENT = DEV_MODE ? {
  id: 'u1',
  name: 'Selam Balcha',
  email: 'selam@aastu.edu.et',
  studentId: 'AAU-2021-CS-042',
  department: 'Computer Science & AI',
  role: 'student',
  avatar: null,
  bio: 'Passionate about algorithmic efficiency and decentralized systems.',
  interests: ['Tech', 'Hackathons', 'Workshops'],
  onboardingComplete: true,
  eventCredits: 1240,
  gpa: 3.85,
} : null;

export const DEV_MOCK_ADMIN = DEV_MODE ? {
  id: 'a1',
  name: 'Mekdes A.',
  email: 'admin@aastu.edu.et',
  role: 'admin',
  avatar: null,
  department: 'Administration',
} : null;

// ─────────────────────────────────────────────────────────────────────────────
// Pending proposals store (shared between ProposeEventPage & AdminApprovalPage)
// ─────────────────────────────────────────────────────────────────────────────
export let PENDING_PROPOSALS = [];

export function addPendingProposal(proposal) {
  PENDING_PROPOSALS = [...PENDING_PROPOSALS, proposal];
}

export function removePendingProposal(id) {
  PENDING_PROPOSALS = PENDING_PROPOSALS.filter(p => p.id !== id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'AASTU Grand Hackathon 2024',
    category: 'Hackathons',
    department: 'Computer Science',
    organizer: 'AASTU ICT Department',
    description: "The AASTU Grand Hackathon is Ethiopia's premier collegiate innovation challenge. This year, we're bringing together over 500 of the brightest minds in software engineering, data science, and hardware design to solve critical challenges in sustainable urbanization and digital finance.\n\nJoin us for 48 hours of intense creation, networking with industry leaders, and competing for over 500,000 ETB in prizes. Whether you're a seasoned developer or a passionate newcomer, the Grand Hackathon offers the mentorship and resources needed to turn your wildest ideas into reality.",
    startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'AASTU Tech Hall, Addis Ababa',
    capacity: 500,
    registered: 458,
    waitlist: 23,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    tags: ['Hackathon', 'Competition', 'Tech', '48h'],
    isHackathon: true,
    isFeatured: true,
    speakers: [
      { name: 'Dr. Selamawit K.', role: 'AI Researcher, Google DeepMind', bio: 'Leading expert in ethical AI and large language models with over 15 years of experience building responsible AI systems at scale.', avatar: 'https://i.pravatar.cc/80?img=1' },
      { name: 'Elias Bekele', role: 'CTO, Fintech Solutions Ethiopia', bio: 'A pioneer in Ethiopian digital payments, architecting systems that serve millions of users daily. Former engineer at Stripe and M-Pesa.', avatar: 'https://i.pravatar.cc/80?img=3' },
      { name: 'Marta Tewodros', role: 'Founder, GreenTech Africa', bio: 'Sustainability advocate focused on leveraging IoT and renewable energy for smart city infrastructure across East Africa.', avatar: 'https://i.pravatar.cc/80?img=5' },
    ],
    schedule: [
      { date: 'Day 1 — Oct 12', time: '09:00 AM', title: 'Opening Ceremony', description: 'Welcome speech from the University President and Keynote by Dr. Selamawit K. on the future of AI in Africa.' },
      { date: 'Day 1 — Oct 12', time: '11:00 AM', title: 'Team Formation & Hacking Starts', description: 'Teams finalize their composition and begin brainstorming. Mentors available for initial guidance sessions.' },
      { date: 'Day 2 — Oct 13', time: '10:00 AM', title: 'Mid-Hackathon Check-in', description: 'Teams present a 2-minute progress update to mentors. Feedback and pivoting encouraged.' },
      { date: 'Day 2 — Oct 13', time: '02:00 PM', title: 'Mentorship Sync', description: 'One-on-one sessions with industry experts to refine prototypes and validate technical approaches.' },
      { date: 'Day 3 — Oct 14', time: '10:00 AM', title: 'Final Presentations', description: 'Each team presents their solution to a panel of judges. 5 minutes pitch + 3 minutes Q&A.' },
      { date: 'Day 3 — Oct 14', time: '05:00 PM', title: 'Grand Finale & Awards', description: 'Winners announced across all categories. Networking reception with sponsors and industry partners.' },
    ],
    prizes: [
      { place: '1st Place', amount: '250,000 ETB', description: 'Grand Prize + Incubation opportunity at AASTU Innovation Hub', icon: '🥇' },
      { place: '2nd Place', amount: '100,000 ETB', description: 'Runner-up Prize + 6-month mentorship program', icon: '🥈' },
      { place: '3rd Place', amount: '50,000 ETB', description: 'Third Place Prize + Tech equipment package', icon: '🥉' },
      { place: 'Best UI/UX', amount: '25,000 ETB', description: 'Special category for outstanding design', icon: '🎨' },
      { place: 'Best Social Impact', amount: '25,000 ETB', description: 'For solutions addressing community challenges', icon: '🌍' },
    ],
    sponsors: [
      { name: 'Ethio Telecom', tier: 'Gold', logo: null },
      { name: 'Commercial Bank of Ethiopia', tier: 'Gold', logo: null },
      { name: 'Safaricom Ethiopia', tier: 'Silver', logo: null },
      { name: 'Google for Startups', tier: 'Silver', logo: null },
    ],
    rules: [
      'Teams must consist of 2–6 currently enrolled AASTU students.',
      'All code must be written during the hackathon period. Pre-existing libraries and frameworks are allowed.',
      'Projects must be original work. Plagiarism results in immediate disqualification.',
      'Each team must submit a working prototype and a 5-minute presentation video.',
      'Judges\' decisions are final. No appeals will be considered after announcement.',
      'Participants must adhere to the AASTU Code of Conduct throughout the event.',
      'Teams may use any programming language, framework, or platform.',
      'Internet access is provided. Cloud services may be used but must be free-tier.',
    ],
    faqs: [
      { q: 'Who can participate?', a: 'All currently enrolled AASTU students are eligible. Teams of 2–6 members.' },
      { q: 'Do I need a team?', a: 'You can register solo and find teammates at the event, or form a team beforehand.' },
      { q: 'What should I bring?', a: 'Your laptop, charger, student ID, and enthusiasm. Meals and snacks are provided.' },
      { q: 'Are there prizes for all participants?', a: 'Yes! All participants receive certificates, AASTU swag, and networking opportunities.' },
    ],
    perks: ['Certificates for all participants', 'Complimentary meals included', 'Mentorship from industry experts', 'Networking with top companies'],
  },
  {
    id: 'e2',
    title: 'HackAASTU 24: 48h Coding Sprint',
    category: 'Hackathons',
    department: 'Software Engineering',
    organizer: 'SE Student Club',
    description: 'A 48-hour coding sprint focused on building real-world solutions for Ethiopian startups. Teams compete to solve real business challenges submitted by local companies.',
    startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 46 * 60 * 60 * 1000).toISOString(),
    location: 'Main Tech Hall, Block B',
    capacity: 500,
    registered: 425,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    tags: ['Hackathon', 'Coding', 'Sprint'],
    isHackathon: true,
    isFeatured: false,
    speakers: [
      { name: 'Yonas Tesfaye', role: 'Lead Engineer, Kifiya Financial', bio: 'Full-stack engineer with 10+ years building fintech products for African markets.', avatar: 'https://i.pravatar.cc/80?img=7' },
      { name: 'Hiwot Girma', role: 'Product Manager, Gebeya Inc.', bio: 'Product leader specializing in developer tools and marketplace platforms across Africa.', avatar: 'https://i.pravatar.cc/80?img=9' },
    ],
    schedule: [
      { date: 'Day 1', time: '08:00 AM', title: 'Kickoff & Problem Statements', description: 'Companies present their challenges. Teams form and select their problem.' },
      { date: 'Day 1', time: '10:00 AM', title: 'Hacking Begins', description: '48 hours of building starts now.' },
      { date: 'Day 2', time: '02:00 PM', title: 'Mentor Office Hours', description: 'Book 15-minute slots with industry mentors.' },
      { date: 'Day 3', time: '10:00 AM', title: 'Final Submissions & Demo Day', description: 'Submit your project and demo to judges.' },
    ],
    prizes: [
      { place: '1st Place', amount: '50,000 ETB', description: 'Grand Prize', icon: '🥇' },
      { place: '2nd Place', amount: '20,000 ETB', description: 'Runner-up', icon: '🥈' },
      { place: '3rd Place', amount: '10,000 ETB', description: 'Third Place', icon: '🥉' },
    ],
    rules: [
      'Teams of 2–4 students only.',
      'Must use one of the provided problem statements.',
      'Code must be pushed to GitHub before deadline.',
      'Demo must be live and functional.',
    ],
    faqs: [
      { q: 'Can I join solo?', a: 'Yes, solo participants are welcome and will be matched with a team if desired.' },
      { q: 'What tech stack is required?', a: 'Any stack is allowed. Use what you know best.' },
    ],
    perks: ['Meals provided', 'Certificates', 'Company internship opportunities'],
    sponsors: [
      { name: 'Kifiya Financial', tier: 'Gold', logo: null },
      { name: 'Gebeya Inc.', tier: 'Silver', logo: null },
    ],
  },
  {
    id: 'e3',
    title: 'AASTU Creative Arts Gala',
    category: 'Cultural',
    department: 'Architecture',
    organizer: 'Arts Society',
    description: 'An evening celebrating creativity, culture, and artistic expression from AASTU students.',
    startDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    location: 'University Amphitheater',
    capacity: 200,
    registered: 120,
    waitlist: 0,
    price: '50 ETB',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    tags: ['Cultural', 'Arts', 'Gala'],
    isHackathon: false,
    isFeatured: true,
    faqs: [
      { q: 'Is this open to all students?', a: 'Yes, all AASTU students and faculty are welcome.' },
      { q: 'Can I submit artwork?', a: 'Yes, contact the Arts Society at least 2 weeks before the event.' },
    ],
  },
  {
    id: 'e4',
    title: 'Architecture & Sustainability Forum',
    category: 'Seminars',
    department: 'Architecture',
    organizer: 'Architecture Dept.',
    description: 'Exploring sustainable design principles and green architecture for Ethiopian cities.',
    startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Hall 5B, Design Wing',
    capacity: 150,
    registered: 45,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    tags: ['Architecture', 'Sustainability', 'Forum'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e5',
    title: 'The Startup Mindset Workshop',
    category: 'Workshops',
    department: 'Business',
    organizer: 'Entrepreneurship Club',
    description: 'Learn the fundamentals of startup thinking, lean methodology, and pitching to investors.',
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Incubation Center',
    capacity: 80,
    registered: 74,
    waitlist: 5,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80',
    tags: ['Startup', 'Workshop', 'Business'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e6',
    title: 'Bio-Tech & Ethics Summit',
    category: 'Seminars',
    department: 'Biotechnology',
    organizer: 'Biotech Society',
    description: 'Examining the ethical dimensions of modern biotechnology and its impact on society.',
    startDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    location: 'Seminar Hall 1A',
    capacity: 300,
    registered: 135,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80',
    tags: ['Biotech', 'Ethics', 'Science'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e7',
    title: 'Drama Society: Annual Play',
    category: 'Cultural',
    department: 'Arts',
    organizer: 'Drama Society',
    description: 'The annual theatrical production showcasing AASTU student talent in performing arts.',
    startDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Main Theater',
    capacity: 400,
    registered: 312,
    waitlist: 0,
    price: '100 ETB',
    banner: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80',
    tags: ['Drama', 'Theater', 'Cultural'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e8',
    title: 'Data Science Workshop',
    category: 'Workshops',
    department: 'Computer Science',
    organizer: 'Data Science Club',
    description: 'Hands-on workshop covering Python, pandas, and machine learning fundamentals.',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    location: 'AASTU Library',
    capacity: 60,
    registered: 58,
    waitlist: 12,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    tags: ['Data Science', 'Python', 'ML'],
    isHackathon: false,
    isFeatured: true,
  },
  {
    id: 'e9',
    title: 'Robotics Expo 2024',
    category: 'Tech',
    department: 'Mechanical Engineering',
    organizer: 'Robotics Club',
    description: 'Showcase of student-built robots and automation projects from across departments.',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mechanical Wing',
    capacity: 200,
    registered: 200,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    tags: ['Robotics', 'Tech', 'Expo'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e10',
    title: 'Cybersecurity Summit',
    category: 'Tech',
    department: 'Computer Science',
    organizer: 'CyberSec Club',
    description: 'Deep dive into ethical hacking, network security, and digital forensics.',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Main Auditorium',
    capacity: 300,
    registered: 300,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    tags: ['Cybersecurity', 'Hacking', 'Tech'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e11',
    title: 'Startup Pitch Night',
    category: 'Networking',
    department: 'Business',
    organizer: 'Innovation Hub',
    description: 'Student startups pitch their ideas to a panel of investors and industry mentors.',
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Innovation Hub',
    capacity: 150,
    registered: 89,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    tags: ['Startup', 'Pitch', 'Networking'],
    isHackathon: false,
    isFeatured: false,
  },
  {
    id: 'e12',
    title: 'Industrial Automation 4.0',
    category: 'Tech',
    department: 'Mechanical Engineering',
    organizer: 'ME Department',
    description: 'Exploring Industry 4.0 technologies including IoT, AI, and smart manufacturing.',
    startDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Engineering Block, Hall B',
    capacity: 200,
    registered: 45,
    waitlist: 0,
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80',
    tags: ['Automation', 'IoT', 'Industry 4.0'],
    isHackathon: false,
    isFeatured: false,
  },
];

export const MOCK_REGISTRATIONS = [
  { eventId: 'e1', userId: 'u1', status: 'registered', qrCode: 'QR-AAU-E1-U1-2024', registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { eventId: 'e3', userId: 'u1', status: 'waitlist', position: 3, registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { eventId: 'e9', userId: 'u1', status: 'attended', qrCode: 'QR-AAU-E9-U1-2024', registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_RECOMMENDATIONS = [
  { event: MOCK_EVENTS[0], reason: 'Because you attended She Codes Bootcamp', score: 0.95 },
  { event: MOCK_EVENTS[7], reason: 'Popular in Software Engineering', score: 0.88 },
  { event: MOCK_EVENTS[4], reason: 'Trending this week in your department', score: 0.82 },
];

export const MOCK_CHECKIN_STATS = {
  eventId: 'e2',
  totalRegistered: 425,
  checkedIn: 312,
  timeline: [
    { hour: '09:00', count: 45 },
    { hour: '10:00', count: 89 },
    { hour: '11:00', count: 134 },
    { hour: '12:00', count: 178 },
    { hour: '13:00', count: 210 },
    { hour: '14:00', count: 267 },
    { hour: '15:00', count: 312 },
  ],
  attendees: [
    { id: 'a1', name: 'Henok Tadesse', department: 'CS', checkinTime: '09:12 AM', status: 'checked-in', avatar: 'https://i.pravatar.cc/40?img=10' },
    { id: 'a2', name: 'Tigist Alemu', department: 'SE', checkinTime: '09:34 AM', status: 'checked-in', avatar: 'https://i.pravatar.cc/40?img=11' },
    { id: 'a3', name: 'Dawit Bekele', department: 'EE', checkinTime: null, status: 'not-yet', avatar: 'https://i.pravatar.cc/40?img=12' },
    { id: 'a4', name: 'Sara Haile', department: 'CS', checkinTime: '10:05 AM', status: 'checked-in', avatar: 'https://i.pravatar.cc/40?img=13' },
  ],
};

export const CATEGORIES = ['Tech', 'Hackathons', 'Workshops', 'Cultural', 'Sports', 'Seminars', 'Competitions', 'Networking'];
export const DEPARTMENTS = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Architecture', 'Biotechnology', 'Business', 'Arts', 'Civil Engineering', 'Chemical Engineering'];

export function getEventStatus(event) {
  if (!event) return 'upcoming';
  // Support both DB (start_date) and mock (startDate) field names
  const startStr = event.startDate || event.start_date;
  const endStr = event.endDate || event.end_date || startStr;
  if (!startStr) return 'upcoming';
  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = start - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (now > end) return 'ended';
  if (now >= start && now <= end) return 'live';
  if (diffHours <= 24 && diffHours > 0) return 'soon';
  return 'upcoming';
}
