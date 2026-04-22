/**
 * Search Results Component
 * Arama sonuçları dropdown'ı
 */

export default function SearchResults({ results, onSelect }) {
  if (!results || results.length === 0) return null;

  const getSpecialTypeLabel = type => {
    const labels = {
      'wc-male': '🚹 Erkek Tuvaleti',
      'wc-female': '🚺 Kadın Tuvaleti',
      'wc-disabled': '♿ Engelli Tuvaleti',
      atm: '🏧 ATM',
      pharmacy: '💊 Eczane',
      'emergency-exit': '🚪 Acil Çıkış',
      'fire-exit': '🔥 Yangın Merdiveni',
      'baby-care': '👶 Bebek Bakım',
      'first-aid': '🏥 İlk Yardım',
      'info-desk': 'ℹ️ Bilgi Masası',
    };
    return labels[type] || '';
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[250]">
      {results.slice(0, 10).map(room => (
        <div
          key={room.id}
          onClick={() => onSelect(room)}
          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
            room.isCurrentLocation
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {room.isCurrentLocation && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              <div>
                <div
                  className={`font-medium text-sm ${
                    room.isCurrentLocation ? 'text-green-700' : 'text-gray-900'
                  }`}
                >
                  {room.name}
                </div>
                {room.is_special && (
                  <div className="text-xs text-brand-dark mt-1">
                    {getSpecialTypeLabel(room.special_type)}
                  </div>
                )}
                {room.isCurrentLocation && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    Bu konuma gitmek için başlangıç noktası olarak ayarlanacak
                  </div>
                )}
              </div>
            </div>
            <div
              className={`text-xs ${
                room.isCurrentLocation ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              Kat {room.floor === 0 ? 'Zemin' : room.floor}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
