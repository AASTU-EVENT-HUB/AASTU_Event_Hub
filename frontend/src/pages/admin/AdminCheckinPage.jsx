import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { checkinAPI, eventsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCheckinPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = async () => {
    try {
      const [eRes, sRes] = await Promise.all([
        eventsAPI.getById(eventId),
        checkinAPI.getStats(eventId),
      ]);
      setEvent(eRes.data.event);
      setStats(sRes.data.stats);
    } catch {
      toast.error('Load failed', 'Could not load check-in data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [eventId]);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar isAdmin />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#64748B', fontSize: 14 }}>Loading check-in data...</div>
        </div>
      </div>
    );
  }

  const totalRegistered = stats?.totalRegistered || 0;
  const checkedIn = stats?.checkedIn || 0;
  const checkinPct = totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0;
  const attendees = stats?.attendees || [];
  const timeline = stats?.timeline || [];

  const filtered = attendees.filter(a => {
    if (filter === 'checked-in') return a.status === 'checked-in';
    if (filter === 'not-yet') return a.status === 'not-yet';
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search attendees..." />

        <div style={{ padding: '28px', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                <span style={{ cursor: 'pointer', color: '#3B6FFF' }} onClick={() => navigate('/admin')}>Admin</span>
                {' › '}Check-in Dashboard
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
                {event?.title || `Event #${eventId}`}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={loadData}>↻ Refresh</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/admin/scanner/${eventId}`)}
              >
                📱 Open Scanner
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Registered', value: totalRegistered, color: '#3B6FFF' },
              { label: 'Checked In', value: checkedIn, color: '#22C55E' },
              { label: 'Not Yet', value: totalRegistered - checkedIn, color: '#F5A623' },
              { label: 'Check-in Rate', value: `${checkinPct}%`, color: '#fff' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Check-in Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{checkinPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill progress-fill-green" style={{ width: `${checkinPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginTop: 6 }}>
              <span>{checkedIn} checked in</span>
              <span>{totalRegistered - checkedIn} remaining</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            {/* Timeline chart */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Check-ins Over Time</h3>
              {timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                    <XAxis dataKey="hour" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="count" fill="#3B6FFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>
                  No check-ins recorded yet
                </div>
              )}
            </div>

            {/* Attendee list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #1E2A45', display: 'flex', gap: 6 }}>
                {['all', 'checked-in', 'not-yet'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: filter === f ? '#3B6FFF' : 'transparent',
                      border: `1px solid ${filter === f ? '#3B6FFF' : '#1E2A45'}`,
                      color: filter === f ? '#fff' : '#94A3B8',
                      fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    {f === 'all' ? `All (${attendees.length})` : f === 'checked-in' ? `✓ In (${attendees.filter(a => a.status === 'checked-in').length})` : `⏳ Pending (${attendees.filter(a => a.status === 'not-yet').length})`}
                  </button>
                ))}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                    No attendees in this category
                  </div>
                ) : filtered.map(attendee => (
                  <div key={attendee.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderBottom: '1px solid #1E2A45',
                  }}>
                    <img src={attendee.avatar} alt={attendee.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{attendee.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{attendee.department}</div>
                    </div>
                    <span className={`badge ${attendee.status === 'checked-in' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 9 }}>
                      {attendee.status === 'checked-in' ? '✓ In' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
