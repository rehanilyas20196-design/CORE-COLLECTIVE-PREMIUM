'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { userProfile } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      const count = await api.notifications.getUnreadCount();
      setNotifCount(count || 0);
    } catch (e) {
      console.error('Error loading notification count:', e);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      loadNotifications();
    }
  }, [userProfile?.id, loadNotifications]);

  return (
    <NotificationsContext.Provider value={{ notifCount, setNotifCount, loadNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotif = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotif must be used within NotificationsProvider');
  return context;
};
