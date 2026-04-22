/**
 * Map Helper Functions
 * Harita işlemleri için yardımcı fonksiyonlar
 */

/**
 * Haritayı path'e göre fit et
 */
export function fitMapToPath(map, coords) {
  if (!map || !coords || coords.length < 2) return;

  try {
    // Path'in sınırlarını hesapla
    let minLng = coords[0][0],
      maxLng = coords[0][0];
    let minLat = coords[0][1],
      maxLat = coords[0][1];

    coords.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    // Haritayı bu sınırlara odakla
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
        maxZoom: 20,
      }
    );
  } catch (error) {
    console.error('Error fitting map to path:', error);
  }
}

/**
 * Oda highlight işlemi
 */
export function highlightRoom(map, roomIdOrFeature, targetFloor, geojsonURLS) {
  if (!map) return;

  let roomId = null;
  let floor = targetFloor;

  if (typeof roomIdOrFeature === 'object' && roomIdOrFeature.properties) {
    roomId = roomIdOrFeature.properties.id;
    floor = roomIdOrFeature.properties.floor || targetFloor;
  } else {
    roomId = roomIdOrFeature;
  }

  if (!roomId) {
    console.warn('highlightRoom: roomId bulunamadı');
    return;
  }

  Object.keys(geojsonURLS).forEach(floorKey => {
    const layerId = `rooms-floor-${floorKey}`;
    if (map.getLayer(layerId)) {
      try {
        if (parseInt(floorKey) === floor) {
          map.setPaintProperty(layerId, 'fill-extrusion-color', [
            'case',
            ['==', ['get', 'id'], roomId],
            '#1B3349',
            '#F5F0FF',
          ]);
        } else {
          map.setPaintProperty(layerId, 'fill-extrusion-color', '#F5F0FF');
        }
      } catch (error) {
        console.warn(`Could not highlight room on floor ${floorKey}:`, error);
      }
    }
  });
}

/**
 * QR highlight işlemi
 */
export function highlightQrRoom(map, roomId, floor, geojsonURLS) {
  if (!map || !map.isStyleLoaded()) return;

  Object.keys(geojsonURLS).forEach(floorKey => {
    const layerId = `rooms-floor-${floorKey}`;
    if (map.getLayer(layerId)) {
      try {
        if (parseInt(floorKey) === floor) {
          map.setPaintProperty(layerId, 'fill-extrusion-color', [
            'case',
            ['==', ['get', 'id'], roomId],
            '#4CAF50',
            '#F5F0FF',
          ]);
        } else {
          map.setPaintProperty(layerId, 'fill-extrusion-color', '#F5F0FF');
        }
      } catch (error) {
        console.warn(`Could not highlight QR room on floor ${floorKey}:`, error);
      }
    }
  });
}

/**
 * Tüm katlardan highlight temizle
 */
export function clearHighlightFromAllFloors(map, geojsonURLS) {
  if (!map || !map.isStyleLoaded()) return;

  Object.keys(geojsonURLS).forEach(floor => {
    const layerId = `rooms-floor-${floor}`;
    if (map.getLayer(layerId)) {
      try {
        map.setPaintProperty(layerId, 'fill-extrusion-color', '#F5F0FF');
      } catch (error) {
        console.warn(`Could not clear highlight on floor ${floor}:`, error);
      }
    }
  });
}

/**
 * Dual room highlight (başlangıç ve bitiş)
 */
export function applyDualRoomHighlight(
  map,
  selectedStartRoom,
  selectedEndRoom,
  rooms,
  geojsonURLS,
  qrHighlightedRoom
) {
  if (!map || !map.isStyleLoaded()) return;

  const startRoomId = selectedStartRoom
    ? rooms.find(r => r.id === selectedStartRoom)?.originalId
    : null;
  const endRoomId = selectedEndRoom
    ? rooms.find(r => r.id === selectedEndRoom)?.originalId
    : null;

  Object.keys(geojsonURLS).forEach(floor => {
    try {
      const layerId = `rooms-floor-${floor}`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-extrusion-color', [
          'case',
          ['==', ['get', 'id'], startRoomId || ''],
          '#4CAF50',
          ['==', ['get', 'id'], endRoomId || ''],
          '#1B3349',
          '#F5F0FF',
        ]);
      }
    } catch (error) {
      console.warn(`Could not apply dual highlight to floor ${floor}:`, error);
    }
  });
}
