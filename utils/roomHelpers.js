/**
 * Room Helper Functions
 * Oda arama, filtreleme ve özel lokasyon bulma fonksiyonları
 */

import { multiFloorDijkstra, calculatePathDistance } from './dijkstra.js';

/**
 * İsme göre oda bulur
 * @param {string} roomName - Aranacak oda ismi
 * @param {Array} rooms - Oda listesi
 * @returns {Object|null} - Bulunan oda veya null
 */
export function findRoomByName(roomName, rooms) {
  if (!roomName) return null;
  
  const lowerQuery = roomName.toLowerCase().trim();
  
  // Tam eşleşme
  let found = rooms.find(
    r => r.name && r.name.toLowerCase().trim() === lowerQuery
  );
  
  if (found) return found;
  
  // Kısmi eşleşme (içinde geçme)
  found = rooms.find(
    r => r.name && r.name.toLowerCase().includes(lowerQuery)
  );
  
  if (found) return found;
  
  // Ters kısmi eşleşme (query içinde geçme)
  found = rooms.find(
    r => r.name && lowerQuery.includes(r.name.toLowerCase())
  );
  
  if (found) return found;
  
  // Kelime bazlı eşleşme
  const words = lowerQuery.split(/[\s\-']+/).filter(w => w.length > 0);
  found = rooms.find(r => {
    if (!r.name) return false;
    const roomWords = r.name.toLowerCase().split(/[\s\-']+/).filter(w => w.length > 0);
    return words.some(word => roomWords.some(rw => rw.includes(word) || word.includes(rw)));
  });
  
  return found || null;
}

/**
 * Belirli tipteki özel lokasyonları filtreler
 * @param {string} specialType - Özel lokasyon tipi (wc, atm, pharmacy vb.)
 * @param {Array} rooms - Oda listesi
 * @returns {Array} - Filtrelenmiş özel lokasyonlar
 */
export function getSpecialLocationsByType(specialType, rooms) {
  return rooms.filter(room => {
    return room.is_special === true && room.special_type === specialType;
  });
}

/**
 * Kullanıcıya en yakın özel lokasyonu bulur
 * @param {Object} userLocation - Kullanıcının bulunduğu oda
 * @param {string} specialType - Aranacak özel lokasyon tipi
 * @param {Array} rooms - Oda listesi
 * @param {Object} graph - Rota grafiği
 * @param {string} preferredTransport - Tercih edilen ulaşım (escalator/elevator)
 * @param {Object} allGeoData - Tüm kat verileri
 * @returns {Object|null} - En yakın lokasyon veya null
 */
export function findClosestSpecialLocation(
  userLocation,
  specialType,
  rooms,
  graph,
  preferredTransport,
  allGeoData
) {
  const specialLocations = getSpecialLocationsByType(specialType, rooms);

  if (specialLocations.length === 0) {
    return null;
  }

  let closest = null;
  let shortestDistance = Infinity;

  for (const location of specialLocations) {
    try {
      const userDoorId = `f${userLocation.floor}-${userLocation.doorId}`;
      const targetDoorId = `f${location.floor}-${location.doorId}`;

      const path = multiFloorDijkstra(
        userDoorId,
        targetDoorId,
        graph,
        preferredTransport,
        allGeoData
      );
      if (path.length === 0) continue;

      const routeDistance = calculatePathDistance(path, graph);

      if (routeDistance < shortestDistance) {
        shortestDistance = routeDistance;
        closest = { ...location, routeDistance };
      }
    } catch (error) {
      console.warn(`Route calculation failed for ${location.name}:`, error);
    }
  }

  return closest;
}
