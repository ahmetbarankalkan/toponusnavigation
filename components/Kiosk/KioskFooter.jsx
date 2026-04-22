// components/Kiosk/KioskFooter.jsx
'use client';

import { Layers, Navigation, Compass, Sparkles } from 'lucide-react';

/**
 * Kiosk arayüzünün alt (footer) bölümü.
 * Kat değiştirme ve ana eylem butonlarını içerir.
 */
export default function KioskFooter({
  availableFloors,
  currentFloor,
  onFloorChange,
  onRoutePlannerClick,
  onDiscoverClick,
  onAssistantClick,
}) {
  return (
    <div className="w-full flex items-end justify-between">
      {/* Ana Eylem Butonları */}
      <div className="flex items-center gap-4">
        <ActionButton
          icon={Navigation}
          label="Rota Oluştur"
          onClick={onRoutePlannerClick}
        />
        <ActionButton
          icon={Compass}
          label="Keşfet"
          onClick={onDiscoverClick}
        />
        <ActionButton
          icon={Sparkles}
          label="AI Asistan"
          onClick={onAssistantClick}
        />
      </div>

      {/* Kat Değiştirme Butonları */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-2 flex flex-col items-center gap-1">
        <div className="p-2">
          <Layers size={24} className="text-gray-700" />
        </div>
        {availableFloors.map(floor => (
          <button
            key={floor}
            onClick={() => onFloorChange(floor)}
            className={`w-12 h-12 rounded-lg text-xl font-bold transition-all ${
              currentFloor === floor
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
            }`}
          >
            {floor === 0 ? 'Z' : floor}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg w-32 h-28 flex flex-col items-center justify-center gap-2 hover:bg-white transition-colors"
    >
      <Icon size={32} className="text-blue-500" />
      <span className="text-gray-800 font-bold text-md text-center">
        {label}
      </span>
    </button>
  );
}
