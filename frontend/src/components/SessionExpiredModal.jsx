import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SessionExpiredModal({ onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignIn = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#111827', border: '1px solid #1E2A45',
        borderRadius: 20, padding: '36px 32px', maxWidth: 380, width: '90vw',
        zIndex: 2001, textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(245,166,35,0.15)', border: '2px solid rgba(245,166,35,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 16px',
        }}>⏰</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Session Expired</h2>
        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginBottom: 24 }}>
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
        <button className="btn btn-primary btn-full" onClick={handleSignIn} style={{ marginBottom: 10 }}>
          Sign In Again
        </button>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer' }}
        >
          Stay on page
        </button>
      </div>
    </>
  );
}
