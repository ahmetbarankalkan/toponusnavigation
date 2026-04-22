import { useState, useCallback, useEffect } from 'react';

export function useFloorManagement(mapRef, geojsonURLS, routeByFloor, drawPathSafely) {
  const [currentFloor, setCurrentFloor] = useState(0);

  const changeFloor = useCallback(newFloor => {
    console.log(`🔄 changeFloor çağrıldı: ${newFloor}`);
    setCurrentFloor(newFloor);
  }, []);

  // currentFloor değiştiğinde harita layer'larını VE path'i güncelle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    console.log(`🔄 useEffect - currentFloor: ${currentFloor}`);

    // 1. ÖNCE HARITA LAYER'LARINI GÜNCELLE
    if (map.isStyleLoaded()) {
      console.log(`🗺️ Harita layer'ları güncelleniyor...`);
      Object.keys(geojsonURLS).forEach(floor => {
        const floorNum = parseInt(floor);
        const visibility = floorNum === currentFloor ? 'visible' : 'none';

        [
          `walkable-areas-floor-${floorNum}`,
          `non-walkable-areas-floor-${floorNum}`,
          `rooms-floor-${floorNum}`,
          `doors-floor-${floorNum}`,
          `floor-connectors-floor-${floorNum}`,
          `room-labels-floor-${floorNum}`,
          `room-labels-with-logo-floor-${floorNum}`,
          `room-labels-without-logo-floor-${floorNum}`,
        ].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
          }
        });
      });
      console.log(`✅ Kat ${currentFloor} layer'ları gösteriliyor`);
    }

    // 2. SONRA ROTAYI ÇİZ
    console.log(`📦 routeByFloor katlar:`, Object.keys(routeByFloor));
    const coords = routeByFloor[currentFloor];

    if (!coords || coords.length === 0) {
      console.log(`⚠️ Kat ${currentFloor} için rota yok`);
      // Rota yoksa temizle
      if (map.getSource('path')) {
        map.getSource('path').setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
      if (map.getSource('path-arrows')) {
        map.getSource('path-arrows').setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      return;
    }

    // drawPathSafely kullan - o zaten source'u oluşturuyor
    const timeoutId = setTimeout(() => {
      drawPathSafely(coords);
    }, 100);

    // Cleanup: Yeni kat değişimi gelirse önceki timeout'u iptal et
    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentFloor, routeByFloor, mapRef, geojsonURLS, drawPathSafely]);

  return {
    currentFloor,
    setCurrentFloor,
    changeFloor,
  };
}
