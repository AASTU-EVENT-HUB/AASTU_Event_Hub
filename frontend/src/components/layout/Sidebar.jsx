import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

const studentNav = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard', end: true },
  { to: '/events', icon: '📅', label: 'Browse Events' },
  { to: '/dashboard/tickets', icon: '🎫', label: 'My Tickets' },
  { to: '/suggestions', icon: '💡', label: 'Suggestions' },
  { to: '/dashboard/feedback', icon: '⭐', label: 'My Feedback' },
  { to: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
  { to: '/apply-organizer', icon: '🎯', label: 'Become Organizer' },
  { to: '/dashboard/settings', icon: '⚙', label: 'Settings' },
];

const organizerNav = [
  { to: '/organizer', icon: '⊞', label: 'Dashboard', end: true },
  { to: '/organizer/events', icon: '📅', label: 'My Events' },
  { to: '/organizer/registrations', icon: '👥', label: 'Registrations' },
  { to: '/organizer/feedback', icon: '⭐', label: 'Feedback' },
  { to: '/organizer/suggestions', icon: '💡', label: 'Suggestions Board' },
  { to: '/organizer/analytics', icon: '📊', label: 'Analytics' },
  { to: '/organizer/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/organizer/settings', icon: '⚙', label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: '⊞', label: 'Dashboard', end: true },
  { to: '/admin/events', icon: '📅', label: 'All Events' },
  { to: '/admin/organizer-applications', icon: '🎯', label: 'Applications' },
  { to: '/admin/users', icon: '👤', label: 'Users' },
  { to: '/admin/tickets', icon: '🎫', label: 'Tickets' },
  { to: '/admin/suggestions', icon: '💡', label: 'Suggestions' },
  { to: '/admin/feedback', icon: '⭐', label: 'Feedback' },
  { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
  { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/admin/audit', icon: '📋', label: 'Audit Log' },
  { to: '/admin/settings', icon: '⚙', label: 'Settings' },
];

const ROLE_CONFIG = {
  admin:     { nav: adminNav,     badge: '🛡 Admin',     color: '#EF4444', bg: 'rgba(239,68,68,0.15)',     cta: null },
  organizer: { nav: organizerNav, badge: '🎯 Organizer', color: '#F5A623', bg: 'rgba(245,166,35,0.15)',    cta: { label: '+ Create Event', path: '/organizer/events' } },
  student:   { nav: studentNav,   badge: '🎓 Student',   color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)',    cta: { label: '+ Suggest Event', path: '/suggestions' } },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1E2A45' }}>
          <Logo size={32} showText />
        </div>
      </Link>

      {/* Role badge */}
      <div style={{ padding: '10px 20px 6px' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
          background: config.bg, color: config.color,
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {config.badge}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {config.nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, marginBottom: 2,
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

        <div style={{ height: 1, background: '#1E2A45', margin: '10px 0' }} />
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 10,
          fontSize: 13, color: '#64748B', textDecoration: 'none',
          border: '1px solid transparent',
        }}>
          <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>🏠</span>
          Back to Home
        </Link>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2A45' }}>
        {config.cta && (
          <button
            className="btn btn-primary btn-full btn-sm"
            onClick={() => navigate(config.cta.path)}
            style={{ borderRadius: 10, marginBottom: 10 }}
          >
            {config.cta.label}
          </button>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 12px',
            background: 'none', border: 'none', color: '#64748B',
            fontSize: 13, cursor: 'pointer', borderRadius: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
        >
          <span>↪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
