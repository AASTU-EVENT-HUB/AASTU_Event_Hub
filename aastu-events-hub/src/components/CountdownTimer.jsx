import { useState, useEffect } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

// Block-style countdown (DD HH MM SS) — used on event detail page
export function CountdownBlocks({ targetDate, compact = false }) {
  const [time, setTime] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time) return null;

  const blocks = [
    { value: pad(time.days), label: 'Days' },
    { value: pad(time.hours), label: 'Hours' },
    { value: pad(time.mins), label: 'Mins' },
    { value: pad(time.secs), label: 'Secs' },
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {blocks.map((b, i) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              background: 'rgba(59,111,255,0.15)',
              border: '1px solid rgba(59,111,255,0.3)',
              borderRadius: 8,
              padding: '4px 8px',
              textAlign: 'center',
              minWidth: 36,
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{b.value}</div>
              <div style={{ fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{b.label}</div>
            </div>
            {i < 3 && <span style={{ color: '#3B6FFF', fontWeight: 700, fontSize: 14 }}>:</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {blocks.map((b, i) => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'center',
            minWidth: 72,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{b.value}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{b.label}</div>
          </div>
          {i < 3 && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 28, marginTop: -8 }}>:</span>}
        </div>
      ))}
    </div>
  );
}

// Inline countdown for card badges (Xh Xm Xs)
export function CountdownInline({ targetDate }) {
  const [time, setTime] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time) return null;

  if (time.days > 0) {
    return <span>Starts in {time.days}d {pad(time.hours)}h</span>;
  }
  return <span>Starts in {pad(time.hours)}h {pad(time.mins)}m {pad(time.secs)}s</span>;
}

export default CountdownBlocks;
