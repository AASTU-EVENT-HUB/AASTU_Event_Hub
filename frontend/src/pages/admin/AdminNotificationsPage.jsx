import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import NotificationEmailCard from '../../components/NotificationEmailCard';
import { MOCK_EVENTS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

const SENT_NOTIFICATIONS = [
  { id: 1, event: 'AASTU Grand Hackathon 2024', type: 'Announcement', message: 'Registration is now open! Secure your spot before it fills up.', sentAt: 'May 12, 10:45 AM', recipients: 1240 },
  { id: 2, event: 'Data Science Workshop', type: 'Reminder', message: 'Event starts tomorrow at 10:00 AM. Don\'t forget to bring your laptop!', sentAt: 'May 11, 3:00 PM', recipients: 58 },
  { id: 3, event: 'Startup Pitch Night', type: 'Waitlist', message: 'A spot just opened up! You have 24 hours to claim it.', sentAt: 'May 10, 9:00 AM', recipients: 12 },
];

export default function AdminNotificationsPage() {
  const toast = useToast();
  const [form, setForm] = useState({ eventId: '', type: 'Announcement', message: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [notifications, setNotifications] = useState(SENT_NOTIFICATIONS);

  const handleSend = () => {
    if (!form.eventId || !form.message) {
      toast.warning('Missing fields', 'Please select an event and write a message');
      return;
    }
    const event = MOCK_EVENTS.find(e => e.id === form.eventId);
    setNotifications(prev => [{
      id: Date.now(),
      event: event?.title || 'Unknown Event',
      type: form.type,
      message: form.message,
      sentAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      recipients: event?.registered || 0,
    }, ...prev]);
    setForm({ eventId: '', type: 'Announcement', message: '' });
    toast.success('Notification sent!', `Sent to ${event?.registered || 0} registrants`);
  };

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
                    {MOCK_EVENTS.map(e => (
                      <option key={e.id} value={e.id}>{e.title} ({e.registered} registrants)</option>
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
                  <button className="btn btn-primary btn-sm" onClick={handleSend}>
                    Send Notification
                  </button>
                </div>
              </div>

              {/* Sent history */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A45' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Sent Notifications</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Sent At</th>
                        <th>Recipients</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(n => (
                        <tr key={n.id}>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{n.event}</div>
                            <div style={{ fontSize: 11, color: '#64748B', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.message}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${n.type === 'Announcement' ? 'badge-blue' : n.type === 'Reminder' ? 'badge-amber' : n.type === 'Waitlist' ? 'badge-gold' : 'badge-red'}`} style={{ fontSize: 10 }}>
                              {n.type}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{n.sentAt}</td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{n.recipients}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right — email preview */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Email Preview</div>
              <NotificationEmailCard
                eventName={MOCK_EVENTS.find(e => e.id === form.eventId)?.title || 'AI Ethics Workshop'}
                eventDate="Nov 15, 2024"
                eventTime="10:00 AM"
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
              eventName={MOCK_EVENTS.find(e => e.id === form.eventId)?.title}
              eventDate="Nov 15, 2024"
              eventTime="10:00 AM"
            />
          </div>
        </div>
      )}
    </div>
  );
}
