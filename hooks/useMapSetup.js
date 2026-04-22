import { useEffect } from 'react';

export function useMapSetup({
  mapRef,
  mapContainerRef,
  mapCenter,
  mapZoom,
  geojsonURLS,
  allGeoData,
  currentFloor,
  updateRoomClickHandlers,
  qrHighlightedRoom,
  highlightQrRoom,
  setStoreList,
  setGraph,
  setRooms,
  setDoors,
  buildMultiFloorGraph,
  loadAllFloors,
}) {
  useEffect(() => {
    console.log('🗺️ Harita useEffect çalışıyor');
    
    if (!mapCenter || mapCenter[0] === 0 || mapCenter[1] === 0) {
      console.log("❌ API'den veri henüz gelmedi, harita oluşturulmuyor");
      return;
    }

    if (mapRef.current) {
      console.log('🔄 Harita zaten var, sadece merkez ve zoom güncelleniyor');
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(mapZoom);
      return;
    }

    console.log('✅ Harita oluşturuluyor...');
    
    // Harita oluşturma kodu buraya taşınacak
    // Bu çok büyük bir blok olduğu için şimdilik sadece yapıyı oluşturuyoruz
    
  }, [mapCenter, mapZoom, qrHighlightedRoom, highlightQrRoom]);
}
