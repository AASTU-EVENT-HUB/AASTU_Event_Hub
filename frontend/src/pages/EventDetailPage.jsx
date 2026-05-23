import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import { CountdownBlocks } from '../components/CountdownTimer';
import StatusBadge from '../components/StatusBadge';
import { normalizeEvent, getEventStatus } from '../components/EventCard';
import { eventsAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReg, setUserReg] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    eventsAPI.getById(id)
      .then(r => setEvent(normalizeEvent(r.data.event)))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));

    if (user) {
      registrationAPI.getMyRegistrations()
        .then(r => {
          const reg = (r.data.registrations || []).find(reg => String(reg.event?.id) === String(id));
          setUserReg(reg || null);
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/events/${id}` } } }); return; }
    setRegistering(true);
    try {
      await registrationAPI.registerForEvent(id);
      toast.success('Registered!', `You're registered for ${event.title}`);
      // Refresh registration
      const r = await registrationAPI.getMyRegistrations();
      const reg = (r.data.registrations || []).find(reg => String(reg.event?.id) === String(id));
      setUserReg(reg || null);
    } catch (err) {
      toast.error('Registration failed', err.response?.data?.message || 'Could not register');
    }
    setRegistering(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #1E2A45', borderTopColor: '#3B6FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!event) return null;

  const status = getEventStatus(event);
  const fillPct = event.capacity > 0 ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;
  const fillColor = fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F5A623' : '#3B6FFF';
  const isFull = event.registered >= event.capacity;
  const isRegistered = userReg?.status === 'confirmed' || userReg?.status === 'checked_in';
  const tags = (() => { try { return Array.isArray(event.tags) ? event.tags : JSON.parse(event.tags || '[]'); } catch { return String(event.tags || '').split(',').filter(Boolean); } })();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden', background: '#111827' }}>
        <img
          src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,44,0.3) 0%, rgba(10,15,44,0.9) 70%, #0A0F2C 100%)' }} />
        <div className="container" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', paddingBottom: 32 }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
            <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link> ›{' '}
            <Link to="/events" style={{ color: '#94A3B8', textDecoration: 'none' }}>Events</Link> ›{' '}
            <span style={{ color: '#fff' }}>{event.title}</span>
          </div>
          <div style={{ marginBottom: 10 }}><span className="badge badge-blue">{event.category}</span></div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,42px)', fontWeight: 900, color: '#fff', marginBottom: 14, maxWidth: 700 }}>{event.title}</h1>
          {(status === 'upcoming' || status === 'soon') && event.startDate && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>STARTS IN</div>
              <CountdownBlocks targetDate={event.startDate} compact />
            </div>
          )}
          {status === 'live' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', animation: 'pulse-dot 1.2s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#EF4444' }}>Happening right now</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#94A3B8' }}>
            {event.location && <span>📍 {event.location}</span>}
            {event.startDate && <span>📅 {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            {event.organizer_name && <span>👤 {event.organizer_name}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1E2A45', marginBottom: 28 }}>
              {['about', 'details'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '10px 18px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? '#3B6FFF' : 'transparent'}`,
                  color: activeTab === tab ? '#fff' : '#64748B',
                  fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer', textTransform: 'capitalize', marginBottom: -1,
                }}>{tab}</button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="fade-in">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>About this Event</h2>
                <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 24, whiteSpace: 'pre-line' }}>
                  {event.description || 'No description provided.'}
                </p>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {tags.map(tag => <span key={tag} className="badge badge-blue">{tag}</span>)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="fade-in">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Event Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Category', value: event.category },
                    { label: 'Department', value: event.department },
                    { label: 'Location', value: event.location },
                    { label: 'Start Date', value: event.startDate ? new Date(event.startDate).toLocaleString() : '—' },
                    { label: 'End Date', value: event.endDate ? new Date(event.endDate).toLocaleString() : '—' },
                    { label: 'Capacity', value: event.capacity },
                    { label: 'Organizer', value: event.organizer_name || '—' },
                    { label: 'Team Event', value: event.isTeamEvent ? 'Yes' : 'No' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: '#111827', borderRadius: 10, border: '1px solid #1E2A45' }}>
                      <span style={{ fontSize: 13, color: '#64748B', minWidth: 120 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Registration card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Entry Fee</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>Free</div>
              </div>

              {status !== 'ended' && event.capacity > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
                    <span>Spots Remaining</span>
                    <span style={{ fontWeight: 600, color: fillPct >= 90 ? '#EF4444' : '#fff' }}>
                      {Math.max(0, event.capacity - event.registered)} / {event.capacity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: '#1E2A45', margin: '16px 0' }} />

              {status === 'ended' ? (
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-gray" style={{ fontSize: 13, padding: '8px 16px' }}>Event Ended</span>
                </div>
              ) : isRegistered ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <span className="badge badge-green">✓ You're Registered</span>
                  </div>
                  {userReg?.qrCode && (
                    <div style={{ background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#0A0F2C', fontWeight: 600, marginBottom: 8 }}>Your QR Ticket</div>
                      <div style={{ fontSize: 10, color: '#64748B', wordBreak: 'break-all' }}>{userReg.qrCode}</div>
                    </div>
                  )}
                  <button className="btn btn-outline btn-full btn-sm" onClick={() => navigate('/dashboard/tickets')}>
                    View My Tickets →
                  </button>
                </div>
              ) : isFull ? (
                <div style={{ textAlign: 'center' }}>
                  <span className="badge badge-red" style={{ marginBottom: 12, display: 'inline-block' }}>Event Full</span>
                  <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>This event has reached capacity</p>
                </div>
              ) : (
                <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={registering}>
                  {registering ? 'Registering...' : 'Register Now →'}
                </button>
              )}

              {!user && status !== 'ended' && (
                <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 10 }}>
                  <Link to="/login" style={{ color: '#3B6FFF' }}>Sign in</Link> to register
                </p>
              )}
            </div>

            {/* Share */}
            <div className="card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Share event</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Copied!', 'Link copied to clipboard'); }}
                  style={{ background: 'none', border: 'none', color: '#3B6FFF', cursor: 'pointer', fontSize: 13 }}
                >Copy Link ⬆</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
