import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/**
 * Landing page for Google OAuth callback.
 * The backend redirects here with ?token=...&user=...
 * We store them and redirect to the appropriate dashboard.
 */
export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    const error = params.get('error');

    if (error) {
      const messages = {
        oauth_not_configured: 'Google login is not configured yet. Please use email/password.',
        google_auth_failed: 'Google authentication failed. Please try again.',
      };
      toast.error('Google Login Failed', messages[error] || 'Authentication error');
      navigate('/login');
      return;
    }

    if (!token || !userRaw) {
      toast.error('Login Error', 'Missing authentication data from Google');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      loginWithToken(token, user);
      toast.success('Welcome!', `Signed in as ${user.name}`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.isFirstLogin) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch {
      toast.error('Login Error', 'Failed to process Google login');
      navigate('/login');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0F2C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(59,111,255,0.3)',
        borderTopColor: '#3B6FFF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94A3B8', fontSize: 14 }}>Completing Google sign-in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
