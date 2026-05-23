import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import { organizerAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ApplyOrganizerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ clubName: '', bio: '' });

  useEffect(() => {
    organizerAPI.getApplicationStatus()
      .then(r => setStatus(r.data.profile || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clubName) { toast.error('Required', 'Club/organization name is required'); return; }
    setSubmitting(true);
    try {
      await organizerAPI.apply(form);
      toast.success('Application submitted!', "You'll be notified once reviewed by admin.");
      setStatus({ application_status: 'pending', club_name: form.clubName });
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not submit application');
    }
    setSubmitting(false);
  };

  const statusConfig = {
    pending: { color: '#F5A623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.3)', icon: '⏳', text: 'Your application is under review. We\'ll notify you once a decision is made.' },
    approved: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: '✅', text: 'Your application was approved! You now have organizer access.' },
    rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '❌', text: 'Your application was not approved.' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C' }}>
      <PublicNavbar />
      <div className="container" style={{ maxWidth: 600, padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Become an Organizer</h1>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>
            Apply to create and manage events on AASTU Event Hub. Organizers can create events, manage registrations, and do check-ins.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748B' }}>Loading...</div>
        ) : status ? (
          <div style={{
            background: statusConfig[status.application_status]?.bg,
            border: `1px solid ${statusConfig[status.application_status]?.border}`,
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{statusConfig[status.application_status]?.icon}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Application {status.application_status === 'pending' ? 'Pending' : status.application_status === 'approved' ? 'Approved' : 'Not Approved'}
            </h2>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 16 }}>{statusConfig[status.application_status]?.text}</p>
            {status.rejection_reason && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>
                Reason: {status.rejection_reason}
              </div>
            )}
            {status.application_status === 'approved' && (
              <button className="btn btn-primary" onClick={() => navigate('/organizer')}>Go to Organizer Dashboard →</button>
            )}
            {status.application_status !== 'approved' && (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            )}
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={user?.name || ''} readOnly style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Club / Organization Name *</label>
                <input className="form-input" value={form.clubName} onChange={e => setForm(p => ({ ...p, clubName: e.target.value }))} placeholder="e.g. AASTU Tech Club, CS Society..." />
              </div>
              <div className="form-group">
                <label className="form-label">Why do you want to be an organizer?</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your experience and what events you plan to organize..." style={{ resize: 'vertical' }} />
              </div>

              <div style={{ background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#94A3B8' }}>
                ℹ️ Your application will be reviewed by an admin. You'll receive a notification with the decision.
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
