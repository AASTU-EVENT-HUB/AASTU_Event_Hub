import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import EventCard from '../../components/EventCard';
import WaitlistBadge from '../../components/WaitlistBadge';
import QRCodeCard from '../../components/QRCodeCard';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, MOCK_RECOMMENDATIONS, getEventStatus } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Overview', 'My Events', 'Waitlisted', 'Profile'];

export default function StudentDashboard({ defaultTab = 'Overview' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [thumbFeedback, setThumbFeedback] = useState({});
  const [showQR, setShowQR] = useState(null);

  const registeredEvents = MOCK_REGISTRATIONS
    .filter(r => r.status === 'registered' || r.status === 'attended')
    .map(r => ({ ...r, event: MOCK_EVENTS.find(e => e.id === r.eventId) }))
    .filter(r => r.event);

  const waitlistedEvents = MOCK_REGISTRATIONS
    .filter(r => r.status === 'waitlist')
    .map(r => ({ ...r, event: MOCK_EVENTS.find(e => e.id === r.eventId) }))
    .filter(r => r.event);

  const upcomingRegistered = registeredEvents
    .filter(r => ['upcoming', 'soon', 'live'].includes(getEventStatus(r.event)))
    .slice(0, 3);

  const activeTicket = registeredEvents[0];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />

        <div style={{ padding: '28px 28px', flex: 1 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Event Credits', value: user?.eventCredits?.toLocaleString() || '1,240', sub: '+12% this semester', icon: '⚙', color: '#3B6FFF' },
              { label: 'Attended Events', value: '24', sub: '4 pending verification', icon: '📅', color: '#22C55E' },
              { label: 'Waitlist Rank', value: '#3', sub: 'Next: AI Workshop', icon: '⏳', color: '#F5A623', subColor: '#F5A623' },
              { label: 'Current GPA', value: user?.gpa || '3.85', sub: 'Academic Status: Elite', icon: '🎓', color: '#94A3B8' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</span>
                  <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: stat.subColor || '#64748B' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            {/* Main column */}
            <div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1E2A45', marginBottom: 24 }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      // Update URL to match tab
                      if (tab === 'Overview') navigate('/dashboard', { replace: true });
                      else if (tab === 'My Events') navigate('/dashboard/tickets', { replace: true });
                      else if (tab === 'Waitlisted') navigate('/dashboard/tickets', { replace: true });
                      else if (tab === 'Profile') navigate('/dashboard/settings', { replace: true });
                    }}
                    style={{
                      padding: '10px 18px',
                      background: 'none', border: 'none',
                      borderBottom: `2px solid ${activeTab === tab ? '#3B6FFF' : 'transparent'}`,
                      color: activeTab === tab ? '#fff' : '#64748B',
                      fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                      cursor: 'pointer', marginBottom: -1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div className="fade-in">
                  {/* Upcoming registered */}
                  {upcomingRegistered.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Your Upcoming Events</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {upcomingRegistered.map(r => (
                          <div key={r.eventId} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img src={r.event.banner} alt={r.event.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{r.event.title}</div>
                              <div style={{ fontSize: 12, color: '#64748B' }}>
                                📅 {new Date(r.event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · 📍 {r.event.location}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <span className="badge badge-green" style={{ fontSize: 10 }}>CONFIRMED</span>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowQR(r)}
                                style={{ fontSize: 11, padding: '4px 10px' }}
                              >
                                QR
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Recommended for You</h3>
                        <p style={{ fontSize: 12, color: '#64748B' }}>Based on your major and past attendance</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748B' }}>✦ Powered by AI</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid #1E2A45', color: '#94A3B8', cursor: 'pointer', fontSize: 12 }}>‹</button>
                          <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid #1E2A45', color: '#94A3B8', cursor: 'pointer', fontSize: 12 }}>›</button>
                        </div>
                      </div>
                    </div>

                    {MOCK_RECOMMENDATIONS.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {MOCK_RECOMMENDATIONS.map((rec, i) => (
                          <div key={rec.event.id}>
                            <EventCard
                              event={rec.event}
                              glowBorder
                              showReason
                              reason={rec.reason}
                              compact
                            />
                            {/* Thumbs feedback */}
                            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setThumbFeedback(f => ({ ...f, [i]: 'up' }))}
                                style={{
                                  background: thumbFeedback[i] === 'up' ? 'rgba(34,197,94,0.2)' : 'none',
                                  border: `1px solid ${thumbFeedback[i] === 'up' ? '#22C55E' : '#1E2A45'}`,
                                  borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                                  fontSize: 12, color: thumbFeedback[i] === 'up' ? '#22C55E' : '#64748B',
                                }}
                              >👍</button>
                              <button
                                onClick={() => setThumbFeedback(f => ({ ...f, [i]: 'down' }))}
                                style={{
                                  background: thumbFeedback[i] === 'down' ? 'rgba(239,68,68,0.2)' : 'none',
                                  border: `1px solid ${thumbFeedback[i] === 'down' ? '#EF4444' : '#1E2A45'}`,
                                  borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                                  fontSize: 12, color: thumbFeedback[i] === 'down' ? '#EF4444' : '#64748B',
                                }}
                              >👎</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        {/* Geometric empty state */}
                        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
                          <div style={{ position: 'absolute', inset: 0, border: '2px solid #1E2A45', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: 16, border: '2px solid #2A3A55', transform: 'rotate(45deg)' }} />
                          <div style={{ position: 'absolute', inset: 28, background: '#1E2A45', borderRadius: '50%' }} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>We're learning your preferences</h4>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                          Attend your first event and we'll start recommending ones you'll love
                        </p>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/events')}>
                          Browse All Events
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upcoming events table */}
                  <div style={{ marginTop: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Upcoming Events</h3>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>
                        View Full Calendar →
                      </button>
                    </div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Event Name</th>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_EVENTS.filter(e => getEventStatus(e) !== 'ended').slice(0, 5).map(event => (
                            <tr key={event.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{
                                    width: 28, height: 28, borderRadius: 6,
                                    background: '#1E2A45',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12,
                                  }}>
                                    {event.category === 'Hackathons' ? '⚡' : event.category === 'Workshops' ? '🔧' : '📅'}
                                  </div>
                                  <span style={{ color: '#fff', fontWeight: 500 }}>{event.title}</span>
                                </div>
                              </td>
                              <td>
                                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                                {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td>
                                <span className={`badge ${event.isHackathon ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                                  {event.isHackathon ? 'HACKATHON' : event.category.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${registeredEvents.find(r => r.eventId === event.id) ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                                  {registeredEvents.find(r => r.eventId === event.id) ? 'CONFIRMED' : 'INTERESTED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* MY EVENTS TAB */}
              {activeTab === 'My Events' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                    My Registered Events ({registeredEvents.length})
                  </h3>
                  {registeredEvents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {registeredEvents.map(r => (
                        <div key={r.eventId}>
                          <EventCard event={r.event} />
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ flex: 1, fontSize: 12 }}
                              onClick={() => setShowQR(r)}
                            >
                              View QR
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🎟</div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No events yet</h4>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Register for events to see them here</p>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/events')}>Browse Events</button>
                    </div>
                  )}
                </div>
              )}

              {/* WAITLISTED TAB */}
              {activeTab === 'Waitlisted' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                    Waitlisted Events ({waitlistedEvents.length})
                  </h3>
                  {waitlistedEvents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {waitlistedEvents.map(r => (
                        <div key={r.eventId} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <img src={r.event.banner} alt={r.event.title} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{r.event.title}</div>
                            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>
                              📅 {new Date(r.event.startDate).toLocaleDateString()} · 📍 {r.event.location}
                            </div>
                            <WaitlistBadge position={r.position || 3} />
                          </div>
                          <button
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer' }}
                          >
                            Leave Waitlist
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No waitlisted events</h4>
                      <p style={{ fontSize: 13, color: '#64748B' }}>You're not on any waitlists</p>
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'Profile' && (
                <div className="fade-in">
                  <ProfileSettings user={user} />
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              {/* Active Ticket */}
              {activeTicket && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Active Ticket
                    </span>
                    <span style={{ fontSize: 16, color: '#64748B' }}>⊞</span>
                  </div>
                  <QRCodeCard
                    value={activeTicket.qrCode || 'QR-DEMO'}
                    eventName={activeTicket.event?.title}
                    eventLocation={activeTicket.event?.location}
                  />
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                      VALID TODAY
                    </span>
                    <span>Gate opens: 1:30 PM</span>
                  </div>
                </div>
              )}

              {/* Waitlist Status */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Waitlist Status</span>
                  <span style={{ fontSize: 16 }}>⏳</span>
                </div>
                {[
                  { name: 'AI Ethics Workshop', chance: 92, rank: 2, total: 45, est: '24h', color: '#3B6FFF' },
                  { name: 'Quantum Computing Lab', chance: 15, rank: 115, total: 200, est: 'High Demand', color: '#EF4444' },
                ].map(item => (
                  <div key={item.name} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.chance}% Chance</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 4 }}>
                      <div className="progress-fill" style={{ width: `${item.chance}%`, background: item.color }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      Rank #{item.rank} of {item.total} | Est. Wait: {item.est}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title">Your Ticket</h3>
              <button className="modal-close" onClick={() => setShowQR(null)}>×</button>
            </div>
            <QRCodeCard
              value={showQR.qrCode || 'QR-DEMO'}
              eventName={showQR.event?.title}
              eventDate={new Date(showQR.event?.startDate).toLocaleDateString()}
              eventLocation={showQR.event?.location}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSettings({ user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    bio: user?.bio || '',
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Profile Settings</h2>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>Manage your public information and university credentials.</p>

      {/* Avatar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 22, height: 22, borderRadius: '50%',
            background: '#3B6FFF', border: '2px solid #111827',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', cursor: 'pointer',
          }}>✏</div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Profile Picture</div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>JPG, GIF or PNG. Max size of 800K.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm">Upload New</button>
            <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444' }}>Remove</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input className="form-input" value={form.studentId} readOnly style={{ opacity: 0.6 }} />
            <span className="form-hint" style={{ color: '#F5A623' }}>Contact Admin to change ID</span>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Department</label>
          <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option>Computer Science & AI</option>
            <option>Software Engineering</option>
            <option>Electrical Engineering</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            className="form-input"
            rows={4}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
        <button className="btn btn-outline btn-sm">Cancel</button>
        <button className="btn btn-primary btn-sm">Save Changes</button>
      </div>

      {/* Danger zone */}
      <div style={{
        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 20 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Danger Zone</div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>
            Deleting your account is permanent. All your event history, earned badges, and ticket records will be wiped.
          </div>
        </div>
        <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', flexShrink: 0 }}>
          Delete My Account
        </button>
      </div>
    </div>
  );
}
