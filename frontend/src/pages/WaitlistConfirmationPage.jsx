import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';
import PublicNavbar from '../components/layout/PublicNavbar';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WaitlistConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const stateEvent = location.state?.event;
  const position = location.state?.position ?? 1;

  const event = stateEvent || MOCK_EVENTS.find((e) => e.id === id);

  useEffect(() => {
    if (!event) navigate(`/events/${id}`, { replace: true });
  }, [event, id, navigate]);

  if (!event) return null;

  const handleLeaveWaitlist = async () => {
    try {
      try {
        await axios.delete(`${API_BASE}/waitlist/${id}`);
      } catch {
        // mock — just proceed
      }
      toast.success('Removed from waitlist', `You've left the waitlist for ${event.title}`);
      navigate(`/events/${id}`);
    } catch {
      toast.error('Error', 'Could not leave waitlist. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0F2C',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PublicNavbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Hourglass icon */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'rgba(245,166,35,0.12)',
              border: '2px solid rgba(245,166,35,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 40,
              animation: 'fadeIn 0.4s ease',
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#fff',
              marginBottom: 8,
            }}
          >
            You're on the Waitlist
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 32 }}>
            We'll notify you automatically if a spot opens up
          </p>

          {/* Event + position card */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1E2A45',
              borderRadius: 16,
              padding: '28px 24px',
              marginBottom: 24,
            }}
          >
            {/* Event name */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 20,
              }}
            >
              {event.title}
            </div>

            {/* Queue position */}
            <div
              style={{
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid rgba(245,166,35,0.25)',
                borderRadius: 12,
                padding: '20px 24px',
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: '#94A3B8',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Your Position
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: '#F5A623',
                  lineHeight: 1,
                }}
              >
                #{position}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
                on the waitlist
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                color: '#94A3B8',
                lineHeight: 1.6,
              }}
            >
              We'll notify you automatically if a spot opens up. You can leave
              the waitlist at any time.
            </p>
          </div>

          {/* Leave waitlist */}
          <button
            onClick={handleLeaveWaitlist}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 24,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Leave Waitlist
          </button>

          <br />

          {/* Back to events */}
          <Link
            to="/events"
            style={{
              fontSize: 14,
              color: '#64748B',
              textDecoration: 'none',
            }}
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}
