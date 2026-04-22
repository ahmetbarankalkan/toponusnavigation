// Konum yardımcı fonksiyonları

/**
 * Fake GPS koordinatları - Test için kullanılacak
 * Gerçek Mall of Ankara koordinat aralığında
 */
const FAKE_LOCATIONS = {
  // Mall of Ankara içindeki gerçekçi test koordinatları
  pharmacy_area: {
    lat: 39.96550,
    lng: 32.63215,
    floor: 0,
    description: "Eczane yakını"
  },
  entrance_area: {
    lat: 39.96548,
    lng: 32.63220,
    floor: 0,
    description: "Ana giriş yakını"
  },
  food_court: {
    lat: 39.96552,
    lng: 32.63218,
    floor: 1,
    description: "Yemek katı"
  },
  corridor_a: {
    lat: 39.96549,
    lng: 32.63216,
    floor: 0,
    description: "A Koridoru"
  },
  corridor_b: {
    lat: 39.96551,
    lng: 32.63219,
    floor: 1,
    description: "B Koridoru"
  },
  center_plaza: {
    lat: 39.96553,
    lng: 32.63217,
    floor: 0,
    description: "Merkez Plaza"
  },
  upper_level: {
    lat: 39.96554,
    lng: 32.63221,
    floor: 2,
    description: "Üst kat"
  }
};

/**
 * Kullanıcının mevcut konumunu alır (test için fake konum döner)
 * @param {boolean} useFakeLocation - Test için fake konum kullan
 * @returns {Promise<{lat: number, lng: number, floor: number, description: string}>}
 */
export const getCurrentUserLocation = async (useFakeLocation = true) => {
  if (useFakeLocation) {
    // Test için rastgele bir fake konum döndür
    const locations = Object.values(FAKE_LOCATIONS);
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    console.log('📍 Fake konum döndürülüyor:', randomLocation);
    
    // Gerçek GPS gibi biraz gecikme ekle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return randomLocation;
  }

  // Gerçek GPS konumu (şimdilik devre dışı)
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation desteklenmiyor'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          floor: 0, // GPS'ten kat bilgisi alınamaz, varsayılan 0
          description: "GPS konumu"
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

/**
 * Koordinatları mağaza içi konuma çevirir
 * @param {number} lat - Enlem
 * @param {number} lng - Boylam
 * @param {Array} rooms - Mağaza odaları listesi
 * @returns {Object|null} En yakın oda bilgisi
 */
export const findNearestRoomByCoordinates = (lat, lng, rooms) => {
  if (!rooms || rooms.length === 0) {
    return null;
  }

  let nearestRoom = null;
  let minDistance = Infinity;

  rooms.forEach(room => {
    if (!room.coordinates || room.coordinates.length !== 2) {
      return;
    }

    // Basit mesafe hesaplama (Haversine formülü yerine)
    const roomLng = room.coordinates[0];
    const roomLat = room.coordinates[1];
    
    const distance = Math.sqrt(
      Math.pow(lat - roomLat, 2) + Math.pow(lng - roomLng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestRoom = room;
    }
  });

  return nearestRoom;
};

/**
 * Kullanıcının bulunduğu konumu tespit eder ve uygun oda/koordinat döner
 * @param {Array} rooms - Mağaza odaları listesi
 * @param {boolean} useFakeLocation - Test için fake konum kullan
 * @returns {Promise<Object>} Konum bilgisi
 */
export const detectUserLocation = async (rooms, useFakeLocation = true) => {
  try {
    const location = await getCurrentUserLocation(useFakeLocation);
    
    // En yakın odayı bul
    const nearestRoom = findNearestRoomByCoordinates(location.lat, location.lng, rooms);
    
    if (nearestRoom) {
      return {
        type: 'room',
        room: nearestRoom,
        coordinates: [location.lng, location.lat],
        floor: location.floor,
        description: `${nearestRoom.name} yakını`
      };
    } else {
      // Oda bulunamazsa koordinat olarak döndür
      return {
        type: 'coordinate',
        coordinates: [location.lng, location.lat],
        floor: location.floor,
        description: location.description,
        name: `📍 ${location.description} - Şu an buradasınız`
      };
    }
  } catch (error) {
    console.error('❌ Konum tespit hatası:', error);
    throw error;
  }
};