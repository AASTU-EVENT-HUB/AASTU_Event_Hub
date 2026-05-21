import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { MOCK_EVENTS, getEventStatus, CATEGORIES, DEPARTMENTS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

export default function AdminEventsPage({ openCreate = false }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [showCreate, setShowCreate] = useState(openCreate);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = events.filter(e => {
    if (filter === 'all') return true;
    return getEventStatus(e) === filter;
  });

  const handleDelete = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
    toast.success('Event deleted', 'The event has been removed');
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search events..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Events Management</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>{events.length} total events</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Create Event
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {['all', 'live', 'upcoming', 'ended'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: filter === f ? '#3B6FFF' : 'transparent',
                  border: `1px solid ${filter === f ? '#3B6FFF' : '#1E2A45'}`,
                  color: filter === f ? '#fff' : '#94A3B8',
                  fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? `All (${events.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Events table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Registrations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(event => {
                    const fillPct = Math.round((event.registered / event.capacity) * 100);
                    return (
                      <tr key={event.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={event.banner}
                              alt={event.title}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{event.title}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>📍 {event.location}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue" style={{ fontSize: 10 }}>{event.category}</span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: '#fff', marginBottom: 3 }}>
                            {event.registered}/{event.capacity} ({fillPct}%)
                          </div>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{
                              width: `${fillPct}%`,
                              background: fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F5A623' : '#3B6FFF',
                            }} />
                          </div>
                        </td>
                        <td><StatusBadge event={event} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '5px 10px', fontSize: 12 }}
                              onClick={() => setEditEvent(event)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '5px 10px', fontSize: 12 }}
                              onClick={() => setDeleteConfirm(event.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editEvent) && (
        <EventFormModal
          event={editEvent}
          onClose={() => { setShowCreate(false); setEditEvent(null); }}
          onSave={(data) => {
            if (editEvent) {
              setEvents(prev => prev.map(e => e.id === editEvent.id ? { ...e, ...data } : e));
              toast.success('Event updated', 'Changes saved successfully');
            } else {
              setEvents(prev => [...prev, { ...data, id: 'e' + Date.now(), registered: 0, waitlist: 0 }]);
              toast.success('Event created', 'Your event is now live');
            }
            setShowCreate(false);
            setEditEvent(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete Event?</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                This action cannot be undone. All registrations will be cancelled.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deleteConfirm)}>Delete Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventFormModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    capacity: event?.capacity || 100,
    price: event?.price || 'Free',
    banner: event?.banner || '',
  });

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{event ? 'Edit Event' : 'Create New Event'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter event title" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input type="number" className="form-input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <input type="datetime-local" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <input type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue name and address" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Entry Fee</label>
              <input className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Free or amount in ETB" />
            </div>
            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input className="form-input" value={form.banner} onChange={e => setForm(f => ({ ...f, banner: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
              {event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
