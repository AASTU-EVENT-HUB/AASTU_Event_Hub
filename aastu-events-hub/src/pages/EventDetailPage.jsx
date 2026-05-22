import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/EventCard';
import { CountdownBlocks } from '../components/CountdownTimer';
import QRCodeCard from '../components/QRCodeCard';
import WaitlistBadge from '../components/WaitlistBadge';
import StatusBadge from '../components/StatusBadge';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, getEventStatus } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  const status = getEventStatus(event);
  const fillPct = Math.round((event.registered / event.capacity) * 100);
  const isFull = event.registered >= event.capacity;

  // Load real registration status; fall back to mock
  const mockReg = user ? MOCK_REGISTRATIONS.find(r => r.eventId === id && r.userId === user.id) : null;
  const [userReg, setUserReg] = useState(mockReg);
  const [waitlistCount, setWaitlistCount] = useState(event.waitlist || 0);

  useEffect(() => {
    if (!user) return;
    // Fetch real registration status
    axios.get(`${API_BASE}/registrations/${id}/my-status`)
      .then(res => setUserReg(res.data))
      .catch(() => { /* keep mock */ });
    // Fetch waitlist count
    axios.get(`${API_BASE}/waitlist/${id}/count`)
      .then(res => setWaitlistCount(res.data?.count ?? event.waitlist ?? 0))
      .catch(() => { /* keep mock */ });
  }, [id, user]);

  const handleLeaveWaitlist = async () => {
    try {
      try { await axios.delete(`${API_BASE}/waitlist/${id}`); } catch { /* mock */ }
      setUserReg(null);
      toast.success('Removed from waitlist', 'You have left the waitlist.');
    } catch {
      toast.error('Error', 'Could not leave waitlist.');
    }
  };
  const [activeTab, setActiveTab] = useState('about');
  const [faqOpen, setFaqOpen] = useState({});
  const [scheduleOpen, setScheduleOpen] = useState({});
  const [similarIdx, setSimilarIdx] = useState(0);
  const [speakerModal, setSpeakerModal] = useState(null);

  const similar = MOCK_EVENTS.filter(e => e.id !== id && e.category === event.category).slice(0, 8);
  const visibleSimilar = similar.slice(similarIdx, similarIdx + 4);

  const handleRegister = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/events/${id}/register`);
  };

  const handleWaitlist = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/events/${id}/register?waitlist=true`);
  };

  const fillColor = fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F5A623' : '#3B6FFF';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* ===== HERO BANNER ===== */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img src={event.banner} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,15,44,0.3) 0%, rgba(10,15,44,0.85) 70%, #0A0F2C 100%)',
        }} />

        <div className="container" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', paddingBottom: 32 }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
            <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>›</span>
            <Link to="/events" style={{ color: '#94A3B8', textDecoration: 'none' }}>Events</Link>
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#fff' }}>{event.title}</span>
          </div>

          {/* Category badge */}
          <div style={{ marginBottom: 10 }}>
            <span className="badge badge-blue">{event.category}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, color: '#fff', marginBottom: 16, maxWidth: 700 }}>
            {event.title}
          </h1>

          {/* Countdown / Live / Ended */}
          {status === 'upcoming' || status === 'soon' ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>STARTS IN</div>
              <CountdownBlocks targetDate={event.startDate} compact />
            </div>
          ) : status === 'live' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', animation: 'pulse-dot 1.2s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#EF4444' }}>This event is happening right now</span>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 15, color: '#64748B' }}>This event has ended</span>
              {' · '}
              <Link to="#feedback" style={{ color: '#3B6FFF', fontSize: 14 }}>Leave feedback →</Link>
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#94A3B8' }}>
            <span>📍 {event.location}</span>
            <span>📅 {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>👤 {event.organizer}</span>
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1E2A45', marginBottom: 28, flexWrap: 'wrap' }}>
              {['about', 'schedule', 'speakers', ...(event.prizes ? ['prizes'] : []), ...(event.rules ? ['rules'] : []), 'faq'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 18px',
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? '#3B6FFF' : 'transparent'}`,
                    color: activeTab === tab ? '#fff' : '#64748B',
                    fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                    cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.15s', marginBottom: -1,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === 'about' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>ℹ</span>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>About the Event</h2>
                </div>
                <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 24, whiteSpace: 'pre-line' }}>
                  {event.description}
                </p>

                {/* Perks */}
                {event.perks && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                    {event.perks.map(perk => (
                      <div key={perk} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#22C55E',
                      }}>
                        <span>✓</span> {perk}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {event.tags?.map(tag => (
                    <span key={tag} className="badge badge-blue">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            {activeTab === 'schedule' && (
              <div className="fade-in">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Schedule Timeline</h2>
                {event.schedule ? (
                  <div style={{ position: 'relative', paddingLeft: 24 }}>
                    <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#1E2A45' }} />
                    {event.schedule.map((item, i) => (
                      <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
                        <div style={{
                          position: 'absolute', left: -24, top: 14,
                          width: 12, height: 12, borderRadius: '50%',
                          background: i === 0 ? '#3B6FFF' : '#1E2A45',
                          border: '2px solid #3B6FFF',
                        }} />
                        <div
                          onClick={() => setScheduleOpen(s => ({ ...s, [i]: !s[i] }))}
                          style={{
                            background: '#111827', border: '1px solid #1E2A45',
                            borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                            transition: 'border-color 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#2A3A55'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2A45'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#3B6FFF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                {item.date}{item.time ? ` · ${item.time}` : ''}
                              </div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.title}</div>
                            </div>
                            <span style={{ color: '#64748B', fontSize: 16, transition: 'transform 0.2s', transform: scheduleOpen[i] ? 'rotate(180deg)' : 'none', flexShrink: 0, marginLeft: 12 }}>∨</span>
                          </div>
                          {scheduleOpen[i] && (
                            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginTop: 10, paddingTop: 10, borderTop: '1px solid #1E2A45' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: 14 }}>Schedule will be announced soon.</p>
                )}
              </div>
            )}

            {/* Speakers */}
            {activeTab === 'speakers' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <span>👥</span>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Keynote Speakers</h2>
                </div>
                {event.speakers ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {event.speakers.map(speaker => (
                      <div
                        key={speaker.name}
                        className="card"
                        style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onClick={() => setSpeakerModal(speaker)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#3B6FFF'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2A45'}
                      >
                        <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', marginBottom: 12, border: '2px solid #1E2A45' }}>
                          <img src={speaker.avatar} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{speaker.name}</div>
                        <div style={{ fontSize: 12, color: '#3B6FFF', marginBottom: 8 }}>{speaker.role}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Click to read bio →</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: 14 }}>Speakers will be announced soon.</p>
                )}
              </div>
            )}

            {/* Prizes */}
            {activeTab === 'prizes' && event.prizes && (
              <div className="fade-in">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 24 }}>🏆 Prizes & Awards</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {event.prizes.map((prize, i) => (
                    <div key={i} style={{
                      background: '#111827', border: `1px solid ${i === 0 ? 'rgba(245,166,35,0.4)' : i === 1 ? 'rgba(148,163,184,0.3)' : '#1E2A45'}`,
                      borderRadius: 12, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <span style={{ fontSize: 32, flexShrink: 0 }}>{prize.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{prize.place}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>{prize.description}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? '#F5A623' : i === 1 ? '#94A3B8' : '#CD7F32', flexShrink: 0 }}>
                        {prize.amount}
                      </div>
                    </div>
                  ))}
                </div>
                {event.sponsors && event.sponsors.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Sponsors</h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {event.sponsors.map((s, i) => (
                        <div key={i} style={{
                          background: '#111827', border: '1px solid #1E2A45', borderRadius: 10,
                          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span style={{ fontSize: 18 }}>🏢</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: '#F5A623' }}>{s.tier} Sponsor</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rules */}
            {activeTab === 'rules' && event.rules && (
              <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>📋 Rules & Guidelines</h2>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const el = document.createElement('a');
                      el.href = '#';
                      alert('PDF download coming soon — rules are listed below.');
                    }}
                  >
                    ⬇ Download Rules PDF
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {event.rules.map((rule, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 14, padding: '14px 18px',
                      background: '#111827', border: '1px solid #1E2A45', borderRadius: 10,
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#3B6FFF',
                      }}>{i + 1}</div>
                      <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === 'faq' && (
              <div className="fade-in">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Frequently Asked Questions</h2>
                {event.faqs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {event.faqs.map((faq, i) => (
                      <div key={i} style={{
                        background: '#111827', border: '1px solid #1E2A45',
                        borderRadius: 12, overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => setFaqOpen(s => ({ ...s, [i]: !s[i] }))}
                          style={{
                            width: '100%', padding: '16px 20px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'none', border: 'none', color: '#fff',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          {faq.q}
                          <span style={{ color: '#64748B', fontSize: 18, transition: 'transform 0.2s', transform: faqOpen[i] ? 'rotate(180deg)' : 'none' }}>
                            ∨
                          </span>
                        </button>
                        {faqOpen[i] && (
                          <div style={{ padding: '0 20px 16px', fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: 14 }}>No FAQs available.</p>
                )}
              </div>
            )}

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 20 }}>
                  Partners & Sponsors
                </h3>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {event.sponsors.map((s, i) => (
                    <div key={i} style={{
                      background: '#111827', border: '1px solid #1E2A45', borderRadius: 10,
                      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 18 }}>🏢</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#F5A623' }}>{s.tier} Sponsor</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Registration card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              {/* Limited spots badge */}
              {fillPct >= 80 && status !== 'ended' && (
                <div style={{
                  position: 'absolute', top: -1, right: 20,
                  background: '#EF4444', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '3px 10px',
                  borderRadius: '0 0 8px 8px', letterSpacing: 0.5,
                }}>
                  LIMITED SPOTS
                </div>
              )}

              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Entry Fee</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{event.price}</span>
                  {event.price === 'Free' && (
                    <span style={{ fontSize: 12, color: '#22C55E' }}>Sponsored by AASTU ICT Dept.</span>
                  )}
                </div>
              </div>

              {/* Spots progress */}
              {status !== 'ended' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
                    <span>Spots Remaining:</span>
                    <span style={{ fontWeight: 600, color: fillPct >= 90 ? '#EF4444' : '#fff' }}>
                      {event.capacity - event.registered} / {event.capacity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
                  </div>
                </div>
              )}

              {/* Perks */}
              {event.perks?.map(perk => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
                  <span style={{ color: '#22C55E' }}>✓</span> {perk}
                </div>
              ))}

              <div style={{ height: 1, background: '#1E2A45', margin: '16px 0' }} />

              {/* Registration state */}
              {status === 'ended' ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <span className="badge badge-gray" style={{ fontSize: 13, padding: '8px 16px' }}>Event Ended</span>
                </div>
              ) : userReg?.status === 'registered' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <span className="badge badge-green">✓ You're Registered</span>
                  </div>
                  <QRCodeCard
                    value={userReg.qrCode}
                    eventName={event.title}
                    eventDate={new Date(event.startDate).toLocaleDateString()}
                    eventLocation={event.location}
                  />
                </div>
              ) : userReg?.status === 'waitlist' ? (
                <div>
                  <WaitlistBadge position={userReg.position} size="large" />
                  <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 12, marginBottom: 12 }}>
                    We'll notify you automatically if a spot opens
                  </p>
                  <button className="btn btn-outline btn-full btn-sm" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={handleLeaveWaitlist}>
                    Leave Waitlist
                  </button>
                </div>
              ) : isFull ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <span className="badge badge-red">Event Full</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                    {waitlistCount} people already on waitlist
                  </p>
                  <button className="btn btn-outline-gold btn-full" onClick={handleWaitlist} style={{ marginBottom: 8 }}>
                    Join Waitlist
                  </button>
                </div>
              ) : (
                <div>
                  <button className="btn btn-primary btn-full" onClick={handleRegister} style={{ marginBottom: 8 }}>
                    Register Now →
                  </button>
                  {event.isHackathon && (
                    <button
                      className="btn btn-outline btn-full btn-sm"
                      onClick={() => navigate(`/events/${id}/team`)}
                    >
                      Register as Team
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Share */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Share event</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied!', 'Event URL copied to clipboard');
                    }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }}
                    title="Copy link"
                  >⬆</button>
                  <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }} title="Bookmark">🔖</button>
                </div>
              </div>
            </div>

            {/* Volunteer */}
            <div className="card" style={{ padding: '16px 20px', marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Volunteer?</div>
              <div style={{ fontSize: 13, color: '#3B6FFF', cursor: 'pointer' }}>Join the organizing committee →</div>
            </div>
          </div>
        </div>

        {/* ===== SIMILAR EVENTS ===== */}
        {similar.length > 0 && (
          <div style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Explore Similar Events</h2>
                <p style={{ fontSize: 13, color: '#64748B' }}>Don't miss out on these upcoming opportunities</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSimilarIdx(i => Math.max(0, i - 1))}
                  disabled={similarIdx === 0}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: similarIdx === 0 ? 'transparent' : 'rgba(59,111,255,0.15)',
                    border: `1px solid ${similarIdx === 0 ? '#1E2A45' : '#3B6FFF'}`,
                    color: similarIdx === 0 ? '#64748B' : '#3B6FFF',
                    cursor: similarIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >‹</button>
                <button
                  onClick={() => setSimilarIdx(i => Math.min(similar.length - 4, i + 1))}
                  disabled={similarIdx >= similar.length - 4}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: similarIdx >= similar.length - 4 ? 'transparent' : 'rgba(59,111,255,0.15)',
                    border: `1px solid ${similarIdx >= similar.length - 4 ? '#1E2A45' : '#3B6FFF'}`,
                    color: similarIdx >= similar.length - 4 ? '#64748B' : '#3B6FFF',
                    cursor: similarIdx >= similar.length - 4 ? 'not-allowed' : 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >›</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {visibleSimilar.map(e => (
                <EventCard key={e.id} event={e} compact />
              ))}
            </div>
            {/* Dot indicators */}
            {similar.length > 4 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {Array.from({ length: Math.ceil(similar.length / 4) }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setSimilarIdx(i * 4)}
                    style={{
                      width: i * 4 === similarIdx ? 20 : 6, height: 6, borderRadius: 3,
                      background: i * 4 === similarIdx ? '#3B6FFF' : '#1E2A45',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Speaker modal */}
      {speakerModal && (
        <div
          className="modal-overlay"
          onClick={() => setSpeakerModal(null)}
          onKeyDown={e => e.key === 'Escape' && setSpeakerModal(null)}
        >
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Speaker</h3>
              <button className="modal-close" onClick={() => setSpeakerModal(null)}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <img
                src={speakerModal.avatar}
                alt={speakerModal.name}
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1E2A45', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{speakerModal.name}</div>
                <div style={{ fontSize: 13, color: '#3B6FFF', marginBottom: 12 }}>{speakerModal.role}</div>
                <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{speakerModal.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
