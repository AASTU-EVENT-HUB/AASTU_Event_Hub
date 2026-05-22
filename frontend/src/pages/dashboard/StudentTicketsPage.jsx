import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import QRCodeCard from '../../components/QRCodeCard';
import { registrationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function StudentTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    registrationAPI.getMyRegistrations()
      .then(res => setRegistrations(res.data.registrations || []))
      .catch(() => toast.error('Load failed', 'Could not load your tickets'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = registrations.filter(r => r.event?.startDate && new Date(r.event.startDate) >= now);
  const past = registrations.filter(r => r.event?.startDate && new Date(r.event.startDate) < now);

  const TicketCard = ({ reg }) => {
    const isLive = reg.status === 'checked_in';
    const isPast = reg.event?.startDate && new Date(reg.event.startDate) < now;

    return (
      <div style={{
        background: '#111827',
        border: `1px solid ${isLive ? 'rgba(59,111,255,0.4)' : '#1E2A45'}`,
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Event banner */}
        <div style={{ position: 'relative', height: 120, overflow: 'hidden', background: '#1E2A45' }}>
          {reg.event?.banner && (
            <img src={reg.event.banner} alt={reg.event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPast ? 0.5 : 1 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }} />
          {isPast && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="badge badge-gray" style={{ fontSize: 12 }}>ENDED</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{reg.event?.title}</div>
          </div>
        </div>

        {/* Ticket info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: 12, color: '#94A3B8' }}>
            {reg.event?.startDate && (
              <>
                <span>📅 {new Date(reg.event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>🕐 {new Date(reg.event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
            {reg.event?.location && <span>📍 {reg.event.location}</span>}
          </div>

          {/* QR code preview */}
          {reg.qrCode && (
            <div style={{
              background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)',
              borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#3B6FFF',
              fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 12,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              Ticket #{reg.registrationId}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className={`badge ${reg.status === 'checked_in' ? 'badge-blue' : reg.status === 'waitlist' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: 10 }}>
              {reg.status === 'checked_in' ? '✓ CHECKED IN' : reg.status === 'waitlist' ? '⏳ WAITLIST' : '✓ CONFIRMED'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {reg.qrCode && (
              <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowQR(reg)}>
                View QR
              </button>
            )}
            <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }} onClick={() => navigate(`/events/${reg.event?.id}`)}>
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search tickets..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Tickets</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              {loading ? 'Loading...' : `${registrations.length} total tickets`}
            </p>
          </div>

          {!loading && registrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No tickets yet</h3>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>Register for events to see your tickets here</p>
              <button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Upcoming ({upcoming.length})</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {upcoming.map(r => <TicketCard key={r.registrationId} reg={r} />)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Past Events ({past.length})</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {past.map(r => <TicketCard key={r.registrationId} reg={r} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Your Ticket</h3>
              <button className="modal-close" onClick={() => setShowQR(null)}>×</button>
            </div>
            <QRCodeCard
              value={showQR.qrCode}
              eventName={showQR.event?.title}
              eventDate={showQR.event?.startDate ? new Date(showQR.event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
              eventLocation={showQR.event?.location}
            />
          </div>
        </div>
      )}
    </div>
  );
}
