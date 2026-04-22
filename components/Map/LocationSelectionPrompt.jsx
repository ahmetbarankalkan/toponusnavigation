'use client';

import { MapPin } from 'lucide-react';

export default function LocationSelectionPrompt({
  isSelectingStartRoom,
  selectedEndRoom,
  onCancel,
}) {
  if (!isSelectingStartRoom || !selectedEndRoom) return null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 flex flex-col items-center gap-3">
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 border-4 border-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Haritadan Tıklayın</p>
            <p className="text-xs text-white/90">Şu anki konumunuzu seçin</p>
          </div>
        </div>
      </div>

      {/* İptal Butonu */}
      <button
        onClick={onCancel}
        className="bg-white text-gray-700 px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-bold text-sm border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all transform hover:scale-105"
      >
        ✕ Seçimi İptal Et
      </button>
    </div>
  );
}
