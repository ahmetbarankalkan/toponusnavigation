/**
 * Marker oluşturma ve yönetme yardımcı fonksiyonları
 */

/**
 * Konum marker HTML elementi oluşturur
 */
export const createLocationMarkerElement = (floor, isKioskMode = false, description = '') => {
  const markerElement = document.createElement('div');
  const locationText = isKioskMode ? '📍 Kiosk Konumu' : '📍 Şu an buradasınız';
  const markerColor = isKioskMode ? '#3B82F6' : '#ef4444';
  const markerColorDark = isKioskMode ? '#2563EB' : '#dc2626';
  
  markerElement.innerHTML = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto; transform-origin: center bottom;">
      <!-- Popup -->
      <div style="background: linear-gradient(135deg, ${markerColor} 0%, ${markerColorDark} 100%); color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); padding: 8px 12px; margin-bottom: 8px; border: 3px solid white; position: relative;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="font-size: 11px; font-weight: 700; white-space: nowrap;">${locationText}</div>
          <button onclick="window.closeLocationMarker()" style="width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;">
            <svg style="width: 12px; height: 12px;" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div style="font-size: 9px; opacity: 0.9; margin-top: 2px;">
          Kat ${floor === 0 ? 'Zemin' : floor}${description ? ` - ${description}` : ''}
        </div>
        <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 100%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${markerColorDark};"></div>
      </div>

      <!-- Ana konum ikonu -->
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; inset: 0; width: 32px; height: 32px; background: ${isKioskMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 32px; height: 32px; background: linear-gradient(135deg, ${markerColor} 0%, ${markerColorDark} 100%); border-radius: 50%; box-shadow: 0 4px 12px ${isKioskMode ? 'rgba(37, 99, 235, 0.5)' : 'rgba(220, 38, 38, 0.5)'}; display: flex; align-items: center; justify-content: center; border: 3px solid white;">
          <svg style="width: 18px; height: 18px; color: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 20px; height: 6px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(3px);"></div>
      </div>
    </div>
    <style>
      @keyframes ping {
        75%, 100% { transform: scale(1.5); opacity: 0; }
      }
    </style>
  `;
  return markerElement;
};

/**
 * Marker boyutunu zoom'dan bağımsız sabit tutar
 */
export const keepMarkerSizeFixed = (marker) => {
  const markerEl = marker.getElement();
  if (markerEl && markerEl.style.transform) {
    const fixedTransform = markerEl.style.transform.replace(
      /scale\([^)]+\)/g,
      'scale(1)'
    );
    markerEl.style.transform = fixedTransform;
  }
};

/**
 * Haritada marker oluşturur ve zoom event'lerini ayarlar
 */
export const createMapMarker = (maplibregl, map, coordinates, markerElement, onClose) => {
  // Kapatma fonksiyonu
  window.closeLocationMarker = onClose;

  // MapLibre marker oluştur
  const marker = new maplibregl.Marker({
    element: markerElement,
    anchor: 'bottom',
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
  })
    .setLngLat(coordinates)
    .addTo(map);

  // Zoom değişikliklerinde marker boyutunu sabit tut
  const fixSize = () => keepMarkerSizeFixed(marker);
  map.on('zoom', fixSize);
  map.on('move', fixSize);
  setTimeout(fixSize, 100);

  return marker;
};

/**
 * Koordinat odası objesi oluşturur
 */
export const createCoordinateRoom = (coordinates, floor, name = 'Koridor Noktası') => {
  return {
    id: `coordinate-${Date.now()}`,
    name,
    floor,
    coordinates,
    center: coordinates,
    doorId: `coordinate-door-${Date.now()}`,
    isCoordinate: true,
    is_special: false,
  };
};

/**
 * Cookie okuma fonksiyonu
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};
