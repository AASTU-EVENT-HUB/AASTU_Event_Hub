import { useState } from 'react';

const FAQ_CATEGORIES = [
  {
    id: 'registration', icon: '🎟', label: 'Registration Issues',
    faqs: [
      { q: 'How do I register for an event?', a: 'Go to any event page and click "Register Now". You\'ll need to be logged in. After confirming, you\'ll receive a QR code ticket.' },
      { q: 'Can I cancel my registration?', a: 'Yes. Go to Dashboard → My Events, find the event, and click "Cancel Registration". Cancellations are allowed up to 24 hours before the event.' },
      { q: 'What if the event is full?', a: 'You can join the waitlist. If a spot opens, you\'ll be notified automatically and have 24 hours to claim it.' },
      { q: 'How do I register as a team?', a: 'On hackathon event pages, click "Register as Team". You can create a new team or join one with a team code.' },
    ],
  },
  {
    id: 'qr', icon: '📱', label: 'QR Check-in Help',
    faqs: [
      { q: 'Where do I find my QR code?', a: 'After registering, your QR code appears on the confirmation screen. You can also find it in Dashboard → My Events → View QR.' },
      { q: 'My QR code isn\'t scanning. What do I do?', a: 'Increase your screen brightness, ensure the QR is fully visible, or ask the organizer to enter your ticket ID manually.' },
      { q: 'Can I download my QR code?', a: 'Yes. On the QR card, click "Download QR" to save it as an image to your device.' },
    ],
  },
  {
    id: 'team', icon: '👥', label: 'Team Submission',
    faqs: [
      { q: 'How do I create a team?', a: 'On a hackathon event page, click "Register as Team" → "Create a Team". Set your team name and size, then share the team code with members.' },
      { q: 'How do I join an existing team?', a: 'Click "Register as Team" → "Join a Team" and enter the team code provided by your team leader.' },
      { q: 'What is the minimum team size?', a: 'Most hackathons require a minimum of 2 members. The maximum is typically 6. Check the specific event for details.' },
    ],
  },
  {
    id: 'approval', icon: '✅', label: 'Event Approval',
    faqs: [
      { q: 'How do I submit an event proposal?', a: 'Go to Dashboard → Create Event. Fill in all required details and submit. Your event will go through admin review before being published.' },
      { q: 'How long does approval take?', a: 'Typically 1–3 business days. You\'ll receive a notification when your event is approved, rejected, or if changes are requested.' },
      { q: 'My event was rejected. Can I resubmit?', a: 'Yes. Review the rejection reason provided by the admin, make the necessary changes, and resubmit your proposal.' },
    ],
  },
  {
    id: 'notifications', icon: '🔔', label: 'Notifications',
    faqs: [
      { q: 'How do I manage notification preferences?', a: 'Go to Dashboard → Settings → Notifications to customize which notifications you receive and how.' },
      { q: 'Why am I not receiving email notifications?', a: 'Check your spam folder. Ensure your university email is verified in your profile settings.' },
    ],
  },
  {
    id: 'analytics', icon: '📊', label: 'Analytics',
    faqs: [
      { q: 'Who can access analytics?', a: 'Full platform analytics are available to admins only. Organizers can see analytics for their own events.' },
      { q: 'How do I export a report?', a: 'In the Analytics page, click "Export Health Report" or "Generate Weekly Report" to download PDF or CSV formats.' },
    ],
  },
  {
    id: 'account', icon: '👤', label: 'Account Settings',
    faqs: [
      { q: 'How do I change my password?', a: 'Go to Dashboard → Settings → Security → Change Password.' },
      { q: 'How do I update my department?', a: 'Go to Dashboard → Settings → Profile. Note: Student ID changes require admin approval.' },
      { q: 'How do I delete my account?', a: 'Go to Dashboard → Settings → Profile → Danger Zone → Delete My Account. This action is permanent.' },
    ],
  },
];

const QUICK_GUIDES = [
  { icon: '🚀', title: 'Getting Started', desc: 'Create your account, complete onboarding, and register for your first event in under 5 minutes.' },
  { icon: '🎯', title: 'Finding Events', desc: 'Use filters on the Events page to find events by category, department, or date range.' },
  { icon: '📲', title: 'Using Your Ticket', desc: 'Show your QR code at the event entrance. The organizer will scan it to check you in.' },
  { icon: '⚡', title: 'Hackathon Guide', desc: 'Form a team, register together, and submit your project before the deadline.' },
];

export default function HelpCenter({ onClose }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [openFaq, setOpenFaq] = useState({});
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', category: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'contact' | 'guides'

  const filteredCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f =>
      !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => !search || cat.faqs.length > 0);

  const handleSubmitSupport = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90vw', maxWidth: 720, maxHeight: '85vh',
        background: '#111827', border: '1px solid #1E2A45',
        borderRadius: 20, zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1E2A45',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Help Center</h2>
            <p style={{ fontSize: 12, color: '#64748B' }}>Find answers, guides, and contact support</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 22, cursor: 'pointer', padding: 4 }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 40, borderRadius: 12 }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', flexShrink: 0 }}>
          {[
            { id: 'faq', label: 'FAQs' },
            { id: 'guides', label: 'Quick Guides' },
            { id: 'contact', label: 'Contact Support' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 16px', borderRadius: 8,
                background: activeTab === tab.id ? '#3B6FFF' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? '#3B6FFF' : '#1E2A45'}`,
                color: activeTab === tab.id ? '#fff' : '#94A3B8',
                fontSize: 13, cursor: 'pointer', fontWeight: activeTab === tab.id ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div style={{ display: 'grid', gridTemplateColumns: search ? '1fr' : '200px 1fr', gap: 16 }}>
              {/* Category list */}
              {!search && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                      background: !activeCategory ? 'rgba(59,111,255,0.2)' : 'transparent',
                      border: `1px solid ${!activeCategory ? 'rgba(59,111,255,0.3)' : 'transparent'}`,
                      color: !activeCategory ? '#fff' : '#94A3B8',
                      fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    All Topics
                  </button>
                  {FAQ_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: activeCategory === cat.id ? 'rgba(59,111,255,0.2)' : 'transparent',
                        border: `1px solid ${activeCategory === cat.id ? 'rgba(59,111,255,0.3)' : 'transparent'}`,
                        color: activeCategory === cat.id ? '#fff' : '#94A3B8',
                        fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* FAQ list */}
              <div>
                {(search ? filteredCategories : FAQ_CATEGORIES.filter(c => !activeCategory || c.id === activeCategory)).map(cat => (
                  <div key={cat.id} style={{ marginBottom: 20 }}>
                    {(!activeCategory || search) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span>{cat.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{cat.label}</span>
                      </div>
                    )}
                    {cat.faqs.map((faq, i) => (
                      <div key={i} style={{
                        background: '#0D1224', border: '1px solid #1E2A45',
                        borderRadius: 10, marginBottom: 6, overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => setOpenFaq(s => ({ ...s, [`${cat.id}-${i}`]: !s[`${cat.id}-${i}`] }))}
                          style={{
                            width: '100%', padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'none', border: 'none', color: '#fff',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', gap: 8,
                          }}
                        >
                          <span>{faq.q}</span>
                          <span style={{ color: '#64748B', fontSize: 16, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq[`${cat.id}-${i}`] ? 'rotate(180deg)' : 'none' }}>∨</span>
                        </button>
                        {openFaq[`${cat.id}-${i}`] && (
                          <div style={{ padding: '0 16px 12px', fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GUIDES TAB */}
          {activeTab === 'guides' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                {QUICK_GUIDES.map(guide => (
                  <div key={guide.title} style={{
                    background: '#0D1224', border: '1px solid #1E2A45',
                    borderRadius: 12, padding: '16px 18px',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3B6FFF'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2A45'}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{guide.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{guide.title}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{guide.desc}</div>
                  </div>
                ))}
              </div>

              {/* Troubleshooting cards */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Troubleshooting</h3>
              {[
                { issue: 'Can\'t log in', steps: ['Check your university email is correct', 'Use "Forgot Password" to reset', 'Contact support if issue persists'] },
                { issue: 'QR code not working', steps: ['Increase screen brightness', 'Ensure QR is fully visible', 'Ask organizer to enter ticket ID manually'] },
                { issue: 'Registration failed', steps: ['Check if event is still open', 'Verify your student ID is correct', 'Try refreshing the page'] },
              ].map(item => (
                <div key={item.issue} style={{
                  background: '#0D1224', border: '1px solid #1E2A45',
                  borderRadius: 10, padding: '14px 16px', marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5A623', marginBottom: 8 }}>⚠ {item.issue}</div>
                  <ol style={{ paddingLeft: 16, margin: 0 }}>
                    {item.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: 480 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Message Sent!</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
                    We'll get back to you at your university email within 24 hours.
                  </p>
                  <button className="btn btn-outline btn-sm" onClick={() => setSubmitted(false)}>Send Another</button>
                </div>
              ) : (
                <>
                  <div style={{
                    background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>📧</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Direct Email Support</div>
                      <a href="mailto:azyirga@gmail.com" style={{ fontSize: 12, color: '#3B6FFF', textDecoration: 'none' }}>azyirga@gmail.com</a>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitSupport}>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Issue Category</label>
                      <select
                        className="form-select"
                        value={supportForm.category}
                        onChange={e => setSupportForm(f => ({ ...f, category: e.target.value }))}
                        required
                      >
                        <option value="">Select a category...</option>
                        {FAQ_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Subject</label>
                      <input
                        className="form-input"
                        placeholder="Brief description of your issue"
                        value={supportForm.subject}
                        onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Describe your issue in detail..."
                        value={supportForm.message}
                        onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                        style={{ resize: 'vertical' }}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ borderRadius: 10 }}>
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
