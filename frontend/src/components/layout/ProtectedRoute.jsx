import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0F2C' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1E2A45', borderTopColor: '#3B6FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: 14 }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const ROLE_HOME = { admin: '/admin', organizer: '/organizer', student: '/dashboard' };

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={ROLE_HOME[user.role] || '/dashboard'} replace />;
  }

  // Students who haven't completed onboarding
  if (user.role === 'student' && !user.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

export function OrganizerRoute({ children }) {
  return <ProtectedRoute requiredRole="organizer">{children}</ProtectedRoute>;
}

export function StudentRoute({ children }) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}
