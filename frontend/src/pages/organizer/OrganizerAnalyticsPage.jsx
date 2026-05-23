import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrganizerAnalyticsPage() {
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerAPI.getAnalytics()
      .then(r => setAnalytics(r.data.analytics))
      .catch(() => toast.error('Error', 'Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout"><Sidebar />
      <div className="main-content"><Topbar />
        <div style={{ padding: 28, textAlign: 'center', color: '#64748B' }}>Loading analytics...</div>
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Events', value: analytics?.totalEvents || 0, icon: '📅', color: '#3B6FFF' },
    { label: 'Total Registrations', value: analytics?.totalRegistrations || 0, icon: '👥', color: '#22C55E' },
    { label: 'Total Check-ins', value: analytics?.totalCheckins || 0, icon: '✅', color: '#F5A623' },
    { label: 'Avg Rating', value: analytics?.avgFeedbackRating ? `${analytics.avgFeedbackRating}★` : 'N/A', icon: '⭐', color: '#EF4444' },
  ];

  const attendanceRate = analytics?.totalRegistrations > 0
    ? Math.round((analytics.totalCheckins / analytics.totalRegistrations) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Analytics..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Analytics</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Performance overview for your events</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {stats.map(s => (
              <div key={s.label} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Attendance rate */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Overall Attendance Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: attendanceRate >= 70 ? '#22C55E' : '#F5A623' }}>{attendanceRate}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div style={{ height: '100%', width: `${attendanceRate}%`, background: attendanceRate >= 70 ? '#22C55E' : '#F5A623', borderRadius: 5, transition: 'width 1s' }} />
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
              {analytics?.totalCheckins || 0} attended out of {analytics?.totalRegistrations || 0} registered
            </div>
          </div>

          {/* Per-event breakdown */}
          {analytics?.events?.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 16px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Event Breakdown</h3>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Event</th><th>Registrations</th><th>Capacity</th><th>Fill Rate</th></tr></thead>
                  <tbody>
                    {analytics.events.map(e => {
                      const fill = e.capacity > 0 ? Math.round((e.registration_count / e.capacity) * 100) : 0;
                      return (
                        <tr key={e.id}>
                          <td style={{ color: '#fff', fontWeight: 500 }}>{e.title}</td>
                          <td style={{ color: '#94A3B8' }}>{e.registration_count}</td>
                          <td style={{ color: '#94A3B8' }}>{e.capacity}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div style={{ height: '100%', width: `${fill}%`, background: fill >= 80 ? '#EF4444' : fill >= 50 ? '#F5A623' : '#3B6FFF', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 12, color: '#94A3B8' }}>{fill}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
