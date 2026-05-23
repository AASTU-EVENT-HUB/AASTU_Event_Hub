import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrganizerRegistrationsPage() {
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    organizerAPI.getRegistrations()
      .then(r => {
        const regs = r.data.registrations || [];
        setRegistrations(regs);
        const evMap = {};
        regs.forEach(r => { if (r.eventId) evMap[r.eventId] = r.eventTitle; });
        setEvents(Object.entries(evMap).map(([id, title]) => ({ id, title })));
      })
      .catch(() => toast.error('Error', 'Could not load registrations'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = registrations.filter(r => {
    const matchEvent = !selectedEvent || String(r.eventId) === selectedEvent;
    const matchSearch = !search || r.studentName?.toLowerCase().includes(search.toLowerCase()) || r.studentId?.toLowerCase().includes(search.toLowerCase());
    return matchEvent && matchSearch;
  });

  const exportCSV = () => {
    const rows = [['Name', 'Student ID', 'Email', 'Department', 'Event', 'Status', 'Registered At']];
    filtered.forEach(r => rows.push([r.studentName, r.studentId, r.email, r.department, r.eventTitle, r.status, r.registered_at]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'registrations.csv';
    a.click();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search registrations..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Registrations</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>{filtered.length} registrations</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input className="form-input" placeholder="Search by name or student ID..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
            <select className="form-select" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ maxWidth: 260 }}>
              <option value="">All Events</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Student ID</th><th>Department</th><th>Event</th><th>Status</th><th>Registered</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No registrations found</td></tr>
                  ) : filtered.map(r => (
                    <tr key={r.registrationId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B6FFF,#6B46C1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {r.studentName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.studentName}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{r.studentId}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{r.department}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{r.eventTitle}</td>
                      <td>
                        <span className={`badge ${r.status === 'checked_in' ? 'badge-green' : r.status === 'confirmed' ? 'badge-blue' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                          {r.status === 'checked_in' ? 'CHECKED IN' : r.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748B' }}>
                        {r.registered_at ? new Date(r.registered_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
