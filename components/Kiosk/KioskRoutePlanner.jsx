// components/Kiosk/KioskRoutePlanner.jsx
'use client';

import { X, Navigation, MapPin, Search } from 'lucide-react';

/**
 * Rota planlama arayüzü. Başlangıç ve varış noktası seçimi.
 *
 * @param {object} props - Komponent propları
 * @param {boolean} props.isOpen - Panelin görünür olup olmadığı.
 * @param {function} props.onClose - Paneli kapatma fonksiyonu.
 * @param {function} props.onCalculateRoute - Rota hesaplama fonksiyonu.
 * @param {object} props.startRoom - Başlangıç odası.
 * @param {object} props.endRoom - Varış odası.
 * @param {function} props.onSelectStart - Başlangıç odası seçimi için arama modalını açar.
 * @param {function} props.onSelectEnd - Varış odası seçimi için arama modalını açar.
 */
export default function KioskRoutePlanner({
  isOpen,
  onClose,
  onCalculateRoute,
  startRoom,
  endRoom,
  onSelectStart,
  onSelectEnd,
}) {
  const canCalculate = startRoom && endRoom;

  const handleCalculate = () => {
    if (canCalculate) {
      onCalculateRoute(startRoom.id, endRoom.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-t-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Rota Planla</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Route Points */}
        <div className="p-6 space-y-4">
          {/* Start Point */}
          <div className="flex items-center gap-4">
            <MapPin className="text-green-500" size={28} />
            <button
              onClick={onSelectStart}
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <p className="text-sm text-gray-500">Başlangıç</p>
              <p className="font-bold text-lg text-gray-800">
                {startRoom ? startRoom.name : 'Başlangıç noktası seçin...'}
              </p>
            </button>
          </div>

          {/* End Point */}
          <div className="flex items-center gap-4">
            <MapPin className="text-red-500" size={28} />
            <button
              onClick={onSelectEnd}
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <p className="text-sm text-gray-500">Varış</p>
              <p className="font-bold text-lg text-gray-800">
                {endRoom ? endRoom.name : 'Varış noktası seçin...'}
              </p>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="w-full h-16 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-3 text-xl font-bold transition-all hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Navigation size={24} />
            <span>Rotayı Hesapla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
