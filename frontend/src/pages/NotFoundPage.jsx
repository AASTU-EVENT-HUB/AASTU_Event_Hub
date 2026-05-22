import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* 404 geometric */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{
              fontSize: 'clamp(80px, 15vw, 140px)',
              fontWeight: 900,
              color: 'rgba(30,42,69,0.8)',
              lineHeight: 1,
              userSelect: 'none',
            }}>
              404
            </div>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(245,166,35,0.15)',
              border: '2px solid rgba(245,166,35,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              !
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Event Lost in Space
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 28 }}>
            The page or event you're looking for has moved, expired, or never existed in this campus hub.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Return Home
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/events')}>
              Search Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
