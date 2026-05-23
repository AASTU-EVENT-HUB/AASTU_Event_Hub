import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrganizerCheckinPage() {
  const { eventId } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checking, setChecking] = useState(null);

  const load = () => {
    organizerAPI.getCheckinList(eventId)
      .then(r => setData(r.data))
      .catch(() => toast.error('Error', 'Could not load check-in list'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [eventId]);

  const handleCheckin = async (registrationId) => {
    setChecking(registrationId);
    try {
      await organizerAPI.manualCheckin(eventId, registrationId);
      toast.success('Checked in!', 'Student marked as attended');
      load();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Check-in failed');
    }
    setChecking(null);
  };

  const filtered = (data?.attendees || []).filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  const checkedIn = filtered.filter(a => a.status === 'checked-in').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search attendees..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Check-in: {data?.event?.title || 'Event'}
            </h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              {data?.stats?.checkedIn || 0} / {data?.stats?.totalRegistered || 0} checked in
            </p>
          </div>

          {/* Progress */}
          {data && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Check-in Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>
                  {data.stats.totalRegistered > 0 ? Math.round((data.stats.checkedIn / data.stats.totalRegistered) * 100) : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill progress-fill-green" style={{
                  width: `${data.stats.totalRegistered > 0 ? (data.stats.checkedIn / data.stats.totalRegistered) * 100 : 0}%`
                }} />
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                {[
                  { label: 'Registered', value: data.stats.totalRegistered, color: '#3B6FFF' },
                  { label: 'Checked In', value: data.stats.checkedIn, color: '#22C55E' },
                  { label: 'Not Yet', value: data.stats.totalRegistered - data.stats.checkedIn, color: '#64748B' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <input className="form-input" placeholder="Search by name or student ID..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360, marginBottom: 16 }} />

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Student ID</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No attendees found</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.status === 'checked-in' ? 'rgba(34,197,94,0.2)' : '#1E2A45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: a.status === 'checked-in' ? '#22C55E' : '#94A3B8', flexShrink: 0 }}>
                            {a.status === 'checked-in' ? '✓' : a.name?.charAt(0)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{a.studentId}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{a.department}</td>
                      <td>
                        <span className={`badge ${a.status === 'checked-in' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                          {a.status === 'checked-in' ? '✓ CHECKED IN' : 'NOT YET'}
                        </span>
                      </td>
                      <td>
                        {a.status !== 'checked-in' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', padding: '4px 12px', fontSize: 11 }}
                            onClick={() => handleCheckin(a.id)} disabled={checking === a.id}>
                            {checking === a.id ? '...' : 'Mark Attended'}
                          </button>
                        )}
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
