'use client';
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

/**
 * Harita üzerinde rota başlangıç/bitiş noktalarında gösterilecek mağaza kartı
 */
const RouteStoreMarker = ({ store, type, onClick }) => {
  const isStart = type === 'start';
  const bgColor = isStart
    ? 'from-green-500 to-green-600'
    : 'from-blue-500 to-blue-600';
  const label = isStart ? 'Başlangıç' : 'Hedef';

  return (
    <div
      className="relative flex flex-col items-center pointer-events-auto cursor-pointer"
      onClick={onClick}
    >
      {/* Mağaza Kartı */}
      <div
        className={`bg-gradient-to-r ${bgColor} text-white rounded-2xl shadow-2xl px-4 py-3 mb-2 border-4 border-white min-w-[200px] hover:scale-105 transition-transform`}
      >
        <div className="flex items-center gap-3">
          {/* Logo veya İlk Harf */}
          <div
            className="bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              width: '56px',
              height: '56px',
              padding: '8px',
            }}
          >
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-white font-bold text-lg">${store.name?.charAt(
                    0
                  ) || 'M'}</span>`;
                }}
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {store.name?.charAt(0) || 'M'}
              </span>
            )}
          </div>

          {/* Mağaza Bilgileri */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold opacity-40">{label}</span>
              {isStart ? (
                <MapPin className="w-3 h-3 opacity-40" />
              ) : (
                <Navigation className="w-3 h-3 opacity-40" />
              )}
            </div>
            <div className="font-bold text-sm leading-tight truncate">
              {store.name}
            </div>
            <div className="text-xs opacity-50 mt-0.5">
              Kat {store.floor === 0 ? 'Zemin' : store.floor}
            </div>
          </div>
        </div>

        {/* Alt ok işareti */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div
            className={`w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent ${
              isStart ? 'border-t-green-600' : 'border-t-blue-600'
            }`}
          ></div>
        </div>
      </div>

      {/* Pin noktası */}
      <div
        className={`w-6 h-6 bg-gradient-to-r ${bgColor} border-4 border-white rounded-full shadow-lg`}
      ></div>
    </div>
  );
};

export default RouteStoreMarker;
