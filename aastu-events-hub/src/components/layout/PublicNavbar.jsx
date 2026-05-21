import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Logo from '../Logo';
import NotificationPanel from '../NotificationPanel';
import HelpCenter from '../HelpCenter';

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,44,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1E2A45',
        height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Logo size={34} showText />
          </Link>

          {/* Center nav */}
          <div style={{ display: 'flex', gap: 2, marginLeft: 28 }}>
            {[
              { label: 'Events', to: '/events' },
              { label: 'Schedule', to: '/events?view=schedule' },
              { label: 'Organizers', to: '/events?view=organizers' },
              { label: 'Sponsors', to: '/events?view=sponsors' },
            ].map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                style={({ isActive }) => ({
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : '#94A3B8',
                  textDecoration: 'none', transition: 'color 0.15s',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifications(s => !s); setShowMenu(false); }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45',
                  borderRadius: 8, color: '#94A3B8', fontSize: 16, cursor: 'pointer',
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#EF4444', border: '1.5px solid #0A0F2C',
                    fontSize: 9, fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>

            {/* Help */}
            <button
              onClick={() => setShowHelp(true)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45',
                borderRadius: 8, color: '#94A3B8', fontSize: 15, cursor: 'pointer',
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >❓</button>

            {user ? (
              <div style={{ position: 'relative' }}>
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
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
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
                      borderRadius: 12, padding: '6px', minWidth: 200,
                      zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      animation: 'fadeIn 0.15s ease',
                    }}>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E2A45', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{user.email}</div>
                      </div>
                      {[
                        { label: user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard', icon: '⊞', path: user.role === 'admin' ? '/admin' : '/dashboard' },
                        { label: 'My Events', icon: '🎫', path: '/dashboard/tickets' },
                        { label: 'Profile Settings', icon: '👤', path: user.role === 'admin' ? '/admin/settings' : '/dashboard/settings' },
                        { label: 'Browse Events', icon: '📅', path: '/events' },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={() => { navigate(item.path); setShowMenu(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            width: '100%', padding: '8px 12px', borderRadius: 8,
                            background: 'none', border: 'none', color: '#94A3B8',
                            fontSize: 13, cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}
                        >
                          <span>{item.icon}</span> {item.label}
                        </button>
                      ))}
                      <div style={{ height: 1, background: '#1E2A45', margin: '4px 0' }} />
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
