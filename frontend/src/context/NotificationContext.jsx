import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Load from backend whenever user logs in — clear when they log out
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      return;
    }
    notificationsAPI.getAll()
      .then(res => setNotifications(res.data.notifications || []))
      .catch(() => setNotifications([]));
  }, [user?.id, token]);

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

  const addNotification = useCallback((notif) => {
    const local = { ...notif, id: Date.now(), read: false, time: 'Just now' };
    setNotifications(prev => [local, ...prev]);
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
