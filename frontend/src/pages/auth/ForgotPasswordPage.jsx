import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { DEV_MODE } from '../../data/mockData';

// DEV_MODE OTP — hardcoded for testing without real email service
const DEV_OTP = '123456';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const maskEmail = (e) => {
    const [local, domain] = e.split('@');
    return `${local[0]}***@${domain}`;
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('otp');
    setResendTimer(60);
    toast.success('Code sent!', DEV_MODE ? `DEV: use code ${DEV_OTP}` : `Check ${maskEmail(email)}`);
  };

  // ── Step 2: OTP input handling ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError('');
    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (value && index === 5) {
      const code = [...next].join('');
      if (code.length === 6) verifyOtp(code);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    if (pasted.length === 6) verifyOtp(pasted);
    else inputRefs.current[pasted.length]?.focus();
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    const expected = DEV_MODE ? DEV_OTP : '______'; // real API would verify server-side
    if (code === expected) {
      setStep('reset');
      toast.success('Verified!', 'Now set your new password');
    } else {
      setOtpError('Incorrect code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerifyClick = () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Please enter all 6 digits'); return; }
    verifyOtp(code);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(60);
    toast.info('Code resent', DEV_MODE ? `DEV: use code ${DEV_OTP}` : `New code sent to ${maskEmail(email)}`);
    inputRefs.current[0]?.focus();
  };

  // ── Step 3: Reset password ────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Too short', 'Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mismatch', 'Passwords do not match'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.success('Password reset!', 'You can now sign in with your new password');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0A0F2C', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1a2a6c,#0A0F2C)', border: '1.5px solid rgba(59,111,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>AASTU</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B6FFF', letterSpacing: 1.5 }}>EVENTS HUB</div>
            </div>
          </Link>

          {/* Step icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: step === 'reset' ? 'rgba(34,197,94,0.15)' : 'rgba(59,111,255,0.15)',
            border: `2px solid ${step === 'reset' ? 'rgba(34,197,94,0.4)' : 'rgba(59,111,255,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px',
          }}>
            {step === 'email' ? '🔑' : step === 'otp' ? '📱' : '🔒'}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            {step === 'email' ? 'Forgot password?' : step === 'otp' ? "Verify it's you" : 'Set new password'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {step === 'email' && "Enter your university email and we'll send a verification code"}
            {step === 'otp' && `We sent a 6-digit code to ${maskEmail(email)}`}
            {step === 'reset' && 'Choose a strong password for your account'}
          </p>
        </div>

        <div className="card">
          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">University Email</label>
                <input
                  type="email"
                  placeholder="your@aastu.edu.et"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
              {DEV_MODE && (
                <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#F5A623', marginBottom: 16 }}>
                  🔧 DEV MODE: OTP will be <strong>{DEV_OTP}</strong>
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius: 10 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Sending code...
                  </span>
                ) : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <div>
              <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#fff' }}>{maskEmail(email)}</strong>
              </p>

              {/* 6 OTP boxes */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 48, height: 56,
                      textAlign: 'center',
                      fontSize: 22, fontWeight: 700,
                      background: digit ? 'rgba(59,111,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${otpError ? '#EF4444' : digit ? '#3B6FFF' : '#2A3A55'}`,
                      borderRadius: 12,
                      color: '#fff',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>{otpError}</p>
              )}

              <button
                className="btn btn-primary btn-full"
                onClick={handleVerifyClick}
                disabled={loading || otp.join('').length < 6}
                style={{ borderRadius: 10, marginBottom: 16 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Verifying...
                  </span>
                ) : 'Verify Code'}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center', fontSize: 13, color: '#64748B' }}>
                Didn't receive it?{' '}
                {resendTimer > 0 ? (
                  <span style={{ color: '#94A3B8' }}>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    style={{ background: 'none', border: 'none', color: '#3B6FFF', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'reset' && (
            <form onSubmit={handleReset}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {newPassword && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: newPassword.length >= i * 2 ? (newPassword.length >= 8 ? '#22C55E' : '#F5A623') : '#1E2A45' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: newPassword.length >= 8 ? '#22C55E' : '#F5A623' }}>
                      {newPassword.length < 4 ? 'Weak' : newPassword.length < 8 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`form-input ${confirmPassword && confirmPassword !== newPassword ? 'error' : confirmPassword && confirmPassword === newPassword ? 'success' : ''}`}
                  required
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <span className="form-error">Passwords do not match</span>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius: 10 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#3B6FFF', fontWeight: 600 }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
