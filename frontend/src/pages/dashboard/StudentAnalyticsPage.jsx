import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3B6FFF', '#22C55E', '#F5A623', '#A855F7', '#EF4444', '#06B6D4'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94A3B8' },
};

export default function StudentAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getStudent()
      .then(res => setAnalytics(res.data.analytics))
      .catch(() => toast.error('Load failed', 'Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Events Registered', value: analytics?.totalRegistered ?? '—', icon: '🎫', color: '#3B6FFF' },
    { label: 'Events Attended', value: analytics?.totalAttended ?? '—', icon: '✅', color: '#22C55E' },
    { label: 'Categories Explored', value: analytics?.categoryBreakdown?.length ?? '—', icon: '🏛', color: '#F5A623' },
    { label: 'Event Credits', value: user?.eventCredits?.toLocaleString() || '—', icon: '⚡', color: '#A855F7' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Analytics..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Analytics</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Your personal event activity and engagement stats</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {stats.map(s => (
              <div key={s.label} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{loading ? '...' : s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Monthly activity */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Monthly Activity</h3>
              {analytics?.monthlyActivity?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="events" fill="#3B6FFF" radius={[4, 4, 0, 0]} name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>
                  {loading ? 'Loading...' : 'No activity data yet'}
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Events by Category</h3>
              {analytics?.categoryBreakdown?.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={analytics.categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {analytics.categoryBreakdown.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {analytics.categoryBreakdown.map((c, i) => (
                      <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#94A3B8', flex: 1 }}>{c.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>
                  {loading ? 'Loading...' : 'No category data yet'}
                </div>
              )}
            </div>
          </div>

          {/* Attendance history */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Attendance History</h3>
              <span style={{ fontSize: 12, color: '#64748B' }}>{analytics?.history?.length || 0} events</span>
            </div>
            {analytics?.history?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.history.map((r, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#0D1224', borderRadius: 10, border: '1px solid #1E2A45', cursor: 'pointer' }}
                    onClick={() => navigate(`/events`)}
                  >
                    {r.banner && (
                      <img src={r.banner} alt={r.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        📅 {r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        {r.location && ` · 📍 ${r.location}`}
                      </div>
                    </div>
                    <span className={`badge ${r.status === 'checked_in' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                      {r.status === 'checked_in' ? 'ATTENDED' : 'REGISTERED'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <p>{loading ? 'Loading...' : 'No attendance history yet. Start attending events!'}</p>
                {!loading && (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/events')}>
                    Browse Events
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
