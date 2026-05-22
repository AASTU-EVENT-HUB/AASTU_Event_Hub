import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/layout/PublicNavbar';

export default function PermissionDeniedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          {/* Geometric icon */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(239,68,68,0.3)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 16, border: '2px solid rgba(239,68,68,0.2)', borderRadius: '50%' }} />
            <div style={{
              position: 'absolute', inset: 28,
              background: 'rgba(239,68,68,0.15)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>🔒</div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Access Denied</h1>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 24 }}>
            You don't have permission to access this page.
            {user ? ` Your current role is "${user.role}".` : ' Please sign in to continue.'}
          </p>

          <div style={{
            background: '#111827', border: '1px solid #1E2A45',
            borderRadius: 12, padding: '14px 18px', marginBottom: 24,
            fontSize: 13, color: '#64748B', textAlign: 'left',
          }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Role permissions:</div>
            {[
              { role: 'Student', perms: 'Browse events, register, join waitlists, manage profile' },
              { role: 'Organizer', perms: 'All student permissions + create/manage events, QR scanner' },
              { role: 'Admin', perms: 'Full platform control, user management, analytics' },
            ].map(r => (
              <div key={r.role} style={{ marginBottom: 6, display: 'flex', gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                  background: r.role === 'Admin' ? 'rgba(239,68,68,0.15)' : r.role === 'Organizer' ? 'rgba(245,166,35,0.15)' : 'rgba(59,111,255,0.15)',
                  color: r.role === 'Admin' ? '#EF4444' : r.role === 'Organizer' ? '#F5A623' : '#3B6FFF',
                  flexShrink: 0, alignSelf: 'flex-start', marginTop: 1,
                }}>{r.role}</span>
                <span style={{ fontSize: 12 }}>{r.perms}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate(user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login')}>
              {user ? 'Go to Dashboard' : 'Sign In'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}
