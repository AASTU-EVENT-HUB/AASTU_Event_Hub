import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';
import QRCodeCard from '../components/QRCodeCard';
import PublicNavbar from '../components/layout/PublicNavbar';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function RegistrationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const isWaitlist = searchParams.get('waitlist') === 'true';
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistPosition] = useState(Math.floor(Math.random() * 10) + 1);

  const qrValue = `QR-AAU-${id?.toUpperCase()}-${user?.id?.toUpperCase()}-${Date.now()}`;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setConfirmed(true);
    toast.success(
      isWaitlist ? "You're on the waitlist!" : "Registration confirmed!",
      isWaitlist ? `Position #${waitlistPosition}` : `See you at ${event.title}`
    );
  };

  const handleAddToCalendar = () => {
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description?.slice(0, 200) || '')}&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
  };

  /* ── CONFIRMATION SCREEN ── */
  if (!confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
        <PublicNavbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ maxWidth: 480, width: '100%' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748B' }}>
              <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link to="/events" style={{ color: '#64748B', textDecoration: 'none' }}>Events</Link>
              <span>›</span>
              <Link to={`/events/${id}`} style={{ color: '#64748B', textDecoration: 'none' }}>{event.title}</Link>
              <span>›</span>
              <span style={{ color: '#fff' }}>{isWaitlist ? 'Join Waitlist' : 'Register'}</span>
            </div>

            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{isWaitlist ? '⏳' : '🎟'}</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  {isWaitlist ? 'Join the Waitlist' : 'Confirm Registration'}
                </h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>
                  {isWaitlist
                    ? "You'll be notified automatically if a spot opens"
                    : 'Review your registration details below'}
                </p>
              </div>

              {/* Event summary */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid #1E2A45',
                borderRadius: 12, padding: '16px 20px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <img
                    src={event.banner}
                    alt={event.title}
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>
                      📅 {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>
                      🕐 {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>📍 {event.location}</div>
                  </div>
                </div>
              </div>

              {/* Registrant */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Registering as</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                  }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{user?.email}{user?.studentId ? ` · ${user.studentId}` : ''}</div>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={handleConfirm}
                disabled={loading}
                style={{ borderRadius: 10, marginBottom: 10 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {isWaitlist ? 'Joining waitlist...' : 'Confirming...'}
                  </span>
                ) : (isWaitlist ? 'Join Waitlist' : 'Confirm Registration')}
              </button>
              <button className="btn btn-outline btn-full btn-sm" onClick={() => navigate(`/events/${id}`)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── SUCCESS SCREEN ── */
  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

          {/* Success icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: isWaitlist ? 'rgba(245,166,35,0.15)' : 'rgba(34,197,94,0.15)',
            border: `2px solid ${isWaitlist ? 'rgba(245,166,35,0.4)' : 'rgba(34,197,94,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px',
            animation: 'fadeIn 0.4s ease',
          }}>
            {isWaitlist ? '⏳' : '✓'}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            {isWaitlist ? "You're on the Waitlist!" : "You're Registered!"}
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28 }}>
            {isWaitlist
              ? "We'll notify you automatically if a spot opens"
              : `See you at ${event.title}`}
          </p>

          {/* QR or waitlist position */}
          {isWaitlist ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                background: '#111827', border: '1px solid #1E2A45',
                borderRadius: 16, padding: '28px 24px', display: 'inline-block',
              }}>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Your Position</div>
                <div style={{ fontSize: 64, fontWeight: 900, color: '#F5A623', lineHeight: 1 }}>
                  #{waitlistPosition}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>on the waitlist</div>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 16 }}>
                We'll notify you automatically if a spot opens
              </p>
              <button style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                Leave Waitlist
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <QRCodeCard
                value={qrValue}
                eventName={event.title}
                eventDate={new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                eventLocation={event.location}
              />
            </div>
          )}

          {/* Action buttons */}
          {!isWaitlist && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              <button className="btn btn-outline-white btn-sm">⬇ Download QR</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddToCalendar}>📅 Add to Calendar</button>
            </div>
          )}

          {/* Navigation links */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ fontSize: 13, color: '#3B6FFF', textDecoration: 'none', fontWeight: 600 }}>
              View My Events →
            </Link>
            <Link to="/events" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
              Browse More Events
            </Link>
            <Link to="/" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
