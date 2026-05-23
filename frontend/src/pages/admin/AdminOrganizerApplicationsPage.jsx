import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { adminOrganizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrganizerApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(null);

  const load = (s = statusFilter) => {
    setLoading(true);
    adminOrganizerAPI.getApplications(s)
      .then(r => setApplications(r.data.applications || []))
      .catch(() => toast.error('Error', 'Could not load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await adminOrganizerAPI.approve(id);
      toast.success('Approved!', 'User is now an organizer');
      load();
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Required', 'Please provide a rejection reason'); return; }
    setProcessing(rejectModal);
    try {
      await adminOrganizerAPI.reject(rejectModal, rejectReason);
      toast.success('Rejected', 'Application rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
    setProcessing(null);
  };

  const STATUS_BADGE = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search applications..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Organizer Applications</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Review and approve students who want to become organizers</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '7px 16px', borderRadius: 8, textTransform: 'capitalize',
                background: statusFilter === s ? '#3B6FFF' : 'transparent',
                border: `1px solid ${statusFilter === s ? '#3B6FFF' : '#1E2A45'}`,
                color: statusFilter === s ? '#fff' : '#94A3B8', fontSize: 13, cursor: 'pointer',
              }}>{s}</button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Applicant</th><th>Club / Org</th><th>Department</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No {statusFilter} applications</td></tr>
                  ) : applications.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B6FFF,#6B46C1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {a.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#94A3B8', fontSize: 13 }}>{a.club_name}</td>
                      <td style={{ color: '#94A3B8', fontSize: 13 }}>{a.department}</td>
                      <td style={{ fontSize: 12, color: '#64748B' }}>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge ${STATUS_BADGE[a.application_status]}`} style={{ fontSize: 10 }}>{a.application_status?.toUpperCase()}</span></td>
                      <td>
                        {a.application_status === 'pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', padding: '4px 12px', fontSize: 11 }}
                              onClick={() => handleApprove(a.id)} disabled={processing === a.id}>
                              {processing === a.id ? '...' : '✓ Approve'}
                            </button>
                            <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 12px', fontSize: 11 }}
                              onClick={() => { setRejectModal(a.id); setRejectReason(''); }}>
                              ✕ Reject
                            </button>
                          </div>
                        )}
                        {a.bio && (
                          <div style={{ fontSize: 11, color: '#64748B', maxWidth: 200, marginTop: a.application_status === 'pending' ? 4 : 0 }}>
                            "{a.bio?.slice(0, 60)}{a.bio?.length > 60 ? '...' : ''}"
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Application</h3>
              <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Reason for rejection *</label>
              <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this application is being rejected..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleReject} disabled={!!processing}>
                {processing ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
