import { useState, useEffect } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_settings');
      return saved
        ? JSON.parse(saved)
        : {
            notifications: true,
            sound: true,
            vibration: true,
            darkMode: false,
            language: 'tr',
            mapStyle: 'default',
            autoRoute: true,
            showDistance: true,
            voiceGuidance: false,
          };
    } catch {
      return {
        notifications: true,
        sound: true,
        vibration: true,
        darkMode: false,
        language: 'tr',
        mapStyle: 'default',
        autoRoute: true,
        showDistance: true,
        voiceGuidance: false,
      };
    }
  });

  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      localStorage.setItem('user_settings', JSON.stringify(newSettings));
      setSaveMessage('Ayarlar kaydedildi');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      console.error('Settings save error:', err);
    }
  };

  return {
    settings,
    saveMessage,
    handleSettingChange,
  };
}
