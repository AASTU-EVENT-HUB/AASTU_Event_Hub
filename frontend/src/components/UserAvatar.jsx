/**
 * UserAvatar — shared component used in Navbar, Topbar, Sidebar, Settings
 * Reads from the global AuthContext so it's always in sync.
 * Shows profile picture if set, otherwise shows initials.
 */
export default function UserAvatar({ user, size = 34, showBadge = false, badgeCount = 0 }) {
  const initials = (user?.name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 700, color: '#fff',
      overflow: 'hidden', flexShrink: 0,
      border: `2px solid #1E2A45`, position: 'relative',
    }}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user?.name || 'User'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      ) : initials}

      {showBadge && badgeCount > 0 && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#EF4444', border: '1.5px solid #0A0F2C',
          fontSize: 8, fontWeight: 700, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
  );
}
