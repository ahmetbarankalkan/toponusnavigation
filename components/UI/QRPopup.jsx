/**
 * QR Popup Component
 * QR kod taraması sonrası "Şu an buradasınız" popup'ı
 */

import { MapPin, X } from 'lucide-react';

export default function QRPopup({ room, onClose }) {
  if (!room) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 border-4 border-white max-w-sm">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-8 h-8 text-white animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium opacity-90 mb-1">
            Şu an buradasınız
          </div>
          <div className="text-lg font-bold">{room.name}</div>
          <div className="text-xs opacity-75 mt-1">
            Kat {room.floor === 0 ? 'Zemin' : room.floor}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
