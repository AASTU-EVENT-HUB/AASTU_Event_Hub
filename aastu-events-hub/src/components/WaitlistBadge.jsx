export default function WaitlistBadge({ position, size = 'normal' }) {
  if (size === 'large') {
    return (
      <div style={{
        background: 'rgba(245,166,35,0.1)',
        border: '1px solid rgba(245,166,35,0.3)',
        borderRadius: 16,
        padding: '20px 28px',
        textAlign: 'center',
        display: 'inline-block',
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Your Position</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#F5A623', lineHeight: 1 }}>#{position}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>on the waitlist</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(245,166,35,0.1)',
      border: '1px solid rgba(245,166,35,0.3)',
      borderRadius: 20,
      padding: '4px 10px',
      fontSize: 12,
      color: '#F5A623',
      fontWeight: 600,
    }}>
      <span>⏳</span>
      <span>#{position} on waitlist</span>
    </div>
  );
}
