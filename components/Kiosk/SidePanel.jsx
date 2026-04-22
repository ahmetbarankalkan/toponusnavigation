// components/kiosk/SidePanel.jsx
'use client';

import { useState } from 'react';
import { MapPin, Compass } from 'lucide-react';
import RoutePlanner from './RoutePlanner';
import DiscoverSection from './DiscoverSection';
import KioskAssistant from './KioskAssistant';
import QRCodeCTA from './QRCodeCTA';

export default function SidePanel({
  rooms,
  placeName,
  onCalculateRoute,
  onRoomSelect,
}) {
  const [activeTab, setActiveTab] = useState('route'); // Varsayılan olarak rota sekmesi aktif

  const kioskUrl =
    'https://clownfish-app-cc787.ondigitalocean.app/?slug=ankamall';

  // Keşfet bölümünden bir oda seçildiğinde, rota sekmesine geç ve hedefi ayarla
  const handleDiscoverSelect = room => {
    onRoomSelect(room); // Bu, ana sayfada hedef odayı ayarlayacak
    setActiveTab('route'); // Rota sekmesine geç
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50/50">
      {/* Başlık Alanı - Modern */}
      <header className="p-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black">{placeName}</h1>
          </div>
          <p className="text-blue-100 text-lg font-medium ml-15">
            Navigasyon Kiosku
          </p>
        </div>
      </header>

      {/* Tab Navigasyonu - Modern */}
      <nav className="flex bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all relative ${
            activeTab === 'route'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Compass className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Rota Planla</span>
            <span className="sm:hidden">Rota</span>
          </div>
          {activeTab === 'route' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all relative ${
            activeTab === 'discover'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            <span>Keşfet</span>
          </div>
          {activeTab === 'discover' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-4 text-sm md:text-base font-bold transition-all relative ${
            activeTab === 'assistant'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span>Asistan</span>
          </div>
          {activeTab === 'assistant' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
          )}
        </button>
      </nav>

      {/* İçerik Alanı */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'route' && (
          <RoutePlanner rooms={rooms} onCalculateRoute={onCalculateRoute} />
        )}
        {activeTab === 'discover' && (
          <DiscoverSection rooms={rooms} onRoomSelect={handleDiscoverSelect} />
        )}
        {activeTab === 'assistant' && (
          <KioskAssistant rooms={rooms} onRoomSelect={handleDiscoverSelect} />
        )}
      </div>

      {/* Alt QR Kod Alanı */}
      <footer className="border-t border-gray-200 bg-white">
        <QRCodeCTA url={kioskUrl} />
      </footer>
    </div>
  );
}
