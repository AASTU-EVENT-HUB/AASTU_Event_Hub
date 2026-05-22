import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../../context/ToastContext';
import { analyticsAPI, proposalsAPI } from '../../services/api';

export default function AdminAnalyticsPage() {
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          analyticsAPI.getAdmin(),
          proposalsAPI.getAll(),
        ]);
        setAnalytics(aRes.data.analytics);
        setProposals(pRes.data.proposals || []);
      } catch {
        toast.error('Load failed', 'Could not load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerateReport = () => {
    if (!analytics) return;
    const content = [
      'AASTU Events Hub — Analytics Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      '─────────────────────────────',
      `Total Users: ${analytics.totalUsers}`,
      `Total Events: ${analytics.totalEvents}`,
      `Total Registrations: ${analytics.totalRegistrations}`,
      `Total Check-ins: ${analytics.totalCheckins}`,
      '',
      'TOP EVENTS',
      '─────────────────────────────',
      ...(analytics.topEvents || []).map((e, i) => `${i + 1}. ${e.title} — ${e.registered} registrations`),
      '',
      'REGISTRATIONS BY CATEGORY',
      '─────────────────────────────',
      ...(analytics.registrationsByCategory || []).map(c => `${c.category}: ${c.count}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report Generated', 'Analytics report downloaded');
  };

  const pendingProposals = proposals.filter(p => ['submitted', 'under_review'].includes(p.status));

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search platform..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Platform Analytics</h2>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {loading ? 'Loading...' : 'Live data from database'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={handleGenerateReport} disabled={loading}>
                📊 Export Report
              </button>
            </div>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Users', value: analytics?.totalUsers ?? '—', color: '#3B6FFF', icon: '👥' },
              { label: 'Total Events', value: analytics?.totalEvents ?? '—', color: '#22C55E', icon: '📅' },
              { label: 'Registrations', value: analytics?.totalRegistrations ?? '—', color: '#F5A623', icon: '🎟' },
              { label: 'Check-ins', value: analytics?.totalCheckins ?? '—', color: '#A855F7', icon: '✅' },
            ].map(s => (
              <div key={s.label} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Daily registrations chart */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Daily Registrations (Last 7 Days)</h3>
              {analytics?.dailyRegistrations?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics.dailyRegistrations}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B6FFF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B6FFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                    <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="count" stroke="#3B6FFF" fill="url(#regGrad)" strokeWidth={2} name="Registrations" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>
                  {loading ? 'Loading...' : 'No registration data yet'}
                </div>
              )}
            </div>

            {/* Registrations by category */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Registrations by Category</h3>
              {analytics?.registrationsByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.registrationsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                    <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>
                  {loading ? 'Loading...' : 'No category data yet'}
                </div>
              )}
            </div>
          </div>

          {/* Top Events */}
          {analytics?.topEvents?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Top Events by Registration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.topEvents.map((event, i) => {
                  const pct = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
                  return (
                    <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1E2A45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{event.title}</span>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{event.registered}/{event.capacity}</span>
                        </div>
                        <div className="progress-bar" style={{ height: 4 }}>
                          <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? '#EF4444' : pct >= 70 ? '#F5A623' : '#3B6FFF' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#64748B', flexShrink: 0 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Moderation Queue */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A45', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🛡</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Moderation Queue</h3>
              {pendingProposals.length > 0 && (
                <span style={{ background: 'rgba(245,166,35,0.2)', color: '#F5A623', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  {pendingProposals.length} Pending
                </span>
              )}
            </div>
            {pendingProposals.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Organizer</th>
                      <th>Submitted</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProposals.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{item.category}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: '#fff' }}>{item.organizer}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{item.dept || item.department}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{item.submittedAt}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(item.tags || []).map(tag => <span key={tag} className="badge badge-blue" style={{ fontSize: 10 }}>{tag}</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                {loading ? 'Loading...' : '✓ No pending proposals'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
