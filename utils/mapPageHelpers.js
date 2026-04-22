/**
 * Map Page Helper Functions
 * Ana sayfa için yardımcı fonksiyonlar
 */

/**
 * Kullanıcının mevcut konumunu tespit eder
 */
export async function handleDetectCurrentLocation({
  isDetectingLocation,
  setIsDetectingLocation,
  rooms,
  currentFloor,
  setCurrentFloor,
  changeFloor,
  setSelectedStartRoom,
  setStartQuery,
  mapRef,
  setRooms,
  setLocationMarkerCoords,
  setLocationMarkerFloor,
  setShowLocationMarker,
  addMessage,
  setActiveNavItem,
  setIsCardMinimized,
}) {
  if (isDetectingLocation) return;

  setIsDetectingLocation(true);

  try {
    const { detectUserLocation } = await import('./locationHelpers.js');
    const locationResult = await detectUserLocation(rooms, true);

    if (locationResult.type === 'room') {
      // Oda bulundu
      const room = locationResult.room;

      // Kata geç
      if (room.floor !== currentFloor) {
        setCurrentFloor(room.floor);
        changeFloor(room.floor);
      }

      // Başlangıç noktası olarak ayarla
      setSelectedStartRoom(room.id);
      setStartQuery(`📍 ${room.name} - Şu an buradasınız`);

      // Haritada göster
      if (mapRef.current && room.coordinates) {
        setTimeout(
          () => {
            mapRef.current.flyTo({
              center: room.coordinates,
              zoom: 19,
              duration: 1500,
            });

            // Marker ekle
            setTimeout(() => {
              createLocationMarker(room, mapRef);
            }, 500);
          },
          room.floor !== currentFloor ? 1000 : 0
        );
      }

      // Chat mesajı ekle
      addMessage({
        role: 'assistant',
        content: `📍 Konumunuz tespit edildi! ${
          room.name
        } yakınında bulunuyorsunuz. (Kat ${
          room.floor === 0 ? 'Zemin' : room.floor
        })\n\nNereye gitmek istiyorsunuz?`,
      });
    } else if (locationResult.type === 'coordinate') {
      // Koordinat konumu
      const coordinateRoom = {
        id: `current-location-${Date.now()}`,
        name: locationResult.name,
        floor: locationResult.floor,
        coordinates: locationResult.coordinates,
        isCoordinate: true,
        isCurrentLocation: true,
      };

      // Koordinat odasını rooms listesine ekle
      setRooms(prevRooms => {
        const filteredRooms = prevRooms.filter(r => !r.isCurrentLocation);
        return [...filteredRooms, coordinateRoom];
      });

      // Kata geç
      if (locationResult.floor !== currentFloor) {
        setCurrentFloor(locationResult.floor);
        changeFloor(locationResult.floor);
      }

      // Konum marker'ını göster
      setLocationMarkerCoords(locationResult.coordinates);
      setLocationMarkerFloor(locationResult.floor);
      setShowLocationMarker(true);

      // Başlangıç noktası olarak ayarla
      setSelectedStartRoom(coordinateRoom.id);
      setStartQuery(coordinateRoom.name);

      // Haritada göster
      if (mapRef.current) {
        setTimeout(
          () => {
            mapRef.current.flyTo({
              center: locationResult.coordinates,
              zoom: 19,
              duration: 1500,
            });

            setTimeout(() => {
              createCoordinateMarker(locationResult, mapRef);
            }, 500);
          },
          locationResult.floor !== currentFloor ? 1000 : 0
        );
      }

      // Chat mesajı ekle
      addMessage({
        role: 'assistant',
        content: `📍 Konumunuz tespit edildi! ${
          locationResult.description
        } bölgesinde bulunuyorsunuz. (Kat ${
          locationResult.floor === 0 ? 'Zemin' : locationResult.floor
        })\n\nNereye gitmek istiyorsunuz?`,
      });
    }

    // Rota kartını aç
    setActiveNavItem(0);
    setIsCardMinimized(false);
  } catch (error) {
    // Hata mesajı göster
    addMessage({
      role: 'assistant',
      content:
        '❌ Konumunuz tespit edilemedi. Lütfen konum izinlerinizi kontrol edin veya manuel olarak başlangıç noktanızı seçin.',
    });
  } finally {
    setIsDetectingLocation(false);
  }
}

/**
 * Oda için konum marker'ı oluşturur
 */
function createLocationMarker(room, mapRef) {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div class="relative flex flex-col items-center pointer-events-auto">
      <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl px-4 py-3 mb-2 border-4 border-white animate-pulse">
        <div class="flex items-center gap-2">
          <div class="text-sm font-bold">📍 Şu an buradasınız</div>
          <button onclick="window.closeCurrentLocationMarker()" class="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="text-xs opacity-90 mt-1">
          Kat ${room.floor === 0 ? 'Zemin' : room.floor} - ${room.name} yakını
        </div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div class="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-green-600"></div>
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-0 w-16 h-16 bg-green-500/30 rounded-full animate-ping"></div>
        <div class="absolute inset-2 w-12 h-12 bg-green-500/50 rounded-full animate-pulse"></div>
        <div class="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
          <svg class="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="absolute top-full left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
      </div>
    </div>
  `;

  window.closeCurrentLocationMarker = () => {
    if (window.currentLocationMarkerInstance) {
      window.currentLocationMarkerInstance.remove();
      window.currentLocationMarkerInstance = null;
    }
  };

  const maplibregl = require('maplibre-gl');
  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: 'bottom',
  })
    .setLngLat(room.coordinates)
    .addTo(mapRef.current);

  window.currentLocationMarkerInstance = marker;
}

/**
 * Koordinat için konum marker'ı oluşturur
 */
function createCoordinateMarker(locationResult, mapRef) {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div class="relative flex flex-col items-center pointer-events-auto">
      <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl px-4 py-3 mb-2 border-4 border-white animate-pulse">
        <div class="flex items-center gap-2">
          <div class="text-sm font-bold">📍 Şu an buradasınız</div>
          <button onclick="window.closeCurrentLocationMarker()" class="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="text-xs opacity-90 mt-1">
          Kat ${
            locationResult.floor === 0 ? 'Zemin' : locationResult.floor
          } - ${locationResult.description}
        </div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div class="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-green-600"></div>
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-0 w-16 h-16 bg-green-500/30 rounded-full animate-ping"></div>
        <div class="absolute inset-2 w-12 h-12 bg-green-500/50 rounded-full animate-pulse"></div>
        <div class="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
          <svg class="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="absolute top-full left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
      </div>
    </div>
  `;

  window.closeCurrentLocationMarker = () => {
    if (window.currentLocationMarkerInstance) {
      window.currentLocationMarkerInstance.remove();
      window.currentLocationMarkerInstance = null;
    }
  };

  const maplibregl = require('maplibre-gl');
  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: 'bottom',
  })
    .setLngLat(locationResult.coordinates)
    .addTo(mapRef.current);

  window.currentLocationMarkerInstance = marker;
}

/**
 * Cookie okuma fonksiyonu
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(';')
      .shift();
  return null;
}
