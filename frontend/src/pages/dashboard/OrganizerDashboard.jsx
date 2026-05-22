import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import EventCard from '../../components/EventCard';
import { MOCK_EVENTS, MOCK_CHECKIN_STATS, getEventStatus } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = ['My Events', 'Registrations', 'Analytics', 'Announcements'];

const MY_EVENTS = MOCK_EVENTS.slice(0, 4).map(e => ({
  ...e,
  approvalStatus: ['approved', 'approved', 'under_review', 'draft'][MOCK_EVENTS.indexOf(e) % 4],
}));

const APPROVAL_COLORS = {
  approved: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: 'Approved' },
  under_review: { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', label: 'Under Review' },
  draft: { color: '#64748B', bg: 'rgba(100,116,139,0.15)', label: 'Draft' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'Rejected' },
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('My Events');
  const [announcementForm, setAnnouncementForm] = useState({ eventId: '', message: '' });

  const handleSendAnnouncement = () => {
    if (!announcementForm.eventId || !announcementForm.message) {
      toast.warning('Fill all fields', 'Select an event and write a message');
      return;
    }
    toast.success('Announcement sent!', 'All registrants have been notified');
    setAnnouncementForm({ eventId: '', message: '' });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search your events..." />

        <div style={{ padding: '28px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                Organizer Dashboard
              </h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>Welcome back, {user?.name}</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/events/propose')}>
              + Propose Event
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'My Events', value: MY_EVENTS.length, icon: '📅', color: '#3B6FFF' },
              { label: 'Total Registrations', value: '1,240', icon: '👥', color: '#22C55E' },
              { label: 'Pending Approval', value: '1', icon: '⏳', color: '#F5A623' },
              { label: 'Avg Attendance', value: '84%', icon: '📊', color: '#A855F7' },
            ].map(stat => (
              <div key={stat.label} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</span>
                  <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1E2A45', marginBottom: 24 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '10px 18px', background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? '#3B6FFF' : 'transparent'}`,
                color: activeTab === tab ? '#fff' : '#64748B',
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
              }}>{tab}</button>
            ))}
          </div>

          {/* MY EVENTS */}
          {activeTab === 'My Events' && (
            <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MY_EVENTS.map(event => {
                  const ac = APPROVAL_COLORS[event.approvalStatus] || APPROVAL_COLORS.draft;
                  const status = getEventStatus(event);
                  return (
                    <div key={event.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <img src={event.banner} alt={event.title} style={{ width: 72, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{event.title}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ac.bg, color: ac.color }}>
                            {ac.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          📅 {new Date(event.startDate).toLocaleDateString()} · 📍 {event.location} · 👥 {event.registered}/{event.capacity}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/events/${event.id}`)}>View</button>
                        {status === 'live' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
                            onClick={() => navigate(`/admin/scanner/${event.id}`)}>
                            📱 Scanner
                          </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/checkin/${event.id}`)}>
                          Check-in
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REGISTRATIONS */}
          {activeTab === 'Registrations' && (
            <div className="fade-in">
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E2A45', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>All Registrations</span>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    toast.success('Exported', 'Registration list downloaded as CSV');
                  }}>⬇ Export CSV</button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Event</th>
                      <th>Registered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_CHECKIN_STATS.attendees.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={a.avatar} alt={a.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                            <div>
                              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>{a.department}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>HackAASTU 24</td>
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>May 22, 2026</td>
                        <td>
                          <span className={`badge ${a.status === 'checked-in' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                            {a.status === 'checked-in' ? 'Checked In' : 'Registered'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'Analytics' && (
            <div className="fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Check-ins Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MOCK_CHECKIN_STATS.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                      <XAxis dataKey="hour" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" fill="#3B6FFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Event Performance</h3>
                  {MY_EVENTS.slice(0, 3).map(e => {
                    const pct = Math.round((e.registered / e.capacity) * 100);
                    return (
                      <div key={e.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#fff', fontWeight: 500 }}>{e.title.slice(0, 28)}...</span>
                          <span style={{ color: '#3B6FFF', fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 90 ? '#EF4444' : '#3B6FFF' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === 'Announcements' && (
            <div className="fade-in" style={{ maxWidth: 560 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Send Announcement</h3>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Select Event</label>
                  <select className="form-select" value={announcementForm.eventId} onChange={e => setAnnouncementForm(f => ({ ...f, eventId: e.target.value }))}>
                    <option value="">Choose an event...</option>
                    {MY_EVENTS.filter(e => e.approvalStatus === 'approved').map(e => (
                      <option key={e.id} value={e.id}>{e.title} ({e.registered} registrants)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input" rows={4}
                    placeholder="Write your announcement to all registrants..."
                    value={announcementForm.message}
                    onChange={e => setAnnouncementForm(f => ({ ...f, message: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleSendAnnouncement}>
                  📢 Send to All Registrants
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
