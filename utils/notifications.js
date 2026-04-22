// Bildirim izni isteme ve gönderme fonksiyonları

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Bu tarayıcı bildirimleri desteklemiyor');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
      ...options,
    });

    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      notification.close();
    };

    return notification;
  }
}

// Service Worker üzerinden bildirim gönderme
export async function sendPushNotification(title, options = {}) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/assets/icon-192x192.png',
      badge: '/assets/icon-192x192.png',
      vibrate: [200, 100, 200],
      ...options,
    });
  }
}

// PWA kurulum durumunu kontrol et
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// PWA kurulum prompt'unu göster
let deferredPrompt;

export function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export async function showPWAInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
}
