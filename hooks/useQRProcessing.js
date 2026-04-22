import { useEffect, useRef } from 'react';
import { createCoordinateRoom, createLocationMarkerElement, createMapMarker } from '../utils/markerHelpers';

/**
 * QR kod işleme için custom hook
 */
export const useQRProcessing = ({
  searchParams,
  rooms,
  setRooms,
  currentFloor,
  setCurrentFloor,
  changeFloor,
  setQrHighlightedRoom,
  setShowQrPopup,
  setSelectedStartRoom,
  setStartQuery,
  setLocationMarkerCoords,
  setLocationMarkerFloor,
  setShowLocationMarker,
  setShowLocationCloseConfirm,
  mapRef,
  maplibregl,
  isKioskMode = false,
}) => {
  const qrProcessedRef = useRef(false);

  useEffect(() => {
    if (qrProcessedRef.current) return;

    // Koordinat QR kontrolü
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const floorParam = searchParams.get('floor');

    if (lat && lng) {
      handleCoordinateQR(parseFloat(lng), parseFloat(lat), floorParam ? parseInt(floorParam) : 0);
      return;
    }

    // Oda QR kontrolü
    const roomParam = searchParams.get('room');
    if (roomParam && rooms.length > 0) {
      handleRoomQR(roomParam);
    }
  }, [searchParams, rooms, currentFloor]);

  const handleCoordinateQR = (lng, lat, targetFloor) => {
    qrProcessedRef.current = true;
    console.log('📍 QR Koordinat işleniyor:', { lng, lat, targetFloor });

    const coordinates = [lng, lat];
    const locationName = isKioskMode ? 'Kiosk Konumu' : 'Koridor Noktası';
    const coordinateRoom = createCoordinateRoom(coordinates, targetFloor, locationName);

    setRooms(prevRooms => {
      const filteredRooms = prevRooms.filter(r => !r.isCoordinate);
      return [...filteredRooms, coordinateRoom];
    });

    if (targetFloor !== currentFloor) {
      setCurrentFloor(targetFloor);
      changeFloor(targetFloor);
    }

    setLocationMarkerCoords(coordinates);
    setLocationMarkerFloor(targetFloor);
    setShowLocationMarker(true);
    setSelectedStartRoom(coordinateRoom.id);
    setStartQuery(coordinateRoom.name);

    // Marker'ı oluştur - harita hazır olana kadar bekle
    const createMarkerWhenReady = () => {
      if (mapRef.current && mapRef.current.loaded()) {
        console.log('✅ Harita hazır, marker oluşturuluyor...');
        
        // Eski marker varsa temizle
        if (window.locationMarkerInstance) {
          window.locationMarkerInstance.remove();
          window.locationMarkerInstance = null;
        }

        const markerElement = createLocationMarkerElement(targetFloor, isKioskMode);
        const marker = createMapMarker(
          maplibregl,
          mapRef.current,
          coordinates,
          markerElement,
          () => setShowLocationCloseConfirm(true)
        );
        window.locationMarkerInstance = marker;
        console.log('✅ Marker oluşturuldu:', marker);

        mapRef.current.flyTo({
          center: coordinates,
          zoom: 21,
          duration: 2500,
          essential: true,
        });

        setTimeout(() => {
          if (mapRef.current) {
            const padding = 50;
            mapRef.current.fitBounds(
              [
                [coordinates[0] - 0.0001, coordinates[1] - 0.0001],
                [coordinates[0] + 0.0001, coordinates[1] + 0.0001],
              ],
              { padding, maxZoom: 21, duration: 1000 }
            );
          }
        }, 1000);
      } else {
        console.log('⏳ Harita henüz hazır değil, bekleniyor...');
        setTimeout(createMarkerWhenReady, 200);
      }
    };

    // Kat değişimi varsa daha uzun bekle, yoksa kısa bekle
    setTimeout(createMarkerWhenReady, targetFloor !== currentFloor ? 1500 : 500);
  };

  const handleRoomQR = (roomParam) => {
    console.log('🔍 QR parametresi yakalandı:', roomParam);
    
    let targetRoom = rooms.find(r => r.id === roomParam);
    if (!targetRoom) targetRoom = rooms.find(r => r.originalId === roomParam);
    if (!targetRoom) targetRoom = rooms.find(r => r.id.endsWith(`-${roomParam}`));

    if (targetRoom) {
      console.log('✅ QR odası bulundu:', targetRoom.name);
      qrProcessedRef.current = true;
      
      setQrHighlightedRoom(targetRoom);
      setShowQrPopup(true);
      setSelectedStartRoom(targetRoom.id);
      setStartQuery(targetRoom.name);

      if (targetRoom.floor !== currentFloor) {
        console.log(`🔄 Kat değiştiriliyor: ${currentFloor} → ${targetRoom.floor}`);
        setCurrentFloor(targetRoom.floor);
        changeFloor(targetRoom.floor);
        
        setTimeout(() => {
          if (mapRef.current && targetRoom.coordinates) {
            console.log(`🎯 Zoom yapılıyor:`, targetRoom.coordinates);
            mapRef.current.flyTo({
              center: targetRoom.coordinates,
              zoom: 20,
              duration: 2000,
            });
          }
        }, 1500);
      } else {
        if (mapRef.current && targetRoom.coordinates) {
          console.log(`🎯 Zoom yapılıyor (aynı kat):`, targetRoom.coordinates);
          setTimeout(() => {
            mapRef.current.flyTo({
              center: targetRoom.coordinates,
              zoom: 20,
              duration: 2000,
            });
          }, 500);
        }
      }
    } else {
      console.log('❌ QR odası bulunamadı:', roomParam);
    }
  };

  return { qrProcessedRef };
};
