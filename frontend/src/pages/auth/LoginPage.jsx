import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import Logo from '../../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  // Log API URL in dev for debugging
  if (import.meta.env.DEV) {
    console.log('[LoginPage] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
  }

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!', `Signed in as ${result.user.name}`);
      const { role, onboardingComplete } = result.user;
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'organizer') navigate('/organizer', { replace: true });
      else if (!onboardingComplete) navigate('/onboarding', { replace: true });
      else {
        const destination = from === '/login' || from === '/' ? '/dashboard' : from;
        navigate(destination, { replace: true });
      }
    } else {
      toast.error('Login failed', result.error || 'Invalid credentials');
      setErrors({ general: result.error || 'Invalid email or password' });
    }
  };

  const fillDemo = (role) => {
    if (role === 'student') setForm({ email: 'student@aastu.edu.et', password: '12345678', remember: false });
    else if (role === 'organizer') setForm({ email: 'organizer@aastu.edu.et', password: '12345678', remember: false });
    else setForm({ email: 'admin@aastu.edu.et', password: '12345678', remember: false });
  };

  // If navigated with demo credentials (from HomePage), prefill the form
  useEffect(() => {
    const demo = location.state?.demo;
    if (demo && demo.email) {
      setForm({ email: demo.email, password: demo.password || '', remember: false });
      // small delay to allow UI to mount before submitting automatically
      if (demo.autoSubmit) {
        setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 60);
      }
    }
    // clean up state so back/refresh doesn't auto-fill again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A0F2C' }}>
      {/* Left — hero panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '48px', minHeight: '100vh',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,15,44,0.97) 0%, rgba(10,15,44,0.6) 50%, rgba(10,15,44,0.2) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
            <Logo size={36} showText />
          </Link>

          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Elevate Your<br />Academic Experience.
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, maxWidth: 380, marginBottom: 32 }}>
            Access the university's central portal for hackathons, symposiums, and professional networking events.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `hsl(${i * 60}, 60%, 50%)`,
                  border: '2px solid #0A0F2C', marginLeft: i > 1 ? -8 : 0, overflow: 'hidden',
                }}>
                  <img src={`https://i.pravatar.cc/28?img=${i + 10}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>+4,481 students attending this week</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: 32, display: 'flex', gap: 16 }}>
          {['Privacy Policy', 'Terms of Service', 'Help Center'].map(item => (
            <Link key={item} to="#" style={{ fontSize: 11, color: '#64748B', textDecoration: 'none' }}>{item}</Link>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        width: 480, minWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px', background: 'rgba(10,15,44,0.98)', borderLeft: '1px solid #1E2A45',
      }}>
        <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 6 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 28 }}>
            Please enter your credentials to access the portal
          </p>

          {/* Google SSO */}
          <button
            type="button"
            className="btn btn-outline btn-full"
            style={{ marginBottom: 20, gap: 10 }}
            onClick={() => authAPI.googleLogin()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#1E2A45' }} />
            <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: '#1E2A45' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16,
              }}>{errors.general}</div>
            )}

            <div className="form-group" style={{ marginBottom: 14 }}>
              <input
                type="email" placeholder="University Email Address"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 14, position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}>
                {showPass ? '🙈' : '👁'}
              </button>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.remember} onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))} style={{ accentColor: '#3B6FFF' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#3B6FFF', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius: 10, padding: '13px 24px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
            New to the portal?{' '}
            <Link to="/signup" style={{ color: '#3B6FFF', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
          </p>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)',
            borderRadius: 10, fontSize: 12, color: '#94A3B8',
          }}>
            <div style={{ fontWeight: 600, color: '#3B6FFF', marginBottom: 6 }}> Demo credentials</div>
            <div style={{ marginBottom: 4 }}>Student: <span style={{ color: '#fff' }}>student@aastu.edu.et</span> / <span style={{ color: '#fff' }}>12345678</span></div>
            <div style={{ marginBottom: 4 }}>Organizer: <span style={{ color: '#fff' }}>organizer@aastu.edu.et</span> / <span style={{ color: '#fff' }}>12345678</span></div>
            <div style={{ marginBottom: 8 }}>Admin: <span style={{ color: '#fff' }}>admin@aastu.edu.et</span> / <span style={{ color: '#fff' }}>12345678</span></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('student')}>Student</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('organizer')} style={{ borderColor: '#F5A623', color: '#F5A623' }}>Organizer</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('admin')} style={{ borderColor: '#EF4444', color: '#EF4444' }}>Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
