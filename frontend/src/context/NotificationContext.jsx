import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load from backend on mount
  useEffect(() => {
    notificationsAPI.getAll()
      .then(res => setNotifications(res.data.notifications || []))
      .catch(() => {}); // Fail silently — backend may not be running
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await notificationsAPI.markRead(id); } catch {}
  }, []);

  const clearNotification = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await notificationsAPI.delete(id); } catch {}
  }, []);

  const addNotification = useCallback(async (notif) => {
    const local = { ...notif, id: Date.now(), read: false, time: 'Just now' };
    setNotifications(prev => [local, ...prev]);
    try {
      const res = await notificationsAPI.create({ ...notif, sentAt: 'Just now' });
      // Replace local with server version
      setNotifications(prev => prev.map(n => n.id === local.id ? res.data.notification : n));
    } catch {}
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, clearNotification, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
