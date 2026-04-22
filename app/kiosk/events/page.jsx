'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/kiosk/events');
        const data = await response.json();

        if (data.success) {

          setEvents(data.events);
        } else {
          setError('Etkinlikler yüklenemedi');
        }
        setLoading(false);
      } catch (err) {
        console.error('Hata:', err);
        setError('Etkinlikler yüklenirken hata oluştu');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const styleId = 'kiosk-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        body { font-family: 'Inter', sans-serif; background-color: #0a0a0a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 2rem; overflow: hidden; }
        .kiosk-frame { width: 100%; max-width: 480px; height: 95vh; max-height: 1000px; background-color: #1a1a1a; border: 16px solid #0f0f0f; border-radius: 48px; box-shadow: 0 0 0 2px #2a2a2a, 0 30px 80px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .kiosk-screen { flex: 1; background-color: #1c1924; padding: 1.25rem; overflow-y: auto; position: relative; }
        .kiosk-screen::before { content: ''; position: absolute; top: -25%; left: 50%; transform: translateX(-50%); width: 80%; height: 60%; background: radial-gradient(circle, rgba(192, 38, 211, 0.35), transparent 70%); filter: blur(120px); z-index: 0; pointer-events: none; }
        .kiosk-screen::-webkit-scrollbar { width: 4px; }
        .kiosk-screen::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  return (
    <div className="kiosk-frame">
      <div className="kiosk-screen">
        <div className="relative z-10">
          <header className="flex items-center gap-4 mb-6">
            <Link
              href="/kiosk"
              className="bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Etkinlikler</h1>
          </header>

          <main className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300">Henüz etkinlik eklenmemiş</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="bg-gray-800/60 rounded-lg overflow-hidden hover:bg-gray-800/80 transition-all"
                  >
                    {event.image && (
                      <div className="relative h-40 bg-gray-700">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{event.storeName}</span>
                        {event.floor && <span>Kat {event.floor}</span>}
                      </div>
                      {(event.startDate || event.endDate) && (
                        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                          {event.startDate && (
                            <div>
                              Başlangıç:{' '}
                              {new Date(event.startDate).toLocaleDateString(
                                'tr-TR'
                              )}
                            </div>
                          )}
                          {event.endDate && (
                            <div>
                              Bitiş:{' '}
                              {new Date(event.endDate).toLocaleDateString(
                                'tr-TR'
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
