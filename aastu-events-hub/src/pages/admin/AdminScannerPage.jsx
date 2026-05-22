import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CheckinOverlay from '../../components/CheckinOverlay';
import { MOCK_EVENTS, MOCK_CHECKIN_STATS } from '../../data/mockData';

const RECENT_CHECKINS = [
  { name: 'Henok Tadesse', time: '2 mins ago', avatar: 'https://i.pravatar.cc/40?img=10' },
  { name: 'Tigist Alemu', time: '5 mins ago', avatar: 'https://i.pravatar.cc/40?img=11' },
  { name: 'Sara Haile', time: '8 mins ago', avatar: 'https://i.pravatar.cc/40?img=13' },
];

export default function AdminScannerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = MOCK_EVENTS.find(e => e.id === eventId) || MOCK_EVENTS[1];
  const [overlay, setOverlay] = useState(null); // { type: 'success'|'error', name: string }
  const [checkins, setCheckins] = useState(RECENT_CHECKINS);
  const [checkedCount, setCheckedCount] = useState(MOCK_CHECKIN_STATS.checkedIn);
  const inputRef = useRef(null);

  const simulateScan = (success) => {
    if (success) {
      const name = 'Dawit Bekele';
      setOverlay({ type: 'success', name });
      setCheckedCount(c => c + 1);
      setCheckins(prev => [{ name, time: 'Just now', avatar: 'https://i.pravatar.cc/40?img=12' }, ...prev.slice(0, 4)]);
    } else {
      setOverlay({ type: 'error', name: 'Already checked in' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0F2C',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 420,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: '#0D1224',
        borderBottom: '1px solid #1E2A45',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => navigate(`/admin/checkin/${eventId}`)}
          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}
        >←</button>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{event.title}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Check-in Scanner</div>
        </div>
      </div>

      {/* Counter */}
      <div style={{
        padding: '12px 20px',
        background: 'rgba(34,197,94,0.08)',
        borderBottom: '1px solid rgba(34,197,94,0.2)',
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        fontSize: 14,
        fontWeight: 600,
        color: '#22C55E',
      }}>
        <span>{checkedCount} Checked In</span>
        <span style={{ color: '#64748B' }}>/</span>
        <span style={{ color: '#94A3B8' }}>{MOCK_CHECKIN_STATS.totalRegistered} Registered</span>
      </div>

      {/* Camera viewfinder */}
      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{
          position: 'relative',
          background: '#0D1224',
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: '1',
          border: '1px solid #1E2A45',
        }}>
          {/* Corner brackets */}
          {[
            { top: 12, left: 12, borderTop: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
            { top: 12, right: 12, borderTop: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
            { bottom: 12, left: 12, borderBottom: '3px solid #3B6FFF', borderLeft: '3px solid #3B6FFF' },
            { bottom: 12, right: 12, borderBottom: '3px solid #3B6FFF', borderRight: '3px solid #3B6FFF' },
          ].map((style, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 24, height: 24,
              borderRadius: 2,
              ...style,
            }} />
          ))}

          {/* Scan line animation */}
          <div style={{
            position: 'absolute',
            left: 20, right: 20,
            height: 2,
            background: 'linear-gradient(to right, transparent, #3B6FFF, transparent)',
            animation: 'scanLine 2s ease-in-out infinite',
            top: '50%',
          }} />

          {/* Center icon */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>📷</div>
            <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
              Point camera at QR code
            </div>
          </div>

          {/* Overlay */}
          {overlay && (
            <CheckinOverlay
              type={overlay.type}
              studentName={overlay.name}
              onDone={() => setOverlay(null)}
            />
          )}
        </div>

        {/* Manual input */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter ticket ID manually..."
            className="form-input"
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => simulateScan(true)}
          >
            Scan
          </button>
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            className="btn btn-sm"
            style={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}
            onClick={() => simulateScan(true)}
          >
            ✓ Simulate Success
          </button>
          <button
            className="btn btn-sm"
            style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
            onClick={() => simulateScan(false)}
          >
            ✕ Simulate Error
          </button>
        </div>

        {/* Recent check-ins */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Recent Check-ins
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checkins.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#111827', border: '1px solid #1E2A45',
                borderRadius: 10, padding: '10px 14px',
                animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
              }}>
                <img src={c.avatar} alt={c.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</div>
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{c.time}</div>
                <span className="badge badge-green" style={{ fontSize: 9 }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 20%; }
          50% { top: 80%; }
          100% { top: 20%; }
        }
      `}</style>
    </div>
  );
}
