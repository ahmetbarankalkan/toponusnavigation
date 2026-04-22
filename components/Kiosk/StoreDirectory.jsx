// components/kiosk/StoreDirectory.jsx
'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function StoreDirectory({ rooms, onRoomSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    // Sadece 'room' tipindeki yerleri al ve isme göre sırala
    return rooms
      .filter(room => room.type === 'room' && !room.is_special)
      .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rooms, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Arama Çubuğu */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Mağaza ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Mağaza Listesi */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length > 0 ? (
          <ul>
            {filteredRooms.map(room => (
              <li key={room.id}>
                <button
                  onClick={() => onRoomSelect(room)}
                  className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors duration-150 flex items-center gap-3"
                >
                  {room.logo && (
                    <img 
                      src={room.logo} 
                      alt={`${room.name} logo`}
                      className="w-8 h-8 object-contain rounded-md border border-gray-200"
                    />
                  )}
                  <span className="font-medium text-gray-800">{room.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Aramanızla eşleşen mağaza bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
