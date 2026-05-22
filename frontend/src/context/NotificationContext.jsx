import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'registration', title: 'Registration Confirmed', message: 'You\'re registered for AASTU Grand Hackathon 2024', time: '2 mins ago', read: false, icon: '🎟' },
  { id: 2, type: 'waitlist', title: 'Waitlist Update', message: 'You moved to #2 on the waitlist for Data Science Workshop', time: '1 hour ago', read: false, icon: '⏳' },
  { id: 3, type: 'reminder', title: 'Event Tomorrow', message: 'HackAASTU 24 starts tomorrow at 9:00 AM', time: '3 hours ago', read: false, icon: '📅' },
  { id: 4, type: 'approval', title: 'Event Approved', message: 'Your event proposal "AI Workshop" has been approved', time: '1 day ago', read: true, icon: '✅' },
  { id: 5, type: 'invitation', title: 'Team Invitation', message: 'Tigist Alemu invited you to join "Innovation Squad"', time: '2 days ago', read: true, icon: '👥' },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), read: false, time: 'Just now' }, ...prev]);
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
