import { useState } from 'react';
import { detectUserLocation } from '../utils/locationHelpers';
import { createCoordinateRoom, createLocationMarkerElement, createMapMarker } from '../utils/markerHelpers';

/**
 * Kullanıcı konumu tespiti için custom hook
 */
export const useLocationDetection = ({
  rooms,
  setRooms,
  currentFloor,
  setCurrentFloor,
  changeFloor,
  setSelectedStartRoom,
  setStartQuery,
  setLocationMarkerCoords,
  setLocationMarkerFloor,
  setShowLocationMarker,
  setShowLocationCloseConfirm,
  mapRef,
  maplibregl,
  addMessage,
  setActiveNavItem,
  setIsCardMinimized,
}) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectCurrentLocation = async () => {
    if (isDetectingLocation) return;

    setIsDetectingLocation(true);

    try {
      console.log('📍 Konum tespiti başlatılıyor...');

      const locationResult = await detectUserLocation(rooms, true);
      console.log('✅ Konum tespit edildi:', locationResult);

      if (locationResult.type === 'room') {
        handleRoomLocation(locationResult.room);
      } else if (locationResult.type === 'coordinate') {
        handleCoordinateLocation(locationResult);
      }

      setActiveNavItem(0);
      setIsCardMinimized(false);
    } catch (error) {
      console.error('❌ Konum tespit hatası:', error);
      addMessage({
        role: 'assistant',
        content: '❌ Konumunuz tespit edilemedi. Lütfen konum izinlerinizi kontrol edin veya manuel olarak başlangıç noktanızı seçin.',
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleRoomLocation = (room) => {
    if (room.floor !== currentFloor) {
      setCurrentFloor(room.floor);
      changeFloor(room.floor);
    }

    setSelectedStartRoom(room.id);
    setStartQuery(`📍 ${room.name} - Şu an buradasınız`);

    if (mapRef.current && room.coordinates) {
      setTimeout(() => {
        mapRef.current.flyTo({
          center: room.coordinates,
          zoom: 19,
          duration: 1500,
        });

        setTimeout(() => {
          const markerElement = createLocationMarkerElement(room.floor, `${room.name} yakını`);
          const marker = createMapMarker(
            maplibregl,
            mapRef.current,
            room.coordinates,
            markerElement,
            () => setShowLocationCloseConfirm(true)
          );
          window.currentLocationMarkerInstance = marker;
        }, 500);
      }, room.floor !== currentFloor ? 1000 : 0);
    }

    addMessage({
      role: 'assistant',
      content: `📍 Konumunuz tespit edildi! ${room.name} yakınında bulunuyorsunuz. (Kat ${room.floor === 0 ? 'Zemin' : room.floor})\n\nNereye gitmek istiyorsunuz?`,
    });
  };

  const handleCoordinateLocation = (locationResult) => {
    const coordinateRoom = createCoordinateRoom(
      locationResult.coordinates,
      locationResult.floor,
      locationResult.name
    );

    setRooms(prevRooms => {
      const filteredRooms = prevRooms.filter(r => !r.isCurrentLocation);
      return [...filteredRooms, { ...coordinateRoom, isCurrentLocation: true }];
    });

    if (locationResult.floor !== currentFloor) {
      setCurrentFloor(locationResult.floor);
      changeFloor(locationResult.floor);
    }

    setLocationMarkerCoords(locationResult.coordinates);
    setLocationMarkerFloor(locationResult.floor);
    setShowLocationMarker(true);
    setSelectedStartRoom(coordinateRoom.id);
    setStartQuery(coordinateRoom.name);

    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.flyTo({
          center: locationResult.coordinates,
          zoom: 19,
          duration: 1500,
        });

        setTimeout(() => {
          const markerElement = createLocationMarkerElement(
            locationResult.floor,
            locationResult.description
          );
          const marker = createMapMarker(
            maplibregl,
            mapRef.current,
            locationResult.coordinates,
            markerElement,
            () => setShowLocationCloseConfirm(true)
          );
          window.currentLocationMarkerInstance = marker;
        }, 500);
      }, locationResult.floor !== currentFloor ? 1000 : 0);
    }

    addMessage({
      role: 'assistant',
      content: `📍 Konumunuz tespit edildi! ${locationResult.description} bölgesinde bulunuyorsunuz. (Kat ${locationResult.floor === 0 ? 'Zemin' : locationResult.floor})\n\nNereye gitmek istiyorsunuz?`,
    });
  };

  return {
    isDetectingLocation,
    handleDetectCurrentLocation,
  };
};
