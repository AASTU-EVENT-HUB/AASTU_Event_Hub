import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI, eventsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, DEPARTMENTS } from '../../data/mockData';

const STATUS_BADGE = {
  approved: 'badge-green',
  pending: 'badge-amber',
  rejected: 'badge-red',
};

export default function OrganizerEventsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    organizerAPI.getMyEvents()
      .then(r => setEvents(r.data.events || []))
      .catch(() => toast.error('Error', 'Could not load events'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  const handleDelete = async () => {
    try {
      await eventsAPI.delete(deleteId);
      setEvents(prev => prev.filter(e => e.id !== deleteId));
      toast.success('Deleted', 'Event removed');
    } catch { toast.error('Error', 'Could not delete event'); }
    setDeleteId(null);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search your events..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Events</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>{events.length} total events</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditEvent(null); setShowForm(true); }}>+ Create Event</button>
          </div>

          {/* Info banner */}
          <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#F5A623' }}>
            ℹ️ New events require admin approval before they're visible to students. You'll be notified once reviewed.
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {['all', 'approved', 'pending', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 16px', borderRadius: 8,
                background: filter === f ? '#3B6FFF' : 'transparent',
                border: `1px solid ${filter === f ? '#3B6FFF' : '#1E2A45'}`,
                color: filter === f ? '#fff' : '#94A3B8',
                fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {f === 'all' ? `All (${events.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${events.filter(e => e.status === f).length})`}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Registrations</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>
                      No events yet. <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => setShowForm(true)}>Create your first event</button>
                    </td></tr>
                  ) : filtered.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>📍 {e.location || 'TBD'}</div>
                        {e.status === 'rejected' && e.rejection_reason && (
                          <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>❌ {e.rejection_reason}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>
                        {e.start_date ? new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>{e.status?.toUpperCase()}</span></td>
                      <td style={{ color: '#94A3B8', fontSize: 13 }}>{e.registration_count || 0} / {e.capacity}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {e.status === 'approved' && (
                            <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', padding: '4px 10px', fontSize: 11 }}
                              onClick={() => navigate(`/organizer/checkin/${e.id}`)}>Check-in</button>
                          )}
                          <button className="btn btn-sm" style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => { setEditEvent(e); setShowForm(true); }}>Edit</button>
                          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => setDeleteId(e.id)}>Delete</button>
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

      {showForm && (
        <EventFormModal
          event={editEvent}
          onClose={() => { setShowForm(false); setEditEvent(null); }}
          onSaved={() => { setShowForm(false); setEditEvent(null); load(); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete Event?</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>This cannot be undone. All registrations will be cancelled.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventFormModal({ event, onClose, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || '',
    department: event?.department || '',
    startDate: event?.start_date ? event.start_date.slice(0, 16) : '',
    endDate: event?.end_date ? event.end_date.slice(0, 16) : '',
    location: event?.location || '',
    capacity: event?.capacity || 100,
    bannerImage: event?.banner_image || '',
    isTeamEvent: Boolean(event?.is_team_event),
    tags: event?.tags || '',
  });

  const f = (key, label, type = 'text', opts = {}) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {type === 'textarea' ? (
        <textarea className="form-input" rows={3} value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={{ resize: 'vertical' }} placeholder={opts.placeholder} />
      ) : type === 'select' ? (
        <select className="form-select" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
          <option value="">Select {label}</option>
          {opts.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className="form-input" value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
          placeholder={opts.placeholder} />
      )}
    </div>
  );

  const handleSubmit = async () => {
    if (!form.title || !form.startDate || !form.location) {
      toast.error('Missing fields', 'Title, start date and location are required');
      return;
    }
    setLoading(true);
    try {
      if (event) {
        await eventsAPI.update(event.id, form);
        toast.success('Updated', 'Event updated successfully');
      } else {
        await eventsAPI.create(form);
        toast.success('Submitted!', 'Your event is pending admin approval');
      }
      onSaved();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not save event');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3 className="modal-title">{event ? 'Edit Event' : 'Create New Event'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {!event && (
          <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#F5A623' }}>
            ⏳ Your event will be submitted for admin approval before going live.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {f('title', 'Event Title', 'text', { placeholder: 'Enter event title' })}
          {f('description', 'Description', 'textarea', { placeholder: 'Describe the event...' })}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('category', 'Category', 'select', { options: CATEGORIES })}
            {f('department', 'Department', 'select', { options: DEPARTMENTS })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('startDate', 'Start Date & Time', 'datetime-local')}
            {f('endDate', 'End Date & Time', 'datetime-local')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {f('location', 'Location', 'text', { placeholder: 'Venue name' })}
            {f('capacity', 'Capacity', 'number')}
          </div>
          {f('bannerImage', 'Banner Image URL', 'text', { placeholder: 'https://...' })}
          {f('tags', 'Tags (comma separated)', 'text', { placeholder: 'AI, Workshop, Tech' })}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isTeamEvent} onChange={e => setForm(p => ({ ...p, isTeamEvent: e.target.checked }))} style={{ accentColor: '#3B6FFF' }} />
            Team Event (students register as teams)
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : event ? 'Save Changes' : 'Submit for Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
