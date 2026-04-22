// components/kiosk/RoutePlanner.jsx
'use client';

import { useState, useMemo } from 'react';
import { X, ArrowRight, MapPin, Navigation } from 'lucide-react';

export default function RoutePlanner({ rooms, onCalculateRoute }) {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startRoom, setStartRoom] = useState(null);
  const [endRoom, setEndRoom] = useState(null);
  const [activeInput, setActiveInput] = useState('end'); // 'start' or 'end'

  const storeList = useMemo(() => {
    return rooms
      .filter(room => room.type === 'room' && !room.is_special)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rooms]);

  const handleSelectRoom = room => {
    if (activeInput === 'start') {
      setStartRoom(room);
      setStartQuery(room.name);
    } else {
      setEndRoom(room);
      setEndQuery(room.name);
    }
    // Otomatik olarak diğer input'a geç
    setActiveInput(activeInput === 'start' ? 'end' : 'start');
  };

  const filteredList = useMemo(() => {
    const query = activeInput === 'start' ? startQuery : endQuery;
    if (!query) return storeList;
    return storeList.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [startQuery, endQuery, activeInput, storeList]);

  const handleRouteClick = () => {
    if (startRoom && endRoom) {
      onCalculateRoute(startRoom.id, endRoom.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Input Alanları - Modern */}
      <div className="p-6 space-y-4 border-b border-gray-200 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div
              className={`w-3 h-3 rounded-full ${
                startRoom ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></div>
          </div>
          <input
            type="text"
            placeholder="Başlangıç noktası seçin"
            value={startQuery}
            onChange={e => setStartQuery(e.target.value)}
            onFocus={() => setActiveInput('start')}
            className={`w-full bg-white border-2 rounded-2xl pl-10 pr-10 py-4 text-base font-medium focus:outline-none transition-all ${
              activeInput === 'start'
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {startQuery && (
            <button
              onClick={() => {
                setStartQuery('');
                setStartRoom(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex justify-center">
          <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-transparent"></div>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <MapPin
              className={`w-4 h-4 ${
                endRoom ? 'text-green-500' : 'text-gray-300'
              }`}
            />
          </div>
          <input
            type="text"
            placeholder="Hedef mağazayı seçin"
            value={endQuery}
            onChange={e => setEndQuery(e.target.value)}
            onFocus={() => setActiveInput('end')}
            className={`w-full bg-white border-2 rounded-2xl pl-10 pr-10 py-4 text-base font-medium focus:outline-none transition-all ${
              activeInput === 'end'
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {endQuery && (
            <button
              onClick={() => {
                setEndQuery('');
                setEndRoom(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <button
          onClick={handleRouteClick}
          disabled={!startRoom || !endRoom}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black text-lg py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
        >
          <Navigation className="w-5 h-5" />
          <span>Rota Oluştur</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mağaza Listesi - Modern */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-6 py-3 text-sm font-bold text-gray-600 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
          {activeInput === 'start'
            ? '📍 Başlangıç için bir mağaza seçin'
            : '🎯 Hedef için bir mağaza seçin'}
        </div>
        {filteredList.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredList.map(room => (
              <li key={room.id}>
                <button
                  onClick={() => handleSelectRoom(room)}
                  className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                    {room.logo ? (
                      <img
                        src={room.logo}
                        alt={`${room.name} logo`}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <MapPin className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900 block truncate group-hover:text-blue-600 transition-colors">
                      {room.name}
                    </span>
                    {room.floor !== undefined && (
                      <span className="text-sm text-gray-500">
                        Kat {room.floor === 0 ? 'Zemin' : room.floor}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Mağaza bulunamadı</p>
            <p className="text-sm mt-1">Farklı bir arama deneyin</p>
          </div>
        )}
      </div>
    </div>
  );
}
