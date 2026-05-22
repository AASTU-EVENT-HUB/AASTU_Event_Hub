import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../NotificationPanel';
import HelpCenter from '../HelpCenter';
import Logo from '../Logo';

export default function Topbar({ placeholder = 'Search events, venues, or organizers...' }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/events?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const settingsPath = user?.role === 'admin' ? '/admin/settings' : '/dashboard/settings';

  return (
    <>
      <header className="topbar">
        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#64748B', fontSize: 14, pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              className="form-input"
              style={{ paddingLeft: 36, paddingTop: 9, paddingBottom: 9, borderRadius: 24, fontSize: 13, background: 'rgba(255,255,255,0.05)' }}
            />
          </div>
        </form>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          {/* Home */}
          <Link to="/" title="Back to Home" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45',
            color: '#94A3B8', fontSize: 15, textDecoration: 'none', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3B6FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#1E2A45'; }}
          >🏠</Link>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              title="Notifications"
              onClick={() => { setShowNotifications(s => !s); setShowUserMenu(false); }}
              style={{
                background: showNotifications ? 'rgba(59,111,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${showNotifications ? '#3B6FFF' : '#1E2A45'}`,
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
            title="Help Center"
            onClick={() => setShowHelp(true)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45',
              borderRadius: 8, color: '#94A3B8', fontSize: 15, cursor: 'pointer',
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3B6FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#1E2A45'; }}
          >❓</button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 10, border: '1px solid transparent', transition: 'all 0.15s' }}
              onClick={() => { setShowUserMenu(s => !s); setShowNotifications(false); }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#1E2A45'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'organizer' ? 'Organizer' : user?.department?.split(' ')[0] || 'Student'}
                </div>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden',
                flexShrink: 0, border: '2px solid #1E2A45',
              }}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {showUserMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowUserMenu(false)} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  background: '#111827', border: '1px solid #1E2A45',
                  borderRadius: 12, padding: '6px', minWidth: 200,
                  zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E2A45', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{user?.email}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: user?.role === 'admin' ? 'rgba(239,68,68,0.2)' : user?.role === 'organizer' ? 'rgba(245,166,35,0.2)' : 'rgba(59,111,255,0.2)',
                        color: user?.role === 'admin' ? '#EF4444' : user?.role === 'organizer' ? '#F5A623' : '#3B6FFF',
                        textTransform: 'uppercase',
                      }}>
                        {user?.role || 'student'}
                      </span>
                    </div>
                  </div>
                  {[
                    { label: 'Dashboard', icon: '⊞', path: dashboardPath },
                    { label: 'Profile Settings', icon: '👤', path: settingsPath },
                    { label: 'Browse Events', icon: '📅', path: '/events' },
                    { label: 'Back to Home', icon: '🏠', path: '/' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setShowUserMenu(false); }}
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
                    onClick={() => { handleLogout(); setShowUserMenu(false); }}
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
        </div>
      </header>

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </>
  );
}
