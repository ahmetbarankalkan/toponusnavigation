// components/Kiosk/KioskSearchModal.jsx
'use client';

import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

/**
 * Mağaza/oda aramak için kullanılan modal bileşeni.
 *
 * @param {object} props - Komponent propları
 * @param {boolean} props.isOpen - Modal'ın görünür olup olmadığı.
 * @param {function} props.onClose - Modal'ı kapatma fonksiyonu.
 * @param {function} props.onRoomSelect - Bir oda seçildiğinde çağrılan fonksiyon.
 * @param {Array} props.rooms - Aranacak odaların/mağazaların listesi.
 */
export default function KioskSearchModal({
  isOpen,
  onClose,
  onRoomSelect,
  rooms,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return [];
    return rooms
      .filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 50); // Performans için sonuçları sınırla
  }, [searchTerm, rooms]);

  const handleSelect = room => {
    onRoomSelect(room);
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Mağaza Ara</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Mağaza veya kategori adı..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-gray-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl h-14 pl-12 pr-4 text-lg text-gray-800 outline-none transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-grow overflow-y-auto px-4 pb-4">
          {searchTerm && filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                "{searchTerm}" ile eşleşen sonuç bulunamadı.
              </p>
            </div>
          )}
          <ul className="space-y-2">
            {filteredRooms.map(room => (
              <li key={room.id}>
                <button
                  onClick={() => handleSelect(room)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <p className="font-bold text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-500">
                    Kat: {room.floor === 0 ? 'Zemin' : room.floor}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
