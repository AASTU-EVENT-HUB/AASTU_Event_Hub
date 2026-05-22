import { useNotifications } from '../context/NotificationContext';

const TYPE_COLORS = {
  registration: '#22C55E',
  waitlist: '#F5A623',
  reminder: '#3B6FFF',
  approval: '#22C55E',
  invitation: '#A855F7',
  rejection: '#EF4444',
  announcement: '#3B6FFF',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markAllRead, markRead, clearNotification } = useNotifications();

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={onClose} />

      {/* Panel */}
      <div style={{
        position: 'absolute', top: '100%', right: 0, marginTop: 8,
        width: 360, maxHeight: 520,
        background: '#111827', border: '1px solid #1E2A45',
        borderRadius: 16, zIndex: 99,
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.15s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid #1E2A45',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                background: '#EF4444', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '2px 6px',
                borderRadius: 10, minWidth: 18, textAlign: 'center',
              }}>{unreadCount}</span>
            )}
          </div>
          <button
            onClick={markAllRead}
            style={{ background: 'none', border: 'none', color: '#3B6FFF', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              <div style={{ fontSize: 14, color: '#64748B' }}>No notifications yet</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', gap: 12, padding: '12px 18px',
                  borderBottom: '1px solid rgba(30,42,69,0.5)',
                  background: n.read ? 'transparent' : 'rgba(59,111,255,0.05)',
                  cursor: 'pointer', transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(59,111,255,0.05)'}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: `${TYPE_COLORS[n.type] || '#3B6FFF'}20`,
                  border: `1px solid ${TYPE_COLORS[n.type] || '#3B6FFF'}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {n.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#fff', marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{n.time}</div>
                </div>

                {/* Unread dot + close */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  {!n.read && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B6FFF' }} />
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); clearNotification(n.id); }}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
                  >×</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px', borderTop: '1px solid #1E2A45',
          display: 'flex', justifyContent: 'center', flexShrink: 0,
        }}>
          <button
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, cursor: 'pointer' }}
            onClick={() => { clearNotification(-1); }}
          >
            Clear all notifications
          </button>
        </div>
      </div>
    </>
  );
}
