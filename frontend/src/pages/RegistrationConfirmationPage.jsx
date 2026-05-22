import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../data/mockData';
import QRCodeCard from '../components/QRCodeCard';
import PublicNavbar from '../components/layout/PublicNavbar';

// Generate a valid .ics calendar file string
function generateICS(event) {
  const fmt = (d) =>
    new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AASTU Events Hub//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}-${Date.now()}@aastu.edu.et`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(event.startDate)}`,
    `DTEND:${fmt(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n').slice(0, 500)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(event) {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RegistrationConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read event + registration from navigation state
  const stateEvent = location.state?.event;
  const registration = location.state?.registration;

  // Fall back to mock data if navigated directly
  const event = stateEvent || MOCK_EVENTS.find((e) => e.id === id);

  // If no event found at all, redirect to event detail
  useEffect(() => {
    if (!event) navigate(`/events/${id}`, { replace: true });
  }, [event, id, navigate]);

  if (!event) return null;

  const qrValue =
    registration?.qrCode ||
    `QR-AAU-${id?.toUpperCase()}-${Date.now()}`;

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          {/* Gold checkmark icon */}
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
            ✓
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#fff',
              marginBottom: 8,
            }}
          >
            You're Registered!
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 32 }}>
            Your spot is confirmed for the event below
          </p>

          {/* Event + QR card */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1E2A45',
              borderRadius: 16,
              padding: '28px 24px',
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            {/* Event info */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: 10,
                }}
              >
                {event.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: 14,
                  color: '#94A3B8',
                }}
              >
                <span>
                  📅 {formattedDate} · {formattedTime}
                </span>
                <span>📍 {event.location}</span>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: '#1E2A45',
                margin: '20px 0',
              }}
            />

            {/* QR Code — centered */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <QRCodeCard
                value={qrValue}
                eventName={event.title}
                eventDate={`${formattedDate} · ${formattedTime}`}
                eventLocation={event.location}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            {/* Download QR — delegates to QRCodeCard's internal handler via a custom trigger */}
            <button
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 10, minWidth: 140 }}
              onClick={() => {
                // Trigger the download logic from QRCodeCard
                const svg = document.getElementById('qr-svg');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#111827';
                ctx.fillRect(0, 0, 300, 300);
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 25, 25, 250, 250);
                  const link = document.createElement('a');
                  link.download = `ticket-${qrValue}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                };
                img.src =
                  'data:image/svg+xml;base64,' +
                  btoa(unescape(encodeURIComponent(svgData)));
              }}
            >
              ⬇ Download QR
            </button>

            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 10, minWidth: 160 }}
              onClick={() => downloadICS(event)}
            >
              📅 Add to Calendar
            </button>
          </div>

          {/* View My Events link */}
          <Link
            to="/dashboard/tickets"
            style={{
              fontSize: 14,
              color: '#3B6FFF',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View My Events →
          </Link>
        </div>
      </div>
    </div>
  );
}
