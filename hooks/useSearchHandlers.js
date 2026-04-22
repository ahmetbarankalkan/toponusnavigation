import { useCallback } from 'react';
import { createLocationMarkerElement, createMapMarker } from '../utils/markerHelpers.js';

export const useSearchHandlers = ({
  setSearchQuery,
  setShowSearchDropdown,
  setIsSearchFocused,
  setRooms,
  setCurrentFloor,
  changeFloor,
  setLocationMarkerCoords,
  setLocationMarkerFloor,
  setShowLocationMarker,
  setSelectedStartRoom,
  setStartQuery,
  mapRef,
  setActiveNavItem,
  setIsCardMinimized,
  setSelectedEndRoom,
  isSelectingStartRoom,
  currentFloor,
  maplibregl,
  setShowLocationCloseConfirm,
}) => {
  const handleSearchResultSelect = useCallback(
    room => {
      setSearchQuery(room.name);
      setShowSearchDropdown(false);
      setIsSearchFocused(false);

      if (room.isCoordinate) {
        console.log('📍 Koordinat seçildi:', room);

        // Koordinat odasını rooms'a ekle
        setRooms(prev => {
          // Varsa eskisini sil
          const filtered = prev.filter(r => !r.isCoordinate);
          return [...filtered, room];
        });

        // Haritada göster
        if (mapRef.current) {
          // Kat değiştir
          if (currentFloor !== room.floor) {
            changeFloor(room.floor);
          }

          // Marker state'lerini güncelle
          setLocationMarkerCoords(room.coordinates);
          setLocationMarkerFloor(room.floor);
          setShowLocationMarker(true);

          // Marker oluştur
          if (window.locationMarkerInstance) {
            window.locationMarkerInstance.remove();
          }

          const markerElement = createLocationMarkerElement(
            room.floor,
            false,
            room.name
          );

          window.locationMarkerInstance = createMapMarker(
            maplibregl,
            mapRef.current,
            room.coordinates,
            markerElement,
            () => setShowLocationCloseConfirm(true)
          );

          // Kamerayı odakla
          mapRef.current.flyTo({
            center: room.coordinates,
            zoom: 19,
            pitch: 45,
            duration: 1500,
          });
        }

        // Başlangıç noktası olarak ayarla
        setSelectedStartRoom(room.id);
        setStartQuery(room.name);
      } else {
        // Normal oda seçimi
        console.log('🏠 Oda seçildi:', room.name);

        if (mapRef.current) {
          // Kat değiştir
          if (currentFloor !== room.floor) {
            changeFloor(room.floor);
          }

          // Kamerayı odakla
          const center = room.center || room.coordinates;
          if (center) {
            mapRef.current.flyTo({
              center: center,
              zoom: 18,
              duration: 1000,
            });
          }
        }

        // Rota başlangıç/bitiş seçimi
        if (isSelectingStartRoom) {
          setSelectedStartRoom(room.id);
          setStartQuery(room.name);
        } else {
          setSelectedEndRoom(room.id);
        }
      }

      // UI güncellemeleri
      setActiveNavItem(0);
      setIsCardMinimized(false);
    },
    [
      setSearchQuery,
      setShowSearchDropdown,
      setIsSearchFocused,
      setRooms,
      currentFloor,
      changeFloor,
      setLocationMarkerCoords,
      setLocationMarkerFloor,
      setShowLocationMarker,
      setSelectedStartRoom,
      setStartQuery,
      mapRef,
      setActiveNavItem,
      setIsCardMinimized,
      setSelectedEndRoom,
      isSelectingStartRoom,
      maplibregl,
      setShowLocationCloseConfirm,
    ]
  );

  return { handleSearchResultSelect };
};
