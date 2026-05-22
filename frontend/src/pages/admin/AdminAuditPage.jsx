import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

const SEVERITY = {
  info: { color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)', label: 'INFO' },
  success: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: 'SUCCESS' },
  warning: { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', label: 'WARNING' },
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'CRITICAL' },
};

const AUDIT_LOGS = [
  { id: 1, action: 'User Login', user: 'Selam Balcha', userId: 'u1', detail: 'Successful login from 192.168.1.45', severity: 'info', timestamp: 'May 22, 2026 09:12 AM', category: 'auth' },
  { id: 2, action: 'Event Registration', user: 'Henok Tadesse', userId: 'u2', detail: 'Registered for "AASTU Grand Hackathon 2024" (Ticket: #AST-9021-TX)', severity: 'success', timestamp: 'May 22, 2026 09:08 AM', category: 'registration' },
  { id: 3, action: 'Event Approved', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Approved event "AI & ML Bootcamp" submitted by Dr. Abebe Bekele', severity: 'success', timestamp: 'May 22, 2026 08:55 AM', category: 'approval' },
  { id: 4, action: 'Account Suspended', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Suspended account of Dawit Bekele (AAU-2021-ME-055) — Policy violation', severity: 'critical', timestamp: 'May 22, 2026 08:30 AM', category: 'user_management' },
  { id: 5, action: 'Event Deleted', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Deleted event "Unauthorized Gathering" (ID: EV-99012)', severity: 'warning', timestamp: 'May 21, 2026 05:15 PM', category: 'event_management' },
  { id: 6, action: 'QR Check-in', user: 'Tigist Alemu', userId: 'u4', detail: 'Checked in to "HackAASTU 24" at Gate Alpha — Scanner: Gate_Alpha_01', severity: 'success', timestamp: 'May 21, 2026 09:34 AM', category: 'checkin' },
  { id: 7, action: 'Failed Login Attempt', user: 'Unknown', userId: null, detail: '3 failed login attempts from IP 10.0.0.22 for account selam@aastu.edu.et', severity: 'warning', timestamp: 'May 21, 2026 08:00 AM', category: 'auth' },
  { id: 8, action: 'Event Updated', user: 'Dr. Abebe Bekele', userId: 'u3', detail: 'Modified schedule for "Biotech Seminar" — Start time shifted to 09:30 AM', severity: 'info', timestamp: 'May 20, 2026 03:45 PM', category: 'event_management' },
  { id: 9, action: 'Waitlist Joined', user: 'Sara Haile', userId: 'u6', detail: 'Joined waitlist for "Data Science Workshop" — Position #12', severity: 'info', timestamp: 'May 20, 2026 02:10 PM', category: 'registration' },
  { id: 10, action: 'Role Changed', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Changed role of Dr. Abebe Bekele from "student" to "organizer"', severity: 'warning', timestamp: 'May 19, 2026 11:00 AM', category: 'user_management' },
  { id: 11, action: 'Notification Sent', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Sent announcement to 458 registrants of "AASTU Grand Hackathon 2024"', severity: 'info', timestamp: 'May 19, 2026 10:30 AM', category: 'notifications' },
  { id: 12, action: 'Event Rejected', user: 'Mekdes A. (Admin)', userId: 'a1', detail: 'Rejected "Robotics Club Open Day" — Venue capacity exceeded', severity: 'warning', timestamp: 'May 18, 2026 04:00 PM', category: 'approval' },
];

const CATEGORIES = ['all', 'auth', 'registration', 'approval', 'event_management', 'user_management', 'checkin', 'notifications'];

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = AUDIT_LOGS.filter(log => {
    const matchSearch = !search || log.action.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase()) || log.detail.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchCategory = filterCategory === 'all' || log.category === filterCategory;
    return matchSearch && matchSeverity && matchCategory;
  });

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'User', 'Detail', 'Severity', 'Category'],
      ...filtered.map(l => [l.timestamp, l.action, l.user, l.detail, l.severity, l.category]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search audit logs..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Audit Log</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>{filtered.length} entries · Full platform activity history</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleExport}>
              ⬇ Export CSV
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 13 }}>🔍</span>
              <input className="form-input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <select className="form-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 'auto' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>

          {/* Severity summary */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {Object.entries(SEVERITY).map(([key, sc]) => {
              const count = AUDIT_LOGS.filter(l => l.severity === key).length;
              return (
                <div
                  key={key}
                  onClick={() => setFilterSeverity(filterSeverity === key ? 'all' : key)}
                  style={{
                    background: filterSeverity === key ? sc.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${filterSeverity === key ? sc.color : '#1E2A45'}`,
                    borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: sc.color }}>{sc.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Log table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Detail</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => {
                    const sc = SEVERITY[log.severity];
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{log.action}</td>
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>{log.user}</td>
                        <td style={{ fontSize: 12, color: '#94A3B8', maxWidth: 300 }}>{log.detail}</td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>No logs match your filters</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
