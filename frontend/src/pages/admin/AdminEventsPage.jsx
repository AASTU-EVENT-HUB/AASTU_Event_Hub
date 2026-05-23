import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { eventsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUS_BADGE = { approved: 'badge-green', pending: 'badge-amber', rejected: 'badge-red' };

export default function AdminEventsPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    eventsAPI.getAll({ limit: 100 })
      .then(r => setEvents(r.data.events || []))
      .catch(() => toast.error('Error', 'Could not load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);
  const pendingCount = events.filter(e => e.status === 'pending').length;

  const handleApprove = async (id) => {
    try {
      await eventsAPI.approve(id);
      toast.success('Approved', 'Event is now live');
      load();
    } catch { toast.error('Error', 'Could not approve event'); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Required', 'Please provide a reason'); return; }
    try {
      await eventsAPI.reject(rejectModal, rejectReason);
      toast.success('Rejected', 'Event rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch { toast.error('Error', 'Could not reject event'); }
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeleteConfirm(null);
      toast.success('Deleted', 'Event removed');
    } catch { toast.error('Error', 'Could not delete event'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search events..." />
        <div style={{ padding: 28, flex: 1 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>All Events</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>
                {events.length} events
                {pendingCount > 0 && <span style={{ color: '#F5A623' }}> · {pendingCount} pending approval</span>}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {['all', 'approved', 'pending', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 16px', borderRadius: 8, textTransform: 'capitalize',
                background: filter === f ? '#3B6FFF' : 'transparent',
                border: `1px solid ${filter === f ? '#3B6FFF' : '#1E2A45'}`,
                color: filter === f ? '#fff' : '#94A3B8', fontSize: 13, cursor: 'pointer',
              }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pendingCount > 0 && (
                  <span style={{ marginLeft: 6, background: '#F5A623', color: '#0A0F2C', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Organizer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Registrations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No events found</td></tr>
                  ) : filtered.map(event => (
                    <tr key={event.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{event.title}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>📍 {event.location || 'TBD'}</div>
                        {event.status === 'rejected' && event.rejection_reason && (
                          <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>❌ {event.rejection_reason}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{event.organizer_name || '—'}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>
                        {event.start_date
                          ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[event.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>
                          {event.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#94A3B8' }}>
                        {event.registration_count || 0} / {event.capacity}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {event.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', padding: '4px 10px', fontSize: 11 }}
                                onClick={() => handleApprove(event.id)}
                              >✓ Approve</button>
                              <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 10px', fontSize: 11 }}
                                onClick={() => { setRejectModal(event.id); setRejectReason(''); }}
                              >✕ Reject</button>
                            </>
                          )}
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 8px', fontSize: 11 }}
                            onClick={() => setDeleteConfirm(event.id)}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Event</h3>
              <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Reason *</label>
              <textarea
                className="form-input" rows={3} value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this event is being rejected..."
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

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete Event?</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                This cannot be undone. All registrations will be cancelled.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
