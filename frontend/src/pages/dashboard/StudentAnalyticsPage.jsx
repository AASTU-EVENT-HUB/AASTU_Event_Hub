import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, getEventStatus } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const MONTHLY_ACTIVITY = [
  { month: 'Jan', events: 1 },
  { month: 'Feb', events: 2 },
  { month: 'Mar', events: 0 },
  { month: 'Apr', events: 3 },
  { month: 'May', events: 2 },
  { month: 'Jun', events: 4 },
  { month: 'Jul', events: 1 },
  { month: 'Aug', events: 3 },
  { month: 'Sep', events: 5 },
  { month: 'Oct', events: 3 },
];

const CATEGORY_DATA = [
  { name: 'Hackathons', value: 8, color: '#3B6FFF' },
  { name: 'Workshops', value: 6, color: '#22C55E' },
  { name: 'Seminars', value: 4, color: '#F5A623' },
  { name: 'Cultural', value: 3, color: '#A855F7' },
  { name: 'Tech', value: 3, color: '#EF4444' },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #1E2A45', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94A3B8' },
};

export default function StudentAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const attended = MOCK_REGISTRATIONS.filter(r => r.status === 'attended' || r.status === 'registered');
  const attendedEvents = attended.map(r => MOCK_EVENTS.find(e => e.id === r.eventId)).filter(Boolean);
  const departments = [...new Set(attendedEvents.map(e => e.department))];

  const stats = [
    { label: 'Events Registered', value: MOCK_REGISTRATIONS.filter(r => r.status === 'registered').length, icon: '🎫', color: '#3B6FFF' },
    { label: 'Events Attended', value: MOCK_REGISTRATIONS.filter(r => r.status === 'attended').length, icon: '✅', color: '#22C55E' },
    { label: 'Departments Explored', value: departments.length, icon: '🏛', color: '#F5A623' },
    { label: 'Event Credits', value: user?.eventCredits?.toLocaleString() || '1,240', icon: '⚡', color: '#A855F7' },
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
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Monthly activity */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Monthly Activity</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_ACTIVITY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="events" fill="#3B6FFF" radius={[4, 4, 0, 0]} name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Events by Category</h3>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {CATEGORY_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {CATEGORY_DATA.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#94A3B8', flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance history */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Attendance History</h3>
              <span style={{ fontSize: 12, color: '#64748B' }}>{attended.length} events</span>
            </div>
            {attended.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {attended.map(r => {
                  const event = MOCK_EVENTS.find(e => e.id === r.eventId);
                  if (!event) return null;
                  const status = getEventStatus(event);
                  return (
                    <div
                      key={r.eventId}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#0D1224', borderRadius: 10, border: '1px solid #1E2A45', cursor: 'pointer' }}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <img src={event.banner} alt={event.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{event.title}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          📅 {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · 📍 {event.location}
                        </div>
                      </div>
                      <span className={`badge ${r.status === 'attended' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                        {r.status === 'attended' ? 'ATTENDED' : 'REGISTERED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <p>No attendance history yet. Start attending events!</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/events')}>
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
