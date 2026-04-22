/**
 * Floor Selector Component
 * Kat seçimi için açılır/kapanır panel
 */

import { useState } from 'react';
import { Building2, Map } from 'lucide-react';

export default function FloorSelector({
  floors,
  currentFloor,
  isOpen,
  onToggle,
  onFloorChange,
  isDiscoverOpen = false,
  mapView,
  setMapView,
}) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div
      className={`absolute top-full left-0 mt-8 sm:mt-10 transition-all duration-300 ${
        isDiscoverOpen ? 'z-[40]' : 'z-[50]'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* KAT SEÇİCİ */}
        <div className="flex flex-col items-center gap-0.5 px-1 py-0.5">
          {/* Tıklanabilir başlık */}
          <button
            onClick={onToggle}
            className="relative w-14 flex items-center justify-center pr-3 gap-0.5 text-[8px] font-bold text-[#1B3349] hover:text-[#1B3349]/80 transition-colors cursor-pointer bg-white rounded-md py-0.5 shadow-sm"
          >
            <div className="flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" />
              <span>KAT</span>
            </div>
            {/* Açılır/kapanır ok ikonu */}
            <svg
              className={`absolute right-1 w-2 h-2 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Kat butonları - sadece panel açıkken göster */}
          {isOpen && (
            <>
              <div className="w-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-0.5"></div>
              {floors
                .sort((a, b) => b - a)
                .map(floor => (
                  <button
                    key={floor}
                    onClick={() => {
                      console.log(`🔘 Kat butonu tıklandı: ${floor}`);
                      onFloorChange(floor);
                    }}
                    className={`
                      w-6 h-6 rounded-md font-bold text-xs
                      transition-all duration-200 hover:scale-110 relative
                      ${
                        currentFloor === floor
                          ? 'bg-[#1B3349] text-white shadow-md shadow-black/30 scale-105'
                          : 'bg-white text-[#1B3349] hover:bg-white/80 hover:shadow-sm'
                      }
                    `}
                  >
                    {floor}
                    {currentFloor === floor && (
                      <div className="absolute inset-0 rounded-md ring-1 ring-[#1B3349]/30 ring-offset-1"></div>
                    )}
                  </button>
                ))}
            </>
          )}
        </div>

        {/* HARİTA GÖRÜNÜM SEÇİCİ */}
        <div className="flex flex-col items-center gap-0.5 px-1 py-0.5">
          <button
            onClick={() => setIsMapOpen(!isMapOpen)}
            className="relative w-14 flex items-center pl-0.5 gap-0 text-[8px] font-bold text-[#1B3349] hover:text-[#1B3349]/80 transition-colors cursor-pointer bg-white rounded-md py-0.5 shadow-sm"
          >
            <div className="flex items-center gap-0.5">
              <Map className="w-2.5 h-2.5" />
              <span className="tracking-tighter">HARİTA</span>
            </div>
            <svg
              className={`absolute right-1 w-2 h-2 transition-transform duration-200 ${
                isMapOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isMapOpen && (
            <>
              <div className="w-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-0.5"></div>
              {['2D', '3D'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setMapView(mode)}
                  className={`
                    w-6 h-6 rounded-md font-bold text-[10px]
                    transition-all duration-200 hover:scale-110 relative flex items-center justify-center
                    ${
                      mapView === mode
                        ? 'bg-[#1B3349] text-white shadow-md shadow-black/30 scale-105'
                        : 'bg-white text-[#1B3349] hover:bg-white/80 hover:shadow-sm'
                    }
                  `}
                >
                  {mode}
                  {mapView === mode && (
                    <div className="absolute inset-0 rounded-md ring-1 ring-[#1B3349]/30 ring-offset-1"></div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
