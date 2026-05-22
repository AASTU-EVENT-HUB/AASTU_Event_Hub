import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import NotificationEmailCard from '../../components/NotificationEmailCard';
import { useToast } from '../../context/ToastContext';
import { notificationsAPI, eventsAPI } from '../../services/api';

export default function AdminNotificationsPage() {
  const toast = useToast();
  const [form, setForm] = useState({ eventId: '', type: 'Announcement', message: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [nRes, eRes] = await Promise.all([
          notificationsAPI.getAll(),
          eventsAPI.getAll({ limit: 100 }),
        ]);
        setNotifications(nRes.data.notifications || []);
        setEvents(eRes.data.events || []);
      } catch {
        toast.error('Load failed', 'Could not load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!form.eventId || !form.message) {
      toast.warning('Missing fields', 'Please select an event and write a message');
      return;
    }
    const event = events.find(e => String(e.id) === String(form.eventId));
    setSending(true);
    try {
      const sentAt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const res = await notificationsAPI.create({
        type: form.type.toLowerCase(),
        title: `${form.type}: ${event?.title || 'Event'}`,
        message: form.message,
        icon: form.type === 'Announcement' ? '📢' : form.type === 'Reminder' ? '⏰' : form.type === 'Waitlist' ? '⏳' : '❌',
        event: { id: event?.id, title: event?.title },
        sentAt,
      });
      setNotifications(prev => [res.data.notification, ...prev]);
      setForm({ eventId: '', type: 'Announcement', message: '' });
      toast.success('Notification sent!', `Sent to ${event?.registration_count || 0} registrants`);
    } catch {
      toast.error('Send failed', 'Could not send notification');
    } finally {
      setSending(false);
    }
  };

  const selectedEvent = events.find(e => String(e.id) === String(form.eventId));

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search notifications..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Notifications</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
            {/* Left — compose + history */}
            <div>
              {/* Compose */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Send Announcement</h3>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Select Event</label>
                  <select
                    className="form-select"
                    value={form.eventId}
                    onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}
                  >
                    <option value="">Choose an event...</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.registration_count || 0} registrants)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Notification Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Announcement', 'Reminder', 'Waitlist', 'Cancellation'].map(type => (
                      <button
                        key={type}
                        onClick={() => setForm(f => ({ ...f, type }))}
                        style={{
                          padding: '6px 12px', borderRadius: 8,
                          background: form.type === type ? '#3B6FFF' : 'transparent',
                          border: `1px solid ${form.type === type ? '#3B6FFF' : '#1E2A45'}`,
                          color: form.type === type ? '#fff' : '#94A3B8',
                          fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Write your announcement message..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                  <span className="form-hint">{form.message.length}/500 characters</span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowPreview(true)}>
                    Preview Email
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Notification'}
                  </button>
                </div>
              </div>

              {/* Sent history */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A45' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    Sent Notifications {loading && <span style={{ fontSize: 12, color: '#64748B' }}>Loading...</span>}
                  </h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Message</th>
                        <th>Type</th>
                        <th>Sent At</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(n => (
                        <tr key={n.id}>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: '#64748B', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.message}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${n.type === 'announcement' ? 'badge-blue' : n.type === 'reminder' ? 'badge-amber' : n.type === 'waitlist' ? 'badge-gold' : 'badge-red'}`} style={{ fontSize: 10 }}>
                              {n.type}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{n.sentAt || n.time}</td>
                          <td>
                            <button
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14 }}
                              onClick={async () => {
                                await notificationsAPI.delete(n.id);
                                setNotifications(prev => prev.filter(x => x.id !== n.id));
                              }}
                            >×</button>
                          </td>
                        </tr>
                      ))}
                      {!loading && notifications.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>No notifications sent yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right — email preview */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Email Preview</div>
              <NotificationEmailCard
                eventName={selectedEvent?.title || 'Select an event'}
                eventDate={selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                eventTime={selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                hoursLeft={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">Email Preview</h3>
              <button className="modal-close" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <NotificationEmailCard
              eventName={selectedEvent?.title}
              eventDate="TBD"
              eventTime="TBD"
            />
          </div>
        </div>
      )}
    </div>
  );
}
