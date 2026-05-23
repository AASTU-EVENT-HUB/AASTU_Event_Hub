import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MOCK_EVENTS } from '../data/mockData';
import PublicNavbar from '../components/layout/PublicNavbar';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RegistrationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const isWaitlist = searchParams.get('waitlist') === 'true';
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];

  const [loading, setLoading] = useState(false);
  const [waitlistPosition] = useState(Math.floor(Math.random() * 10) + 1);

  const qrValue = `QR-AAU-${id?.toUpperCase()}-${user?.id?.toUpperCase()}-${Date.now()}`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let registration;
      try {
        const endpoint = isWaitlist ? `/waitlist/${id}` : `/registrations/${id}`;
        const res = await axios.post(`${API_BASE}${endpoint}`);
        registration = res.data;
      } catch {
        // Mock fallback — backend not running yet
        registration = {
          qrCode: qrValue,
          status: isWaitlist ? 'waitlist' : 'registered',
          position: waitlistPosition,
        };
      }

      setLoading(false);
      toast.success(
        isWaitlist ? "You're on the waitlist!" : 'Registration confirmed!',
        isWaitlist
          ? `Position #${registration.position ?? waitlistPosition}`
          : `See you at ${event.title}`
      );

      if (isWaitlist) {
        navigate(`/events/${id}/waitlist-confirmation`, {
          state: { event, position: registration.position ?? waitlistPosition },
        });
      } else {
        navigate(`/events/${id}/confirmation`, {
          state: { event, registration },
        });
      }
    } catch (err) {
      setLoading(false);
      toast.error('Registration failed', err?.response?.data?.message || 'Please try again.');
    }
  };

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
                     {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>
                     {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>📍 {event.location}</div>
                </div>
              </div>
            </div>

            {/* Registrant info */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Registering as
              </div>
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
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {user?.email}{user?.studentId ? ` · ${user.studentId}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist position preview */}
            {isWaitlist && (
              <div style={{
                background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>⏳</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5A623' }}>
                    Estimated position: #{waitlistPosition}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    You'll be notified automatically if a spot opens
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-full"
              onClick={handleConfirm}
              disabled={loading}
              style={{ borderRadius: 10, marginBottom: 10 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  {isWaitlist ? 'Joining waitlist...' : 'Confirming...'}
                </span>
              ) : (isWaitlist ? 'Join Waitlist' : 'Confirm Registration')}
            </button>

            <button
              className="btn btn-outline btn-full btn-sm"
              onClick={() => navigate(`/events/${id}`)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
