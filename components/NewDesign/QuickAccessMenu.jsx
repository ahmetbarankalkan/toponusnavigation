'use client';

import React from 'react';
import { MapPin, Baby, DoorOpen } from 'lucide-react';

export default function QuickAccessMenu({
  handleDetectCurrentLocation,
  isDetectingLocation,
  handleQuickAccessItemClick,
  routeSteps = [],
  isKioskMode = false,
}) {
  // Sadece rota yokken ve kiosk modunda değilken göster
  if (routeSteps.length || isKioskMode) return null;

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Konum Butonu */}
        <button
          onClick={handleDetectCurrentLocation}
          disabled={isDetectingLocation}
          className={`flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50 ${
            isDetectingLocation
              ? 'bg-blue-100/80 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          <MapPin
            className={`w-4 h-4 ${
              isDetectingLocation ? 'text-blue-600' : 'text-white'
            }`}
          />
          <span
            className={`font-medium text-sm ${
              isDetectingLocation ? 'text-blue-600' : 'text-white'
            }`}
          >
            {isDetectingLocation ? 'Tespit ediliyor...' : 'Konum'}
          </span>
        </button>

        {/* Test Konum - Sadece development modda */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              console.log('🧪 Test konumu butonu tıklandı');
              handleDetectCurrentLocation();
            }}
            className="flex items-center gap-1.5 bg-orange-500/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
            <span className="text-white font-medium text-sm">Test</span>
          </button>
        )}

        {/* Eczane */}
        <button
          onClick={() => handleQuickAccessItemClick('pharmacy')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
        >
          <svg
            className="w-3.5 h-3.5 text-[#00334E]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 4.74L11.38 8.26L8 8.5L11.38 8.74L12 12.26L12.62 8.74L16 8.5L12.62 8.26L12 4.74Z" />
          </svg>
          <span className="text-[#00334E] font-medium text-xs">Eczane</span>
        </button>

        {/* WC */}
        <button
          onClick={() => handleQuickAccessItemClick('wc')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
        >
          <svg
            className="w-3.5 h-3.5 text-[#00334E]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5,22V16H3V10A1,1 0 0,1 4,9H8A1,1 0 0,1 9,10V16H7V22H5M18,22V16H16V10A1,1 0 0,1 17,9H21A1,1 0 0,1 22,10V16H20V22H18M4,8V7A3,3 0 0,1 7,4A3,3 0 0,1 10,7V8H4M17,8V7A3,3 0 0,1 20,4A3,3 0 0,1 23,7V8H17Z" />
          </svg>
          <span className="text-[#00334E] font-medium text-xs">WC</span>
        </button>

        {/* Bebek */}
        <button
          onClick={() => handleQuickAccessItemClick('baby-care')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
        >
          <Baby className="w-3.5 h-3.5 text-[#00334E]" />
          <span className="text-[#00334E] font-medium text-xs">Bebek</span>
        </button>

        {/* ATM */}
        <button
          onClick={() => handleQuickAccessItemClick('atm')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
        >
          <svg
            className="w-3.5 h-3.5 text-[#00334E]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11,17H13V16H14A1,1 0 0,0 15,15V12A1,1 0 0,0 14,11H10A1,1 0 0,0 9,12V15A1,1 0 0,0 10,16H11V17M11,13H13V14H11V13M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
          </svg>
          <span className="text-[#00334E] font-medium text-xs">ATM</span>
        </button>

        {/* Çıkış */}
        <button
          onClick={() => handleQuickAccessItemClick('exit')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap border border-gray-200/50"
        >
          <DoorOpen className="w-3.5 h-3.5 text-[#00334E]" />
          <span className="text-[#00334E] font-medium text-xs">Çıkış</span>
        </button>
      </div>
    </div>
  );
}
