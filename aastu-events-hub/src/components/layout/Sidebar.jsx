import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

const studentNav = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard', end: true },
  { to: '/events', icon: '📅', label: 'Events' },
  { to: '/dashboard/tickets', icon: '🎫', label: 'My Tickets' },
  { to: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
  { to: '/propose-event', icon: '✨', label: 'Propose Event' },
  { to: '/dashboard/settings', icon: '⚙', label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: '⊞', label: 'Dashboard', end: true },
  { to: '/admin/events', icon: '📅', label: 'Events' },
  { to: '/admin/approval', icon: '✅', label: 'Approvals' },
  { to: '/admin/users', icon: '👤', label: 'Users' },
  { to: '/admin/tickets', icon: '🎫', label: 'Tickets' },
  { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
  { to: '/admin/audit', icon: '📋', label: 'Audit Log' },
  { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/admin/team', icon: '👥', label: 'Team Members' },
  { to: '/admin/settings', icon: '⚙', label: 'Settings' },
];

export default function Sidebar({ isAdmin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="sidebar">
        {/* Brand — clicking goes to home */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid #1E2A45',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Logo size={32} showText />
          </div>
        </Link>

        {/* Role badge */}
        <div style={{ padding: '10px 20px 6px' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
            background: isAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(59,111,255,0.15)',
            color: isAdmin ? '#EF4444' : '#3B6FFF',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            {isAdmin ? '🛡 Admin' : user?.role === 'organizer' ? '🎯 Organizer' : '🎓 Student'}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#94A3B8',
                background: isActive ? 'rgba(59,111,255,0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(59,111,255,0.3)' : '1px solid transparent',
                textDecoration: 'none', transition: 'all 0.15s ease',
              })}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Divider + Home */}
          <div style={{ height: 1, background: '#1E2A45', margin: '10px 0' }} />
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              fontSize: 13, color: '#64748B', textDecoration: 'none',
              border: '1px solid transparent', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>🏠</span>
            Back to Home
          </Link>
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2A45' }}>
          <button
            className="btn btn-primary btn-full btn-sm"
            onClick={() => navigate(isAdmin ? '/admin/events' : '/events')}
            style={{ borderRadius: 10, marginBottom: 10 }}
          >
            + Create Event
          </button>

          <button
            onClick={() => navigate('/help')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px',
              background: 'none', border: 'none', color: '#64748B',
              fontSize: 13, cursor: 'pointer', borderRadius: 8, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
          >
            <span>❓</span> Help Center
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px',
              background: 'none', border: 'none', color: '#64748B',
              fontSize: 13, cursor: 'pointer', borderRadius: 8, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
          >
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </>
  );
}
