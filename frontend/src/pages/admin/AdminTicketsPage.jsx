import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useToast } from '../../context/ToastContext';
import { eventsAPI } from '../../services/api';
import apiClient from '../../services/api';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: '#22C55E', bg: 'rgba(34,197,94,0.15)', badgeClass: 'badge-green' },
  checked_in: { label: 'Checked In', color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)', badgeClass: 'badge-blue' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', badgeClass: 'badge-red' },
  waitlist: { label: 'Waitlist', color: '#F5A623', bg: 'rgba(245,166,35,0.15)', badgeClass: 'badge-gold' },
};

export default function AdminTicketsPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, eRes] = await Promise.all([
          apiClient.get('/registrations/all'),
          eventsAPI.getAll({ limit: 100 }),
        ]);
        setTickets(tRes.data.registrations || []);
        setEvents(eRes.data.events || []);
      } catch {
        // /registrations/all may not exist — fall back gracefully
        try {
          const eRes = await eventsAPI.getAll({ limit: 100 });
          setEvents(eRes.data.events || []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = tickets.filter(t => {
    if (filterEvent !== 'all' && String(t.event?.id) !== String(filterEvent)) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.studentName?.toLowerCase().includes(q) && !t.studentId?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Event', 'Status', 'Registered At'];
    const rows = filtered.map(t => [
      t.studentName || t.name || '—',
      t.studentId || '—',
      t.event?.title || '—',
      t.status,
      t.registeredAt || t.registered_at || '—',
    ]);
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
                {loading ? 'Loading...' : `${filtered.length} of ${tickets.length} tickets`}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={tickets.length === 0}>
              ⬇ Export CSV
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>🔍</span>
              <input
                className="form-input"
                placeholder="Search by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select className="form-select" value={filterEvent} onChange={e => setFilterEvent(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
              <option value="all">All Events</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.title?.slice(0, 30)}</option>)}
            </select>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: tickets.length, color: '#fff' },
              { label: 'Confirmed', value: tickets.filter(t => t.status === 'confirmed').length, color: '#22C55E' },
              { label: 'Checked In', value: tickets.filter(t => t.status === 'checked_in').length, color: '#3B6FFF' },
              { label: 'Waitlist', value: tickets.filter(t => t.status === 'waitlist').length, color: '#F5A623' },
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
                    <th>Student</th>
                    <th>Event</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.confirmed;
                    return (
                      <tr key={t.registrationId || i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {(t.studentName || t.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{t.studentName || t.name || '—'}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>{t.studentId || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{t.event?.title?.slice(0, 28) || '—'}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {t.event?.startDate ? new Date(t.event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: '#94A3B8' }}>
                          {t.registeredAt ? new Date(t.registeredAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span className={`badge ${sc.badgeClass}`} style={{ fontSize: 10 }}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                {tickets.length === 0 ? 'No registrations yet' : 'No tickets match your filters'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
