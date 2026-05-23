import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { organizerAPI } from '../../services/api';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerAPI.getAnalytics()
      .then(r => setAnalytics(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'My Events', value: analytics?.totalEvents ?? '—', icon: '📅', color: '#3B6FFF' },
    { label: 'Total Registrations', value: analytics?.totalRegistrations ?? '—', icon: '👥', color: '#22C55E' },
    { label: 'Total Check-ins', value: analytics?.totalCheckins ?? '—', icon: '✅', color: '#F5A623' },
    { label: 'Avg Rating', value: analytics?.avgFeedbackRating ? `${analytics.avgFeedbackRating}★` : '—', icon: '⭐', color: '#EF4444' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search your events..." />
        <div style={{ padding: 28, flex: 1 }}>

          {/* Welcome */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Here's what's happening with your events today.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {stats.map(s => (
              <div key={s.label} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>
                  {loading ? <div className="skeleton" style={{ width: 60, height: 36 }} /> : s.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            {/* My Events table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>My Events</h3>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/organizer/events')}>
                  + Create Event
                </button>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Event</th><th>Status</th><th>Registrations</th><th>Actions</th></tr></thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: 32 }}>Loading...</td></tr>
                    ) : analytics?.events?.length > 0 ? analytics.events.slice(0, 6).map(e => (
                      <tr key={e.id}>
                        <td style={{ color: '#fff', fontWeight: 500 }}>{e.title}</td>
                        <td>
                          <span className={`badge ${e.status === 'approved' ? 'badge-green' : e.status === 'pending' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: 10 }}>
                            {e.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: '#94A3B8' }}>{e.registration_count} / {e.capacity}</td>
                        <td>
                          <button className="btn btn-sm" style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => navigate(`/organizer/checkin/${e.id}`)}>Check-in</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: 32 }}>
                        No events yet. <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate('/organizer/events')}>Create one</button>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Quick Actions</div>
                {[
                  { label: 'Create New Event', icon: '📅', path: '/organizer/events', color: '#3B6FFF' },
                  { label: 'View Registrations', icon: '👥', path: '/organizer/registrations', color: '#22C55E' },
                  { label: 'Check Feedback', icon: '⭐', path: '/organizer/feedback', color: '#F5A623' },
                  { label: 'Suggestions Board', icon: '💡', path: '/organizer/suggestions', color: '#A855F7' },
                ].map(a => (
                  <button key={a.label} onClick={() => navigate(a.path)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid #1E2A45',
                    color: '#94A3B8', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E2A45'; e.currentTarget.style.color = '#94A3B8'; }}
                  >
                    <span style={{ fontSize: 16 }}>{a.icon}</span> {a.label}
                  </button>
                ))}
              </div>

              <div className="card" style={{ background: 'linear-gradient(135deg,rgba(59,111,255,0.12),rgba(168,85,247,0.12))', border: '1px solid rgba(59,111,255,0.25)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>💡 Suggestions Board</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                  Students are suggesting events. Claim popular ideas and turn them into real events!
                </div>
                <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate('/organizer/suggestions')}>
                  View Suggestions →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
