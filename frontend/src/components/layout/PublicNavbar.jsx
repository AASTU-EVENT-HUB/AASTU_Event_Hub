import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Logo from '../Logo';
import NotificationPanel from '../NotificationPanel';
import HelpCenter from '../HelpCenter';

const NAV_LINKS = [
  { label: 'Events', to: '/events' },
  { label: 'Suggestions', to: '/suggestions' },
  { label: 'Help', to: '/help' },
];

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/dashboard';
  const settingsPath = user?.role === 'admin' ? '/admin/settings' : user?.role === 'organizer' ? '/organizer/settings' : '/dashboard/settings';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,44,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1E2A45', height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Logo size={34} showText />
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, marginLeft: 28 }}>
            {NAV_LINKS.map(item => (
              <NavLink key={item.label} to={item.to} style={({ isActive }) => ({
                padding: '6px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : '#94A3B8',
                textDecoration: 'none', transition: 'color 0.15s',
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              })}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                {/* Avatar button */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 10, border: '1px solid transparent', transition: 'all 0.15s' }}
                  onClick={() => setShowMenu(s => !s)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#1E2A45'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff', border: '2px solid #1E2A45',
                    position: 'relative',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                    {/* Notification dot */}
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 14, height: 14, borderRadius: '50%',
                        background: '#EF4444', border: '1.5px solid #0A0F2C',
                        fontSize: 8, fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 10, color: '#64748B' }}>▾</span>
                </div>

                {showMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowMenu(false)} />
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 6,
                      background: '#111827', border: '1px solid #1E2A45',
                      borderRadius: 12, padding: '6px', minWidth: 220,
                      zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      animation: 'fadeIn 0.15s ease',
                    }}>
                      {/* User info */}
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E2A45', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{user.email}</div>
                        <div style={{ marginTop: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: user.role === 'admin' ? 'rgba(239,68,68,0.2)' : user.role === 'organizer' ? 'rgba(245,166,35,0.2)' : 'rgba(59,111,255,0.2)',
                            color: user.role === 'admin' ? '#EF4444' : user.role === 'organizer' ? '#F5A623' : '#3B6FFF',
                            textTransform: 'uppercase',
                          }}>{user.role || 'student'}</span>
                        </div>
                      </div>

                      {/* Menu items */}
                      {[
                        { label: 'My Dashboard', icon: '⊞', path: dashboardPath },
                        { label: 'My Events', icon: '🎫', path: user.role === 'organizer' ? '/organizer/registrations' : '/dashboard/tickets' },
                        { label: 'Profile Settings', icon: '👤', path: settingsPath },
                        { label: 'Browse Events', icon: '📅', path: '/events' },
                      ].map(item => (
                        <MenuItem key={item.label} icon={item.icon} label={item.label}
                          onClick={() => { navigate(item.path); setShowMenu(false); }} />
                      ))}

                      <div style={{ height: 1, background: '#1E2A45', margin: '4px 0' }} />

                      {/* Notifications */}
                      <div style={{ position: 'relative' }}>
                        <MenuItem
                          icon="🔔"
                          label={unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications'}
                          labelColor={unreadCount > 0 ? '#EF4444' : undefined}
                          onClick={() => { setShowNotifications(s => !s); }}
                        />
                        {showNotifications && (
                          <div style={{ position: 'absolute', right: '100%', top: 0, marginRight: 8 }}>
                            <NotificationPanel onClose={() => setShowNotifications(false)} />
                          </div>
                        )}
                      </div>

                      {/* Help */}
                      <MenuItem icon="❓" label="Help Center"
                        onClick={() => { setShowHelp(true); setShowMenu(false); }} />

                      <div style={{ height: 1, background: '#1E2A45', margin: '4px 0' }} />

                      {/* Sign out */}
                      <button
                        onClick={() => { handleLogout(); setShowMenu(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          width: '100%', padding: '8px 12px', borderRadius: 8,
                          background: 'none', border: 'none', color: '#EF4444',
                          fontSize: 13, cursor: 'pointer', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span>↪</span> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </>
  );
}

function MenuItem({ icon, label, onClick, labelColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 12px', borderRadius: 8,
        background: 'none', border: 'none',
        color: labelColor || '#94A3B8',
        fontSize: 13, cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = labelColor || '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = labelColor || '#94A3B8'; }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}
