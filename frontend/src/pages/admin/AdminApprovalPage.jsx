import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import { proposalsAPI } from '../../services/api';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#64748B', bg: 'rgba(100,116,139,0.15)' },
  submitted: { label: 'Submitted', color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)' },
  under_review: { label: 'Under Review', color: '#F5A623', bg: 'rgba(245,166,35,0.15)' },
  approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  changes_requested: { label: 'Changes Requested', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
};

export default function AdminApprovalPage() {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [changesModal, setChangesModal] = useState(null);
  const [changesNote, setChangesNote] = useState('');

  useEffect(() => {
    proposalsAPI.getAll()
      .then(res => setProposals(res.data.proposals || []))
      .catch(() => toast.error('Load failed', 'Could not load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = proposals.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const updateStatus = async (id, status, extra = {}) => {
    try {
      const res = await proposalsAPI.update(id, { status, ...extra });
      setProposals(prev => prev.map(p => p.id === id ? res.data.proposal : p));
    } catch {
      toast.error('Update failed', 'Could not update proposal status');
    }
  };

  const handleApprove = async (p) => {
    await updateStatus(p.id, 'approved');
    setSelected(null);
    toast.success('Event Approved', `"${p.title}" is now live on the platform`);
    addNotification({ type: 'approval', title: 'Event Approved', message: `"${p.title}" has been approved`, icon: '✅' });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Reason required', 'Please provide a rejection reason'); return; }
    await updateStatus(rejectModal.id, 'rejected', { rejectionReason: rejectReason });
    setRejectModal(null);
    setRejectReason('');
    setSelected(null);
    toast.info('Event Rejected', 'Organizer has been notified');
  };

  const handleRequestChanges = async () => {
    if (!changesNote.trim()) { toast.error('Note required', 'Please describe what changes are needed'); return; }
    await updateStatus(changesModal.id, 'changes_requested', { changesNote });
    setChangesModal(null);
    setChangesNote('');
    setSelected(null);
    toast.info('Changes Requested', 'Organizer has been notified');
  };

  const pendingCount = proposals.filter(p => ['submitted', 'under_review'].includes(p.status)).length;

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search event proposals..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Event Approval Queue</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>
                {loading ? 'Loading...' : `${pendingCount} proposal${pendingCount !== 1 ? 's' : ''} awaiting review`}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${proposals.length})` },
              { id: 'submitted', label: `Submitted (${proposals.filter(p => p.status === 'submitted').length})` },
              { id: 'under_review', label: `Under Review (${proposals.filter(p => p.status === 'under_review').length})` },
              { id: 'approved', label: `Approved (${proposals.filter(p => p.status === 'approved').length})` },
              { id: 'rejected', label: `Rejected (${proposals.filter(p => p.status === 'rejected').length})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: filterStatus === f.id ? '#3B6FFF' : 'transparent',
                  border: `1px solid ${filterStatus === f.id ? '#3B6FFF' : '#1E2A45'}`,
                  color: filterStatus === f.id ? '#fff' : '#94A3B8',
                  fontSize: 12, cursor: 'pointer',
                }}
              >{f.label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 20 }}>
            {/* Proposals list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(p => {
                const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.submitted;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelected(p.id === selected ? null : p.id)}
                    style={{
                      background: '#111827',
                      border: `1px solid ${selected === p.id ? '#3B6FFF' : '#1E2A45'}`,
                      borderRadius: 14, padding: '16px 20px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', gap: 16, alignItems: 'flex-start',
                    }}
                  >
                    {p.banner && (
                      <img src={p.banner} alt={p.title} style={{ width: 72, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.title}</div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                          background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 8,
                        }}>{sc.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                        {p.organizer} · {p.dept || p.department}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94A3B8' }}>
                        {p.date && <span>📅 {p.date}</span>}
                        {p.venue && <span>📍 {p.venue}</span>}
                        {p.expectedAttendance && <span>👥 {p.expectedAttendance} expected</span>}
                      </div>
                      {p.status === 'rejected' && p.rejectionReason && (
                        <div style={{ marginTop: 6, fontSize: 11, color: '#EF4444', background: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '4px 8px' }}>
                          ✕ {p.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No proposals here</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>Try a different filter</div>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (() => {
              const p = proposals.find(x => x.id === selected);
              if (!p) return null;
              const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.submitted;
              return (
                <div style={{ position: 'sticky', top: 80 }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {p.banner && <img src={p.banner} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', flex: 1 }}>{p.title}</h3>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 8 }}>{sc.label}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                        {[
                          { icon: '👤', label: 'Organizer', value: p.organizer },
                          { icon: '🏛', label: 'Department', value: p.dept || p.department },
                          p.date && { icon: '📅', label: 'Date & Time', value: `${p.date}${p.time ? ` at ${p.time}` : ''}` },
                          p.venue && { icon: '📍', label: 'Venue', value: p.venue },
                          p.expectedAttendance && { icon: '👥', label: 'Expected', value: `${p.expectedAttendance} attendees` },
                          { icon: '🏷', label: 'Category', value: p.category },
                          p.submittedAt && { icon: '🕐', label: 'Submitted', value: p.submittedAt },
                        ].filter(Boolean).map(row => (
                          <div key={row.label} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                            <span style={{ color: '#64748B', width: 80, flexShrink: 0 }}>{row.icon} {row.label}</span>
                            <span style={{ color: '#fff' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {p.description && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Description</div>
                          <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{p.description}</p>
                        </div>
                      )}

                      {p.safetyNotes && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Safety Notes</div>
                          <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{p.safetyNotes}</p>
                        </div>
                      )}

                      {p.tags && p.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                          {p.tags.map(tag => <span key={tag} className="badge badge-blue" style={{ fontSize: 10 }}>{tag}</span>)}
                        </div>
                      )}

                      {/* Actions */}
                      {['submitted', 'under_review'].includes(p.status) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button className="btn btn-primary btn-full btn-sm" onClick={() => handleApprove(p)} style={{ background: '#22C55E', borderColor: '#22C55E' }}>
                            ✓ Approve Event
                          </button>
                          <button className="btn btn-outline btn-full btn-sm" onClick={() => setChangesModal(p)} style={{ borderColor: '#A855F7', color: '#A855F7' }}>
                            ✏ Request Changes
                          </button>
                          <button className="btn btn-outline btn-full btn-sm" onClick={() => setRejectModal(p)} style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                            ✕ Reject Event
                          </button>
                        </div>
                      )}

                      {p.status === 'approved' && (
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', textAlign: 'center', fontSize: 13, color: '#22C55E', fontWeight: 600 }}>
                          ✓ This event is live on the platform
                        </div>
                      )}

                      {p.status === 'rejected' && (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>Rejection Reason:</div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.rejectionReason}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Event</h3>
              <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
              Provide a clear reason so the organizer can improve and resubmit.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Rejection Reason</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="e.g. Venue capacity exceeded. Please select a larger venue..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleReject}>Reject Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {changesModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Request Changes</h3>
              <button className="modal-close" onClick={() => setChangesModal(null)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
              Describe what needs to be changed before this event can be approved.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Changes Required</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="e.g. Please add a detailed safety plan..."
                value={changesNote}
                onChange={e => setChangesNote(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setChangesModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleRequestChanges}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
