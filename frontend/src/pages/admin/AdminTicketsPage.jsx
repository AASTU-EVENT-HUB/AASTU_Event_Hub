import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { MOCK_EVENTS, MOCK_REGISTRATIONS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

// Build a flat list of all registrations across all events
const ALL_TICKETS = [
  { id: 'TKT-001', studentName: 'Selam Balcha', studentId: 'AAU-2021-CS-042', email: 'selam@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=1', eventId: 'e1', status: 'confirmed', registeredAt: '2024-10-01', qrCode: 'QR-AAU-E1-U1-2024' },
  { id: 'TKT-002', studentName: 'Henok Tadesse', studentId: 'AAU-2020-SE-018', email: 'henok@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=3', eventId: 'e2', status: 'checked_in', registeredAt: '2024-10-02', qrCode: 'QR-AAU-E2-U2-2024' },
  { id: 'TKT-003', studentName: 'Tigist Alemu', studentId: 'AAU-2022-EE-031', email: 'tigist@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=7', eventId: 'e1', status: 'confirmed', registeredAt: '2024-10-03', qrCode: 'QR-AAU-E1-U3-2024' },
  { id: 'TKT-004', studentName: 'Dawit Bekele', studentId: 'AAU-2021-ME-055', email: 'dawit@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=9', eventId: 'e8', status: 'confirmed', registeredAt: '2024-10-04', qrCode: 'QR-AAU-E8-U4-2024' },
  { id: 'TKT-005', studentName: 'Sara Haile', studentId: 'AAU-2023-CS-012', email: 'sara@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=11', eventId: 'e2', status: 'checked_in', registeredAt: '2024-10-05', qrCode: 'QR-AAU-E2-U5-2024' },
  { id: 'TKT-006', studentName: 'Yonas Tesfaye', studentId: 'AAU-2020-CS-007', email: 'yonas@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=15', eventId: 'e5', status: 'cancelled', registeredAt: '2024-10-06', qrCode: 'QR-AAU-E5-U6-2024' },
  { id: 'TKT-007', studentName: 'Hiwot Girma', studentId: 'AAU-2022-SE-044', email: 'hiwot@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=17', eventId: 'e1', status: 'confirmed', registeredAt: '2024-10-07', qrCode: 'QR-AAU-E1-U7-2024' },
  { id: 'TKT-008', studentName: 'Abebe Kebede', studentId: 'AAU-2021-EE-022', email: 'abebe@aastu.edu.et', avatar: 'https://i.pravatar.cc/40?img=19', eventId: 'e8', status: 'checked_in', registeredAt: '2024-10-08', qrCode: 'QR-AAU-E8-U8-2024' },
];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: '#22C55E', bg: 'rgba(34,197,94,0.15)', badgeClass: 'badge-green' },
  checked_in: { label: 'Checked In', color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)', badgeClass: 'badge-blue' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', badgeClass: 'badge-red' },
  waitlist: { label: 'Waitlist', color: '#F5A623', bg: 'rgba(245,166,35,0.15)', badgeClass: 'badge-gold' },
};

export default function AdminTicketsPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState(ALL_TICKETS);
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const filtered = tickets.filter(t => {
    if (filterEvent !== 'all' && t.eventId !== filterEvent) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (dateFrom && t.registeredAt < dateFrom) return false;
    if (dateTo && t.registeredAt > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.studentName.toLowerCase().includes(q) &&
          !t.studentId.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Ticket ID', 'Student Name', 'Student ID', 'Email', 'Event', 'Status', 'Registered At'];
    const rows = filtered.map(t => {
      const event = MOCK_EVENTS.find(e => e.id === t.eventId);
      return [t.id, t.studentName, t.studentId, t.email, event?.title || t.eventId, t.status, t.registeredAt];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', `${filtered.length} tickets downloaded as CSV`);
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search tickets..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Ticket Management</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>
                {filtered.length} of {tickets.length} tickets
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportCSV}>
              ⬇ Export CSV
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>🔍</span>
              <input
                className="form-input"
                placeholder="Search by name, ID, or ticket..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select className="form-select" value={filterEvent} onChange={e => setFilterEvent(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
              <option value="all">All Events</option>
              {MOCK_EVENTS.map(e => <option key={e.id} value={e.id}>{e.title.slice(0, 30)}</option>)}
            </select>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="cancelled">Cancelled</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 'auto' }} title="From date" />
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 'auto' }} title="To date" />
            {(filterEvent !== 'all' || filterStatus !== 'all' || dateFrom || dateTo || search) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setFilterEvent('all'); setFilterStatus('all'); setDateFrom(''); setDateTo(''); setSearch(''); }}>
                Clear
              </button>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: tickets.length, color: '#fff' },
              { label: 'Confirmed', value: tickets.filter(t => t.status === 'confirmed').length, color: '#22C55E' },
              { label: 'Checked In', value: tickets.filter(t => t.status === 'checked_in').length, color: '#3B6FFF' },
              { label: 'Cancelled', value: tickets.filter(t => t.status === 'cancelled').length, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const event = MOCK_EVENTS.find(e => e.id === t.eventId);
                    const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.confirmed;
                    return (
                      <tr key={t.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3B6FFF' }}>{t.id}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={t.avatar} alt={t.studentName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{t.studentName}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>{t.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{event?.title?.slice(0, 28) || t.eventId}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {event ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>{t.registeredAt}</td>
                        <td>
                          <span className={`badge ${sc.badgeClass}`} style={{ fontSize: 10 }}>{sc.label}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '4px 8px', fontSize: 11 }}
                              onClick={() => toast.info('Ticket', `QR: ${t.qrCode}`)}
                            >
                              View QR
                            </button>
                            {t.status !== 'cancelled' && (
                              <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 8px', fontSize: 11 }}
                                onClick={() => {
                                  setTickets(prev => prev.map(tk => tk.id === t.id ? { ...tk, status: 'cancelled' } : tk));
                                  toast.success('Cancelled', `Ticket ${t.id} cancelled`);
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                No tickets match your filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
