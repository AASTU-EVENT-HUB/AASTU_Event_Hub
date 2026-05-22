import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { MOCK_EVENTS, getEventStatus } from '../../data/mockData';

const RECENT_ACTIVITY = [
  { type: 'registration', text: 'New Registration: Henok Tadesse joined "Tech Expo 2024"', sub: 'Ticket ID: #AST-9021-TX', time: '2 mins ago', color: '#22C55E' },
  { type: 'checkin', text: 'Check-in Success: Selamawit A. verified at Main Entrance', sub: 'Scanner: Gate_Alpha_01', time: '14 mins ago', color: '#F5A623' },
  { type: 'update', text: 'Event Updated: "Biotech Seminar" schedule modified', sub: 'Change: Shifted start time to 09:30 AM', time: '1 hour ago', color: '#3B6FFF' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const liveEvents = MOCK_EVENTS.filter(e => getEventStatus(e) === 'live');
  const upcomingEvents = MOCK_EVENTS.filter(e => getEventStatus(e) === 'upcoming');

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search events, participants, or logs..." />

        <div style={{ padding: '28px', flex: 1 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Registrations', value: '4,829', change: '+12.5%', icon: '👥', color: '#22C55E' },
              { label: 'Attendance Rate', value: '84.2%', change: '-2.1%', icon: '📊', color: '#EF4444' },
              { label: 'Active Check-ins', value: '1,104', badge: 'LIVE TRACKING', icon: '📡', color: '#F5A623' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ position: 'relative' }}>
                {stat.badge && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: 4, padding: '2px 6px', fontSize: 9, color: '#EF4444', fontWeight: 700,
                  }}>
                    {stat.badge}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{stat.icon}</span>
                  {stat.change && (
                    <span style={{ fontSize: 12, color: stat.color, fontWeight: 600 }}>↗ {stat.change}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
            {/* My Active Events */}
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>My Active Events</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>⚙</button>
                    <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>⬇</button>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Reg / Cap</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_EVENTS.slice(0, 5).map(event => {
                        const status = getEventStatus(event);
                        const fillPct = Math.round((event.registered / event.capacity) * 100);
                        return (
                          <tr key={event.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: 6,
                                  background: '#1E2A45',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 14, flexShrink: 0,
                                }}>
                                  {event.category === 'Hackathons' ? '⚡' : event.category === 'Workshops' ? '🔧' : '📅'}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{event.title}</div>
                                  <div style={{ fontSize: 11, color: '#64748B' }}>{event.location}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: 12 }}>
                              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td>
                              <span className={`badge ${status === 'live' ? 'badge-red' : status === 'upcoming' || status === 'soon' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                                {status === 'live' ? '● LIVE' : status === 'ended' ? 'PAST' : 'UPCOMING'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, color: '#fff', marginBottom: 3 }}>
                                {event.registered} / {event.capacity} ({fillPct}%)
                              </div>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div className="progress-fill progress-fill-blue" style={{ width: `${fillPct}%` }} />
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '4px 8px', fontSize: 11 }}
                                  onClick={() => navigate(`/admin/checkin/${event.id}`)}
                                >
                                  ⊞
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45', color: '#94A3B8', padding: '4px 8px', fontSize: 11 }}
                                  onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                                >
                                  ✏
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Recent Activity</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {RECENT_ACTIVITY.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, paddingBottom: 16,
                      borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid #1E2A45' : 'none',
                      marginBottom: i < RECENT_ACTIVITY.length - 1 ? 16 : 0,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: item.color, flexShrink: 0, marginTop: 5,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>
                          <span style={{ color: item.color, fontWeight: 600 }}>
                            {item.type === 'registration' ? 'New Registration: ' : item.type === 'checkin' ? 'Check-in Success: ' : 'Event Updated: '}
                          </span>
                          {item.text.split(': ').slice(1).join(': ')}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{item.sub}</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', flexShrink: 0 }}>{item.time}</div>
                    </div>
                  ))}
                </div>
                <button style={{ background: 'none', border: 'none', color: '#3B6FFF', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                  View Full Audit Log →
                </button>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* AI Insights */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <span style={{ color: '#F5A623' }}>✦</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AI Insights</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F5A623', marginBottom: 4 }}>Registration Spike Detected</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
                      Tech Expo registrations increased by 40% in the last 2 hours. AI suggests increasing server allocation for check-in day.
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)',
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3B6FFF', marginBottom: 4 }}>Campaign Optimization</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
                      Email open rates are highest between 7 PM – 9 PM. Schedule your next announcement for this window.
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline btn-full btn-sm" style={{ marginTop: 12 }}>
                  Generate Weekly Report
                </button>
              </div>

              {/* System Health */}
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
                  System Health
                </div>
                {[
                  { label: 'API Services', status: 'Stable', color: '#22C55E' },
                  { label: 'Database Load', status: '14%', color: '#22C55E' },
                  { label: 'Auth System', status: 'Active', color: '#22C55E' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid #1E2A45',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8' }}>
                      <span style={{ fontSize: 14 }}>
                        {item.label === 'API Services' ? '☁' : item.label === 'Database Load' ? '🛡' : '🔐'}
                      </span>
                      {item.label}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #1E2A45', padding: '12px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: '#64748B',
        }}>
          <span>© 2023 AASTU Events Hub. Operational Management Portal.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['System Status', 'Terms of Service', 'Privacy Protocol'].map(item => (
              <span key={item} style={{ cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
