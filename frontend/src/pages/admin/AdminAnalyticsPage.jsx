import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../../context/ToastContext';

const WEEKLY_DATA = [
  { day: 'MON', students: 120, faculty: 40 },
  { day: 'TUE', students: 280, faculty: 80 },
  { day: 'WED', students: 380, faculty: 100 },
  { day: 'THU', students: 520, faculty: 140 },
  { day: 'FRI', students: 680, faculty: 180 },
];

const TODAY_DATA = [
  { day: '8AM', students: 20, faculty: 5 },
  { day: '10AM', students: 65, faculty: 15 },
  { day: '12PM', students: 120, faculty: 30 },
  { day: '2PM', students: 95, faculty: 25 },
  { day: '4PM', students: 140, faculty: 40 },
];

const MONTH_DATA = [
  { day: 'W1', students: 420, faculty: 110 },
  { day: 'W2', students: 680, faculty: 180 },
  { day: 'W3', students: 520, faculty: 140 },
  { day: 'W4', students: 780, faculty: 200 },
];

const MODERATION_QUEUE = [
  { id: 'EV-B8231', name: 'AI & Robotics Workshop 2024', organizer: 'Dr. Abebe Bekele', dept: 'Dept. of Mechatronics', submitted: 'May 12, 10:45 AM', tags: ['Workshop', 'STEM'] },
  { id: 'EV-90124', name: 'Grand Innovation Expo', organizer: 'Informatics Society', dept: 'Student Union', submitted: 'May 12, 09:12 AM', tags: ['Exhibition', 'Public'] },
];

export default function AdminAnalyticsPage() {
  const toast = useToast();
  const [dateRange, setDateRange] = useState('week');

  const chartData = dateRange === 'today' ? TODAY_DATA : dateRange === 'month' ? MONTH_DATA : WEEKLY_DATA;

  const handleGenerateReport = () => {
    const content = [
      'AASTU Events Hub — Weekly Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      '─────────────────────────────',
      'Total Registrations: 4,829',
      'Attendance Rate: 84.2%',
      'Active Events: 12',
      '',
      'TOP EVENTS',
      '─────────────────────────────',
      '1. AASTU Grand Hackathon 2024 — 458 registrations',
      '2. Data Science Workshop — 58 registrations',
      '3. Drama Society Annual Play — 312 registrations',
      '',
      'DEPARTMENT ENGAGEMENT',
      '─────────────────────────────',
      'Computer Science: 38%',
      'Software Engineering: 24%',
      'Electrical Engineering: 18%',
      'Mechanical Engineering: 12%',
      'Other: 8%',
      '',
      'WAITLIST STATISTICS',
      '─────────────────────────────',
      'Total waitlisted students: 47',
      'Avg waitlist position: 6.2',
      '',
      'QR SCAN TOTALS',
      '─────────────────────────────',
      'Total scans: 3,124',
      'Successful: 3,086 (98.7%)',
      'Failed: 38 (1.3%)',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report Generated', 'Weekly report downloaded successfully');
  };

  const handleExportHealth = () => {
    const content = [
      'AASTU Events Hub — Platform Health Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'INFRASTRUCTURE',
      '─────────────────────────────',
      'API Uptime: 99.98%',
      'Avg Response Time: 42ms',
      'Peak Response Time: 120ms',
      'Active Clusters: 14',
      '',
      'TRAFFIC',
      '─────────────────────────────',
      'Requests/Hour: 842',
      'Active Users (24h): 1,204',
      'Registration Traffic: High',
      '',
      'ERRORS',
      '─────────────────────────────',
      'Error Rate: 0.12%',
      'Critical Logs: 12',
      'QR Scan Success Rate: 98.7%',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Health Report Exported', 'Platform health report downloaded');
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search platform..." />

        <div style={{ padding: '28px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Platform Health</h2>
              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', display: 'inline-block' }} />
                Last updated: 2 minutes ago
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Date range */}
              <div style={{ display: 'flex', gap: 4, background: '#0D1224', border: '1px solid #1E2A45', borderRadius: 10, padding: 4 }}>
                {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setDateRange(r.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 7, fontSize: 12,
                      background: dateRange === r.id ? '#3B6FFF' : 'transparent',
                      border: 'none', color: dateRange === r.id ? '#fff' : '#94A3B8', cursor: 'pointer',
                    }}
                  >{r.label}</button>
                ))}
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleGenerateReport}>📊 Weekly Report</button>
              <button className="btn btn-outline btn-sm" onClick={handleExportHealth}>⬇ Health Report</button>
            </div>
          </div>

          {/* Health metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Server Uptime</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>99.98%</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {[60, 75, 65, 80, 70, 85, 95].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h * 0.5, background: i === 6 ? '#fff' : '#2A3A55', borderRadius: 2, alignSelf: 'flex-end' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#22C55E' }}>↗ +0.02% from yesterday</div>
            </div>

            <div className="card">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>API Latency</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#F5A623', marginBottom: 8 }}>42ms</div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                  <span>0ms</span><span>Peak: 120ms</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '35%', background: '#F5A623' }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Global average across 14 clusters</div>
            </div>

            <div className="card">
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Error Rate</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#EF4444', marginBottom: 8 }}>0.12%</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>842</div><div style={{ fontSize: 11, color: '#64748B' }}>REQ/HOUR</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>12</div><div style={{ fontSize: 11, color: '#64748B' }}>CRITICAL LOGS</div></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 24 }}>
            {/* Chart */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                Registrations by Dept — {dateRange === 'today' ? 'Today' : dateRange === 'month' ? 'This Month' : 'This Week'}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="students" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B6FFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B6FFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="faculty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                  <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="students" stroke="#3B6FFF" fill="url(#students)" strokeWidth={2} />
                  <Area type="monotone" dataKey="faculty" stroke="#F5A623" fill="url(#faculty)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* User Types */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>User Types</h3>
              {[
                { label: 'Students', value: '12,402', color: '#3B6FFF', pct: 89 },
                { label: 'Faculty', value: '1,105', color: '#F5A623', pct: 8 },
                { label: 'Organizers', value: '342', color: '#A855F7', pct: 3 },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.value}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #1E2A45' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>13,849</div>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Platform Participants</div>
              </div>
            </div>
          </div>

          {/* Moderation Queue */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A45', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🛡</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Moderation Queue</h3>
              <span style={{ background: 'rgba(245,166,35,0.2)', color: '#F5A623', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>4 Pending</span>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Organizer</th>
                    <th>Date Submitted</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MODERATION_QUEUE.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>ID: {item.id}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                            {item.organizer.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#fff' }}>{item.organizer}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{item.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{item.submitted}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {item.tags.map(tag => <span key={tag} className="badge badge-blue" style={{ fontSize: 10 }}>{tag}</span>)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 14 }}>×</button>
                          <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', cursor: 'pointer', fontSize: 14 }}>✓</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 20px', background: 'rgba(34,197,94,0.05)', borderTop: '1px solid #1E2A45', fontSize: 12, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              System Monitoring Active: All nodes healthy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
