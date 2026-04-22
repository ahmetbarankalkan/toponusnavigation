// components/Kiosk/KioskHeader.jsx
'use client';

import { Search, ArrowLeft } from 'lucide-react';

/**
 * Kiosk arayüzünün başlık (header) bölümü.
 * Arama çubuğu ve AVM adını içerir.
 *
 * @param {object} props - Komponent propları
 * @param {string} props.placeName - Görüntülenecek yer adı (örn: AVM adı).
 * @param {function} props.onSearchClick - Arama butonuna tıklandığında çağrılacak fonksiyon.
 * @param {function} props.onBackClick - Geri butonuna tıklandığında çağrılacak fonksiyon (opsiyonel).
 */
export default function KioskHeader({ placeName, onSearchClick, onBackClick }) {
  return (
    <div className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="text-gray-700" size={24} />
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800">{placeName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Search className="text-gray-700" size={24} />
        </button>
      </div>
    </div>
  );
}
