'use client';

import React, { useState } from 'react';
import { normalizeRouteMode } from '@/utils/routeMode';

const RouteSelector = ({
  routeMode = 'basit',
  onRouteModeChange,
  onClose,
  onSwap,
  endLocation,
}) => {
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const normalizedMode = normalizeRouteMode(routeMode);

  const modes = [
    { id: 'basit', label: 'Basit', icon: '⚡' },
    { id: 'spor', label: 'Spor', icon: '🏃' },
    { id: 'kesfet', label: 'Keşfet', icon: '🔍' },
  ];

  const currentMode = modes.find(m => m.id === normalizedMode) || modes[0];

  return (
    <div className="relative w-auto max-w-[520px]">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] py-[8px] px-[16px] flex items-center gap-[12px]">
        <div className="flex flex-col items-center justify-between h-[54px] w-[13px] flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="6" stroke="#1B3349" />
            <circle cx="6.5" cy="6.5" r="4.33333" fill="#1B3349" />
          </svg>
          <div className="flex flex-col items-center gap-[5.87px]">
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none"><circle cx="2" cy="2" r="1.63" fill="#1B3349" fillOpacity="0.36" /></svg>
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none"><circle cx="2" cy="2" r="1.63" fill="#1B3349" fillOpacity="0.36" /></svg>
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none"><circle cx="2" cy="2" r="1.63" fill="#1B3349" fillOpacity="0.36" /></svg>
          </div>
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path d="M6.5 7.55C6.07381 7.55 5.66504 7.36563 5.36364 7.03744C5.06224 6.70926 4.89286 6.26407 4.89286 5.8C4.89286 5.33593 5.06224 4.89074 5.36364 4.56256C5.66504 4.23437 6.07381 4.05 6.5 4.05C6.92619 4.05 7.33496 4.23437 7.63636 4.56256C7.93776 4.89074 8.10714 5.33593 8.10714 5.8C8.10714 6.02976 8.06557 6.25738 7.98476 6.46973C7.90395 6.68207 7.78571 6.87487 7.63636 7.03744C7.48701 7.20001 7.31004 7.32877 7.11496 7.41676C6.91988 7.50474 6.71104 7.55 6.5 7.55ZM6.5 0.9C5.30653 0.9 4.16193 1.41625 3.31802 2.33518C2.47411 3.25411 2 4.50043 2 5.8C2 9.475 6.5 14.9 6.5 14.9C6.5 14.9 11 9.475 11 5.8C11 4.50043 10.5259 3.25411 9.68198 2.33518C8.83807 1.41625 7.69347 0.9 6.5 0.9Z" fill="#1B3349" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-[8px] mx-[7px]">
            <span className="text-[#1B3349] text-[13px] font-normal">Konumunuz</span>
            <button onClick={onClose} className="w-[16px] h-[16px] flex items-center justify-center hover:bg-gray-100 rounded">×</button>
          </div>
          <div className="h-[0.77px] bg-[#1B33498F] rounded-[30px] mb-[8px]" />

          <div className="flex items-center mx-[4px] sm:mx-[7px]">
            <span className="text-black text-[11px] sm:text-[13px] font-normal truncate max-w-[120px] sm:max-w-none">
              {endLocation || 'Hedef seçin'}
            </span>
            <div className="flex-1 min-w-[10px] sm:min-w-[20px]" />

            <div className="relative mr-[6px] sm:mr-[10px]">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="px-2 sm:px-4 h-[24px] sm:h-[26px] rounded-[20px] border-[0.5px] border-[#374D60] flex items-center justify-center min-w-[60px] sm:min-w-[70px] hover:bg-gray-50 transition-colors"
              >
                <span className="text-[10px] sm:text-[11px] text-[#1B3349]">{currentMode.label}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`ml-1.5 transition-transform ${showModeDropdown ? 'rotate-180' : ''}`}>
                  <path d="M1 1L5 5L9 1" stroke="#1B3349" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showModeDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                  {modes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onRouteModeChange?.(mode.id);
                        setShowModeDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-[11px] hover:bg-gray-50 flex items-center gap-2 ${normalizedMode === mode.id ? 'bg-blue-50 text-blue-600' : 'text-[#1B3349]'}`}
                    >
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onSwap} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] flex items-center justify-center hover:bg-gray-100 rounded flex-shrink-0">
              ↕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;
