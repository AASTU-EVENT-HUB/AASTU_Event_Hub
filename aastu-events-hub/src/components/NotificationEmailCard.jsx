export default function NotificationEmailCard({ eventName, eventDate, eventTime, hoursLeft = 24 }) {
  return (
    <div style={{
      background: '#0D1224',
      border: '1px solid #1E2A45',
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 480,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0F2C, #1E2A45)',
        padding: '24px 28px',
        borderBottom: '1px solid #1E2A45',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#3B6FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🎓</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AASTU Events Hub</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>noreply@aastu.edu.et</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 28px 24px' }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(245,166,35,0.15)',
            border: '2px solid rgba(245,166,35,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto',
          }}>🎉</div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8 }}>
          A spot just opened up!
        </h2>
        <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24 }}>
          Great news — a registration spot became available for an event you're waitlisted for.
        </p>

        {/* Event card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid #1E2A45',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            {eventName || 'AI Ethics Workshop'}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#94A3B8' }}>
            <span>📅 {eventDate || 'Nov 15, 2024'}</span>
            <span>🕐 {eventTime || '10:00 AM'}</span>
          </div>
        </div>

        {/* Countdown */}
        <div style={{
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: 10,
          padding: '12px 16px',
          textAlign: 'center',
          marginBottom: 20,
          fontSize: 13,
          color: '#F5A623',
          fontWeight: 600,
        }}>
          ⏰ You have {hoursLeft} hours to claim your spot
        </div>

        {/* CTA */}
        <button className="btn btn-gold btn-full" style={{ marginBottom: 12, borderRadius: 10 }}>
          Register Now →
        </button>

        <p style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
          If you no longer wish to be notified, you can remove yourself from the waitlist.
        </p>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #1E2A45',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        fontSize: 11,
        color: '#64748B',
      }}>
        <span>Privacy Policy</span>
        <span>·</span>
        <span>Unsubscribe</span>
        <span>·</span>
        <span>© 2024 AASTU Events Hub</span>
      </div>
    </div>
  );
}
