import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/layout/PublicNavbar';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    icon: '',
    items: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" on the homepage. Enter your AASTU email, name, student ID, and password. After signup you\'ll complete a short onboarding to set your interests.' },
      { q: 'What is the AASTU Events Hub?', a: 'AASTU Events Hub is the official platform for discovering, registering, and managing university events — hackathons, workshops, seminars, cultural events, and more.' },
      { q: 'Can I use the platform without an account?', a: 'Yes! You can browse and view all events without logging in. However, registration, waitlists, and your personal dashboard require an account.' },
      { q: 'How do I complete onboarding?', a: 'After signing up, you\'ll be redirected to the onboarding page where you select your interests. This helps us recommend relevant events for you.' },
    ],
  },
  {
    title: 'Registration & Tickets',
    icon: '',
    items: [
      { q: 'How do I register for an event?', a: 'Navigate to any event page and click "Register Now". Confirm your details and you\'ll receive a QR code ticket immediately.' },
      { q: 'Where can I find my tickets?', a: 'Go to Dashboard → My Events (or /dashboard/tickets). All your confirmed registrations are listed there with QR codes.' },
      { q: 'How do I join a waitlist?', a: 'When an event is full, click "Join Waitlist". You\'ll be notified automatically if a spot opens up.' },
      { q: 'Can I cancel my registration?', a: 'Yes. Go to Dashboard → My Events, find the event, and click "Cancel Registration". Note that cancellations may affect your event credits.' },
      { q: 'How do I download my QR ticket?', a: 'On the registration confirmation page or in your dashboard, click "Download QR" to save the ticket as a PNG image.' },
    ],
  },
  {
    title: 'Events & Schedules',
    icon: '',
    items: [
      { q: 'How do I find events by category?', a: 'Use the filter sidebar on the Events page. You can filter by category, department, and date range simultaneously.' },
      { q: 'What does "LIVE" mean on an event?', a: 'A LIVE badge means the event is currently happening right now. You can still check in if you\'re registered.' },
      { q: 'How do I propose a new event?', a: 'Go to Dashboard → Propose Event (or /propose-event). Fill in the 4-step form and submit for admin review. Approved events go live within 1–3 business days.' },
      { q: 'Can I add an event to my calendar?', a: 'Yes! After registering, click "Add to Calendar" on the confirmation page to download a .ics file compatible with Google Calendar, Outlook, and Apple Calendar.' },
    ],
  },
  {
    title: 'Account & Profile',
    icon: '',
    items: [
      { q: 'How do I update my profile?', a: 'Go to Dashboard → Settings → Profile tab. You can update your name, bio, department, and profile picture.' },
      { q: 'Can I change my student ID?', a: 'Student IDs are assigned by the university and cannot be changed through the platform. Contact your admin if there\'s an error.' },
      { q: 'How do I change my password?', a: 'Go to Dashboard → Settings → Security tab. Enter your current password and your new password.' },
      { q: 'What are Event Credits?', a: 'Event Credits are earned by attending events. They reflect your engagement with university activities and may be used for priority registration in future events.' },
    ],
  },
  {
    title: 'Technical Issues',
    icon: '🔧',
    items: [
      { q: 'My QR code isn\'t scanning. What do I do?', a: 'Try increasing your screen brightness. If the issue persists, show your ticket ID to the event staff who can manually check you in.' },
      { q: 'I didn\'t receive a confirmation email.', a: 'Check your spam folder. If it\'s not there, verify your registration in Dashboard → My Events. The QR code is always available there.' },
      { q: 'The page isn\'t loading correctly.', a: 'Try clearing your browser cache (Ctrl+Shift+R or Cmd+Shift+R). If the issue persists, try a different browser or contact support.' },
      { q: 'I\'m getting a "Permission Denied" error.', a: 'This means you\'re trying to access a page that requires a different role. Make sure you\'re logged in with the correct account.' },
    ],
  },
];

const ADMIN_SECTION = {
  title: 'Admin Guide',
  icon: '',
  items: [
    { q: 'How do I approve event proposals?', a: 'Go to Admin → Approvals. Review each proposal and click Approve, Request Changes, or Reject. Approved events go live immediately.' },
    { q: 'How do I manage check-ins?', a: 'Go to Admin → Events, find the event, and click the check-in icon. Use the QR scanner for fast check-ins or the manual list for manual verification.' },
    { q: 'How do I send notifications to attendees?', a: 'Go to Admin → Notifications. Select the event, write your message, and click Send. All registered attendees will receive the notification.' },
    { q: 'How do I export registration data?', a: 'Go to Admin → Tickets. Use the filters to narrow down the data, then click "Export CSV" to download the filtered list.' },
  ],
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: '#0D1224',
      border: '1px solid #1E2A45',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(s => !s)}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', color: '#fff',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', gap: 12,
        }}
      >
        <span>{q}</span>
        <span style={{
          color: '#64748B', fontSize: 18, flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>∨</span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [contactModal, setContactModal] = useState(false);
  const [contactMsg, setContactMsg] = useState('');

  const isAdmin = user?.role === 'admin';
  const sections = isAdmin ? [...FAQ_SECTIONS, ADMIN_SECTION] : FAQ_SECTIONS;

  const filtered = search
    ? sections.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : sections;

  const content = (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Help Center</h1>
        <p style={{ fontSize: 14, color: '#94A3B8' }}>
          Find answers to common questions about AASTU Events Hub
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 36 }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 16 }}>🔍</span>
        <input
          type="text"
          placeholder="Search for answers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 44, borderRadius: 24, fontSize: 15 }}
          autoFocus
        />
      </div>

      {/* FAQ Sections */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p>No results for "{search}"</p>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      ) : (
        filtered.map(section => (
          <div key={section.title} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{section.icon}</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{section.title}</h2>
            </div>
            {section.items.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        ))
      )}

      {/* Contact Support */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,111,255,0.1), rgba(107,70,193,0.1))',
        border: '1px solid rgba(59,111,255,0.25)',
        borderRadius: 16, padding: '28px 24px',
        textAlign: 'center', marginTop: 16,
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Still need help?
        </h3>
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
          Our support team is available Monday–Friday, 8 AM – 5 PM EAT
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:support@aastu.edu.et"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none', borderRadius: 10 }}
          >
            📧 Email Support
          </a>
          <button
            className="btn btn-outline btn-sm"
            style={{ borderRadius: 10 }}
            onClick={() => setContactModal(true)}
          >
            ✉ Send Message
          </button>
        </div>
      </div>
    </div>
  );

  // Render inside dashboard layout if logged in, otherwise public layout
  if (user) {
    return (
      <div className="app-layout">
        <Sidebar isAdmin={isAdmin} />
        <div className="main-content">
          <Topbar placeholder="Search help articles..." />
          {content}
        </div>

        {contactModal && (
          <div className="modal-overlay" onClick={() => setContactModal(false)}>
            <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Contact Support</h3>
                <button className="modal-close" onClick={() => setContactModal(false)}>×</button>
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Your Message</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setContactModal(false)}>Cancel</button>
                <a
                  href={`mailto:support@aastu.edu.et?subject=Support Request&body=${encodeURIComponent(contactMsg)}`}
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setContactModal(false)}
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      {content}
      <Footer />

      {contactModal && (
        <div className="modal-overlay" onClick={() => setContactModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Support</h3>
              <button className="modal-close" onClick={() => setContactModal(false)}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Your Message</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Describe your issue in detail..."
                value={contactMsg}
                onChange={e => setContactMsg(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setContactModal(false)}>Cancel</button>
              <a
                href={`mailto:support@aastu.edu.et?subject=Support Request&body=${encodeURIComponent(contactMsg)}`}
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
                onClick={() => setContactModal(false)}
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
