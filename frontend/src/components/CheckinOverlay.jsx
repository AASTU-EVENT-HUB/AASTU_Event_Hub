import { useEffect, useState } from 'react';

export default function CheckinOverlay({ type, studentName, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: isSuccess ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      animation: isSuccess ? 'flash-green 2.5s ease forwards' : 'flash-red 2.5s ease forwards',
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>
        {isSuccess ? '✓' : '✕'}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
        {isSuccess ? 'Checked In!' : 'Error'}
      </div>
      {studentName && (
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{studentName}</div>
      )}
      {!isSuccess && (
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          {studentName || 'Invalid QR code'}
        </div>
      )}
    </div>
  );
}
