'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, sendNotification, sendPushNotification } from '@/utils/notifications';

export function useNotifications() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  };

  const notify = (title, options = {}) => {
    if (permission === 'granted') {
      return sendNotification(title, options);
    }
  };

  const pushNotify = async (title, options = {}) => {
    if (permission === 'granted') {
      return await sendPushNotification(title, options);
    }
  };

  return {
    permission,
    requestPermission,
    notify,
    pushNotify,
    isGranted: permission === 'granted',
  };
}

// Kullanım örnekleri:
export const notificationExamples = {
  // Favorilere eklendiğinde
  addedToFavorites: (storeName) => ({
    title: '⭐ Favorilere Eklendi',
    options: {
      body: `${storeName} favorilerinize eklendi`,
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
      tag: 'favorite-added',
      requireInteraction: false,
    }
  }),

  // Rota oluşturulduğunda
  routeCreated: (from, to) => ({
    title: '🗺️ Rota Hazır',
    options: {
      body: `${from} → ${to} rotası oluşturuldu`,
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
      tag: 'route-created',
      requireInteraction: false,
    }
  }),

  // Acil durum bildirimi
  emergency: (message) => ({
    title: '🚨 Acil Durum',
    options: {
      body: message,
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
      tag: 'emergency',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
    }
  }),

  // Genel bildirim
  general: (title, message) => ({
    title,
    options: {
      body: message,
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
    }
  }),
};
