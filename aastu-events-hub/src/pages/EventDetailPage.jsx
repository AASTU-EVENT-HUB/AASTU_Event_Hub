import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  const status = getEventStatus(event);
  const fillPct = Math.round((event.registered / event.capacity) * 100);
  const isFull = event.registered >= event.capacity;

  const userReg = user ? MOCK_REGISTRATIONS.find(r => r.eventId === id && r.userId === user.id) : null;
  const [activeTab, setActiveTab] = useState('about');
  const [faqOpen, setFaqOpen] = useState({});
  const [similarIdx, setSimilarIdx] = useState(0);

  const similar = MOCK_EVENTS.filter(e => e.id !== id && e.category === event.category).slice(0, 4);

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
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1E2A45', marginBottom: 28 }}>
              {['about', 'schedule', 'speakers', 'faq'].map(tab => (
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
                    transition: 'all 0.15s',
                    marginBottom: -1,
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
                      <div key={i} style={{ position: 'relative', marginBottom: 28 }}>
                        <div style={{
                          position: 'absolute', left: -24, top: 4,
                          width: 12, height: 12, borderRadius: '50%',
                          background: i === 0 ? '#3B6FFF' : '#1E2A45',
                          border: '2px solid #3B6FFF',
                        }} />
                        <div style={{ fontSize: 11, color: '#3B6FFF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                          {item.date}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>{item.description}</div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {event.speakers.map(speaker => (
                      <div key={speaker.name} className="card" style={{ padding: 20 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          overflow: 'hidden', marginBottom: 12,
                          border: '2px solid #1E2A45',
                        }}>
                          <img src={speaker.avatar} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{speaker.name}</div>
                        <div style={{ fontSize: 12, color: '#3B6FFF', marginBottom: 8 }}>{speaker.role}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{speaker.bio}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: 14 }}>Speakers will be announced soon.</p>
                )}
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
            <div style={{ marginTop: 48 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 20 }}>
                Global Partners & Sponsors
              </h3>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 100, height: 40, background: '#1E2A45',
                    borderRadius: 8, border: '1px solid #2A3A55',
                  }} />
                ))}
              </div>
            </div>
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
                  <button className="btn btn-outline btn-full btn-sm" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                    Leave Waitlist
                  </button>
                </div>
              ) : isFull ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <span className="badge badge-red">Event Full</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                    {event.waitlist} people already on waitlist
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
                  <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }}>⬆</button>
                  <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }}>🔖</button>
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
                    background: 'transparent', border: '1px solid #1E2A45',
                    color: '#94A3B8', cursor: 'pointer', fontSize: 16,
                  }}
                >‹</button>
                <button
                  onClick={() => setSimilarIdx(i => Math.min(similar.length - 3, i + 1))}
                  disabled={similarIdx >= similar.length - 3}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'transparent', border: '1px solid #1E2A45',
                    color: '#94A3B8', cursor: 'pointer', fontSize: 16,
                  }}
                >›</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {similar.slice(similarIdx, similarIdx + 4).map(e => (
                <EventCard key={e.id} event={e} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
