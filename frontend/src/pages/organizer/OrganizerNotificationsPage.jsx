import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI, notificationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrganizerNotificationsPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventId: '', title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    organizerAPI.getMyEvents()
      .then(r => setEvents((r.data.events || []).filter(e => e.status === 'approved')))
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error('Missing fields', 'Title and message are required'); return; }
    setSending(true);
    try {
      await notificationsAPI.create({ type: 'announcement', title: form.title, message: form.message, icon: '📢', event: form.eventId });
      toast.success('Sent!', 'Notification sent to registered students');
      setForm(p => ({ ...p, title: '', message: '' }));
    } catch { toast.error('Error', 'Could not send notification'); }
    setSending(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div style={{ padding: 28, flex: 1, maxWidth: 600 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Send Notification</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Notify students registered for your events</p>

          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Event (optional)</label>
                <select className="form-select" value={form.eventId} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))}>
                  <option value="">All my events</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification title..." />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your message..." style={{ resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : '📢 Send Notification'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
