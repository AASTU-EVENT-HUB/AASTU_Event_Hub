import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Email sent!', 'Check your inbox for reset instructions');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0A0F2C', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / home link */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3B6FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AASTU Events Hub</span>
          </Link>

          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(59,111,255,0.15)', border: '2px solid rgba(59,111,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 16px',
          }}>🔑</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {sent ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your university email and we'll send you a reset link"}
          </p>
        </div>

        <div className="card">
          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">University Email</label>
                <input
                  type="email"
                  placeholder="your@aastu.edu.et"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ borderRadius: 10 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 20 }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button className="btn btn-primary btn-full" onClick={() => navigate('/login')} style={{ marginBottom: 10 }}>
                Back to Sign In
              </button>
              <button className="btn btn-outline btn-full" onClick={() => setSent(false)}>
                Try again
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#3B6FFF', fontWeight: 600 }}>← Back to Sign In</Link>
          <span style={{ margin: '0 12px', color: '#1E2A45' }}>·</span>
          <Link to="/" style={{ color: '#64748B' }}>Home</Link>
        </p>
      </div>
    </div>
  );
}
