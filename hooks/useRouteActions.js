import { useCallback } from 'react';
import { clearHighlightFromAllFloors } from '../utils/mapHelpers.js';
import { geojsonURLS } from '../utils/utils.js';

export const useRouteActions = ({
  totalDistance,
  selectedEndRoom,
  setSelectedStartRoom,
  setSelectedEndRoom,
  setRouteSteps,
  setRouteByFloor,
  setTotalDistance,
  setIsSelectingStartRoom,
  setIsCardMinimized,
  setStartQuery,
  setEndQuery,
  setSearchQuery,
  setSearchResults,
  setShowSearchDropdown,
  setShowStartDropdown,
  setShowEndDropdown,
  setRouteMode,
  setRooms,
  setShowLocationMarker,
  setLocationMarkerCoords,
  setLocationMarkerFloor,
  isAnimationActiveRef,
  animationFrameIdRef,
  rooms,
  setChatMessages,
  mapRef,
  setShowLocationCloseConfirm,
  selectedStartRoom,
  routeSteps,
  setSkippedWaypoints,
}) => {
  const handleFinish = useCallback(() => {
    const currentDistance = totalDistance;
    const currentEndRoom = selectedEndRoom;

    setSelectedStartRoom('');
    setSelectedEndRoom('');
    setRouteSteps([]);
    setRouteByFloor({});
    setTotalDistance(0);
    setIsSelectingStartRoom(false);
    setIsCardMinimized(true);
    setStartQuery('');
    setEndQuery('');
    if (setSkippedWaypoints) setSkippedWaypoints([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setShowStartDropdown(false);
    setShowEndDropdown(false);
    setRouteMode('basit');
    setRooms(prevRooms => prevRooms.filter(r => !r.isCoordinate));
    setShowLocationMarker(false);
    setLocationMarkerCoords(null);
    setLocationMarkerFloor(0);
    if (window.locationMarkerInstance) {
      window.locationMarkerInstance.remove();
      window.locationMarkerInstance = null;
    }
    if (window.currentLocationMarkerInstance) {
      window.currentLocationMarkerInstance.remove();
      window.currentLocationMarkerInstance = null;
    }
    // Rota marker'larını temizle
    if (window.routeStartMarker) {
      window.routeStartMarker.remove();
      window.routeStartMarker = null;
    }
    if (window.routeEndMarker) {
      window.routeEndMarker.remove();
      window.routeEndMarker = null;
    }
    isAnimationActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (currentDistance > 0 && currentEndRoom) {
      const endRoom = rooms.find(r => r.id === currentEndRoom);
      const steps = Math.round(currentDistance * 1.3);
      const minutes = Math.ceil(currentDistance / 80);

      if (endRoom) {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `🎉 Tebrikler! ${
              endRoom.name
            }'e ulaştınız!\n\n📊 Rota Özeti:\n📏 Mesafe: ${Math.round(
              currentDistance
            )}m
👣 Adım: ~${steps} adım
⏱️ Süre: ${minutes} dakika

Başka bir yere gitmek ister misiniz?`,
          },
        ]);
      }
    }
    setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      try {
        if (map.getSource('animation-icon-source')) {
          map.getSource('animation-icon-source').setData({
            type: 'FeatureCollection',
            features: [],
          });
        }
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
      } catch (error) {
        console.error('Harita temizleme hatası:', error);
      }
    }, 100);
    setShowStartDropdown(false);
    setShowEndDropdown(false);
    clearHighlightFromAllFloors(mapRef.current, geojsonURLS);
  }, [
    totalDistance,
    selectedEndRoom,
    setSelectedStartRoom,
    setSelectedEndRoom,
    setRouteSteps,
    setRouteByFloor,
    setTotalDistance,
    setIsSelectingStartRoom,
    setIsCardMinimized,
    setStartQuery,
    setEndQuery,
    setSearchQuery,
    setSearchResults,
    setShowSearchDropdown,
    setShowStartDropdown,
    setShowEndDropdown,
    setRouteMode,
    setRooms,
    setShowLocationMarker,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    isAnimationActiveRef,
    animationFrameIdRef,
    rooms,
    setChatMessages,
    mapRef,
  ]);

  const handleLocationClose = useCallback(() => {
    setShowLocationMarker(false);
    setLocationMarkerCoords(null);
    setLocationMarkerFloor(0);

    // MapLibre marker'larını kaldır
    if (window.locationMarkerInstance) {
      window.locationMarkerInstance.remove();
      window.locationMarkerInstance = null;
    }
    if (window.currentLocationMarkerInstance) {
      window.currentLocationMarkerInstance.remove();
      window.currentLocationMarkerInstance = null;
    }

    // Koordinat odasını rooms'dan kaldır
    setRooms(prevRooms => prevRooms.filter(r => !r.isCoordinate));

    // Başlangıç noktası seçiliyse temizle
    const coordinateRoom = rooms.find(r => r.isCoordinate);
    if (coordinateRoom && selectedStartRoom === coordinateRoom.id) {
      setSelectedStartRoom('');
      setStartQuery('');
    }

    // Modal'ı kapat
    setShowLocationCloseConfirm(false);

    // URL'i temizle ve yönlendir
    window.location.href = '/?slug=ankamall';

    console.log("✅ Konum marker'ı kapatıldı ve ana sayfaya yönlendirildi");
  }, [
    setShowLocationMarker,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    setRooms,
    rooms,
    selectedStartRoom,
    setSelectedStartRoom,
    setStartQuery,
    setShowLocationCloseConfirm,
  ]);

  const clearRoute = useCallback(() => {
    setSelectedStartRoom('');
    setSelectedEndRoom('');
    setRouteSteps([]);
    setRouteByFloor({});
    setTotalDistance(0);
    setIsSelectingStartRoom(false);
    setStartQuery('');
    setEndQuery('');
    if (setSkippedWaypoints) setSkippedWaypoints([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setShowStartDropdown(false);
    setShowEndDropdown(false);
    setRouteMode('basit');
    setRooms(prevRooms => prevRooms.filter(r => !r.isCoordinate));
    setShowLocationMarker(false);
    setLocationMarkerCoords(null);
    setLocationMarkerFloor(0);

    if (window.locationMarkerInstance) {
      window.locationMarkerInstance.remove();
      window.locationMarkerInstance = null;
    }
    if (window.currentLocationMarkerInstance) {
      window.currentLocationMarkerInstance.remove();
      window.currentLocationMarkerInstance = null;
    }
    if (window.routeStartMarker) {
      window.routeStartMarker.remove();
      window.routeStartMarker = null;
    }
    if (window.routeEndMarker) {
      window.routeEndMarker.remove();
      window.routeEndMarker = null;
    }
    
    isAnimationActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      try {
        if (map.getSource('animation-icon-source')) {
          map.getSource('animation-icon-source').setData({
            type: 'FeatureCollection',
            features: [],
          });
        }
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
      } catch (error) {
        console.error('Harita temizleme hatası:', error);
      }
    }, 100);
    
    clearHighlightFromAllFloors(mapRef.current, geojsonURLS);
  }, [
    setSelectedStartRoom,
    setSelectedEndRoom,
    setRouteSteps,
    setRouteByFloor,
    setTotalDistance,
    setIsSelectingStartRoom,
    setStartQuery,
    setEndQuery,
    setSearchQuery,
    setSearchResults,
    setShowSearchDropdown,
    setShowStartDropdown,
    setShowEndDropdown,
    setRouteMode,
    setRooms,
    setShowLocationMarker,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    isAnimationActiveRef,
    animationFrameIdRef,
    mapRef,
    setSkippedWaypoints,
  ]);

  const handleCompleteRoute = useCallback(async () => {
    const currentEndRoomId = selectedEndRoom;
    const currentStartRoomId = selectedStartRoom;
    const distance = totalDistance;
    const duration = Math.ceil(totalDistance / 80);
    const stepsCount = routeSteps?.length || 0;

    const endRoom = rooms.find(r => r.id === currentEndRoomId);
    const startRoom = rooms.find(r => r.id === currentStartRoomId);

    if (!endRoom) return;

    try {
      const token = localStorage.getItem('user_token');
      if (token) {
        // 1. Veritabanına kaydet
        await fetch('/api/user/route-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startStoreId: currentStartRoomId || 'current_location',
            startStoreName: startRoom?.name || 'Mevcut Konum',
            endStoreId: currentEndRoomId,
            endStoreName: endRoom.name,
            distance: Math.round(distance),
            duration
          })
        });

        // 2. Yerel Adım Takibine (StepsTracker) ekle
        try {
          const stepsKey = 'user_steps';
          const existingData = JSON.parse(localStorage.getItem(stepsKey) || '{"total": 0, "routes": []}');
          const newRoute = {
            from: startRoom?.name || 'Mevcut Konum',
            to: endRoom.name,
            steps: stepsCount,
            distance: Math.round(distance),
            createdAt: new Date().toISOString(),
          };
          existingData.total += stepsCount;
          existingData.routes = [newRoute, ...existingData.routes].slice(0, 10);
          localStorage.setItem(stepsKey, JSON.stringify(existingData));
        } catch (err) {
          console.error('Local steps save error:', err);
        }
      } else {
        console.log('Misafir kullanıcı için rota kaydedilmedi (user_token bulunamadı).');
      }
    } catch (error) {
      console.error('Rota kaydetme hatası:', error);
    }

    // Normal bitirme işlemlerini yap
    handleFinish();
  }, [selectedEndRoom, selectedStartRoom, totalDistance, rooms, handleFinish, routeSteps]);

  return { handleFinish, handleLocationClose, clearRoute, handleCompleteRoute };
};
