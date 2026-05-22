import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEPARTMENTS } from '../../data/mockData';

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', studentId: '', department: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required';
    if (!form.department) e.department = 'Department is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await signup(form);
    setLoading(false);
    if (result.success) {
      toast.success('Account created!', 'Welcome to AASTU Events Hub');
      navigate('/onboarding');
    } else {
      toast.error('Signup failed', result.error);
    }
  };

  const field = (key, placeholder, type = 'text') => (
    <div className="form-group" style={{ marginBottom: 14 }}>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`form-input ${errors[key] ? 'error' : ''}`}
      />
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0A0F2C', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Logo / home link */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3B6FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AASTU Events Hub</span>
          </Link>
          <div style={{ display: 'block' }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: '#3B6FFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 12px',
          }}>🎓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Join AASTU Events Hub and never miss an event</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {field('name', 'Full Name')}
            {field('email', 'University Email Address', 'email')}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Student ID"
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className={`form-input ${errors.studentId ? 'error' : ''}`}
                />
                {errors.studentId && <span className="form-error">{errors.studentId}</span>}
              </div>
              <div className="form-group">
                <select
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className={`form-select ${errors.department ? 'error' : ''}`}
                >
                  <option value="">Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="form-error">{errors.department}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14, position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ borderRadius: 10, padding: '13px 24px', marginBottom: 16 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#64748B' }}>
              By signing up, you agree to our{' '}
              <Link to="#" style={{ color: '#3B6FFF' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" style={{ color: '#3B6FFF' }}>Privacy Policy</Link>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3B6FFF', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
