/**
 * Dijkstra algoritmaları ve path finding fonksiyonları
 * Multi-floor ve single-floor routing için optimize edilmiş algoritmalar
 */

/**
 * Tek kat içinde Dijkstra algoritması ile en kısa yol bulma
 * @param {string} startId - Başlangıç node ID'si
 * @param {string} endId - Hedef node ID'si
 * @param {Object} graph - Graph objesi
 * @returns {Array} En kısa yol node ID'leri dizisi
 */
export function singleFloorDijkstra(startId, endId, graph) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  Object.keys(graph).forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });
  dist[startId] = 0;

  while (true) {
    let u = null;
    let min = Infinity;

    for (const id in graph) {
      if (!visited.has(id) && dist[id] < min) {
        min = dist[id];
        u = id;
      }
    }

    if (u === null || u === endId) break;
    visited.add(u);

    for (const { to, weight, type } of graph[u].neighbors) {
      // Door atlama kuralı - sadece hedef door'a girebilir
      const isDoor = graph[to]?.type === "door-node";
      if (isDoor && to !== endId) continue;

      // Room atlama kuralı - sadece başlangıç veya hedef room'a girebilir
      const isRoom = graph[to]?.type === "room";
      if (isRoom && to !== startId && to !== endId) continue;

      const alt = dist[u] + weight;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = u;
      }
    }
  }

  const path = [];
  for (let u = endId; u; u = prev[u]) path.push(u);
  return dist[endId] === Infinity ? [] : path.reverse();
}

/**
 * Çok katlı Dijkstra algoritması - Entry/Exit mantığı ile
 * @param {string} startId - Başlangıç node ID'si
 * @param {string} endId - Hedef node ID'si
 * @param {Object} graph - Graph objesi
 * @param {string} preferredTransport - Tercih edilen transport tipi ("escalator" veya "elevator")
 * @param {Object} allGeoData - GeoJSON verileri (floor range kontrolü için)
 * @returns {Array} En kısa yol node ID'leri dizisi
 */
export function multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData) {
  const startFloor = graph[startId]?.floor;
  const endFloor = graph[endId]?.floor;

  if (startFloor === endFloor) {
    return singleFloorDijkstra(startId, endId, graph);
  }

  // YÖN KONTROLÜ: Yukarı mı aşağı mı gidiyoruz?
  const isGoingUp = endFloor > startFloor;
  const requiredDirection = isGoingUp ? "up" : "down";

  // ✅ YENİ: Başlangıç katında ENTRY node'larını bul
  const startFloorConnectors = Object.keys(graph).filter((id) => {
    const node = graph[id];
    if (node.type !== "floor-connector-node" || node.floor !== startFloor) {
      return false;
    }

    const props = getConnectorProperties(id, graph);

    // 🆕 ENTRY NODE ŞARTI EKLENDI
    const isEntryNode = props.nodeType === "entry";
    if (!isEntryNode) {
      return false;
    }

    // 1. Transport tipi kontrolü
    const isPreferredType = props.connectorType === preferredTransport;

    // 2. Direction kontrolü
    const canUseDirection = canUseConnectorDirection(props, requiredDirection);

    // 3. Floor range kontrolü
    const canUseFloors = canUseConnectorFloors(id, startFloor, endFloor, graph, allGeoData);

    return isPreferredType && canUseDirection && canUseFloors;
  });

  // Tercih edilen tip bulunamazsa fallback yap
  if (startFloorConnectors.length === 0) {
    // Fallback: Diğer transport tipindeki ENTRY connector'ları dene
    const fallbackTransport = preferredTransport === "escalator" ? "elevator" : "escalator";

    const fallbackConnectors = Object.keys(graph).filter((id) => {
      const node = graph[id];
      if (node.type !== "floor-connector-node" || node.floor !== startFloor) {
        return false;
      }

      const props = getConnectorProperties(id, graph);

      // 🆕 ENTRY NODE ŞARTI
      const isEntryNode = props.nodeType === "entry";
      if (!isEntryNode) return false;

      const isTargetType = props.connectorType === fallbackTransport;
      const canUseDirection = canUseConnectorDirection(props, requiredDirection);
      const canUseFloors = canUseConnectorFloors(id, startFloor, endFloor, graph, allGeoData);

      return isTargetType && canUseDirection && canUseFloors;
    });

    if (fallbackConnectors.length > 0) {
      startFloorConnectors.push(...fallbackConnectors);
    } else {
      return [];
    }
  }

  // EN YAKIN ENTRY CONNECTOR'U BUL
  let closestConnector = null;
  let shortestDistanceToConnector = Infinity;

  for (const connectorId of startFloorConnectors) {
    // Başlangıç noktasından bu ENTRY connector'a olan mesafeyi hesapla
    const pathToConnector = singleFloorDijkstra(startId, connectorId, graph);

    if (pathToConnector.length === 0) {
      continue;
    }

    const distanceToConnector = calculatePathDistance(pathToConnector, graph);

    if (distanceToConnector < shortestDistanceToConnector) {
      shortestDistanceToConnector = distanceToConnector;
      closestConnector = connectorId;
    }
  }

  if (!closestConnector) {
    return [];
  }

  const closestProps = getConnectorProperties(closestConnector, graph);

  // En yakın ENTRY connector ile hedefe kadar olan rotayı hesapla
  const fullPath = findPathThroughConnectorEntryExit(startId, endId, closestConnector, graph, allGeoData);

  if (fullPath.length === 0) {
    // Fallback: Eğer en yakın connector ile rota bulunamazsa, diğerlerini de dene

    let bestPath = [];
    let minTotalDistance = Infinity;

    for (const startConnector of startFloorConnectors) {
      if (startConnector === closestConnector) continue; // Zaten denedik

      const fallbackPath = findPathThroughConnectorEntryExit(startId, endId, startConnector, graph, allGeoData);

      if (fallbackPath.length === 0) continue;

      const totalDist = calculatePathDistance(fallbackPath, graph);
      if (totalDist < minTotalDistance) {
        minTotalDistance = totalDist;
        bestPath = fallbackPath;
      }
    }

    return bestPath;
  }

  const totalDistance = calculatePathDistance(fullPath, graph);

  return fullPath;
}

/**
 * Path'in toplam mesafesini hesaplar
 * @param {Array} path - Node ID'leri dizisi
 * @param {Object} graph - Graph objesi
 * @returns {number} Toplam mesafe
 */
export function calculatePathDistance(path, graph) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    // Graph'taki edge'i bul
    const edge = graph[u]?.neighbors.find((e) => e.to === v);
    if (edge) {
      totalDistance += edge.weight;
    } else {
      // Virtual edge (floor connector geçişi)
      const uFloor = graph[u]?.floor;
      const vFloor = graph[v]?.floor;
      if (uFloor !== vFloor) {
        totalDistance += 10; // Floor değişimi maliyeti
      }
    }
  }
  return totalDistance;
}

/**
 * Connector'ın özelliklerini parse eder
 * @param {string} connectorId - Connector ID'si
 * @param {Object} graph - Graph objesi
 * @returns {Object} Connector özellikleri
 */
export function getConnectorProperties(connectorId, graph) {
  const node = graph[connectorId];
  if (!node) return null;

  // GeoJSON'dan gelen direction'ı direkt kullan
  const direction = node.direction;

  // ID'den sadece gerekli bilgileri parse et
  const parts = connectorId.split("-");
  const connectorType = node.connector_type; // default
  const baseName = node.baseName;
  let nodeType = null;

  // entry/exit kontrolü
  if (parts.includes("entry")) {
    nodeType = "entry";
  } else if (parts.includes("exit")) {
    nodeType = "exit";
  }

  return {
    direction: direction, // GeoJSON'dan gelen değer
    baseName: baseName,
    connectorType: connectorType,
    nodeType: nodeType,
    originalId: node.originalId,
    floor: node.floor,
  };
}

/**
 * Connector'ın direction açısından kullanılabilir olup olmadığını kontrol eder
 * @param {Object} connectorProps - Connector özellikleri
 * @param {string} requiredDirection - Gerekli yön ("up", "down", "bidirectional")
 * @returns {boolean} Kullanılabilir mi?
 */
export function canUseConnectorDirection(connectorProps, requiredDirection) {
  // Bidirectional connector her yöne gidebilir
  if (connectorProps.direction === "bidirectional") {
    return true;
  }

  // Diğerleri sadece kendi yönüne
  return connectorProps.direction === requiredDirection;
}

/**
 * Connector'ın floor range kontrolü
 * @param {string} connectorId - Connector ID'si
 * @param {number} currentFloor - Mevcut kat
 * @param {number} targetFloor - Hedef kat
 * @param {Object} graph - Graph objesi
 * @param {Object} allGeoData - GeoJSON verileri
 * @returns {boolean} Kullanılabilir mi?
 */
export function canUseConnectorFloors(connectorId, currentFloor, targetFloor, graph, allGeoData) {
  const node = graph[connectorId];
  if (!node) return false;

  // Mevcut kodunuzdaki mantığı kullanarak feature'ı bulalım
  const connectorFeature = Object.values(allGeoData).find((floorData) =>
    floorData.features.some((f) => f.properties.id === node.originalId)
  );

  if (!connectorFeature) return true;

  const feature = connectorFeature.features.find((f) => f.properties.id === node.originalId);
  if (!feature) return true;

  const fromFloor = parseInt(feature.properties.from || currentFloor);
  const toFloor = parseInt(feature.properties.to || currentFloor);

  // Sadece şunları kontrol et:
  // 1. Bu escalator mevcut katımdan başlıyor mu?
  // 2. Bu escalator hedefe doğru bir adım atıyor mu?

  const startsFromCurrentFloor = currentFloor === fromFloor || currentFloor === toFloor;

  // Doğru yön kontrolü: Bir sonraki kat hedef yönünde mi?
  const nextFloor = currentFloor === fromFloor ? toFloor : fromFloor;
  const isCorrectDirection =
    (targetFloor > currentFloor && nextFloor > currentFloor) || // Yukarı gidiyoruz
    (targetFloor < currentFloor && nextFloor < currentFloor); // Aşağı gidiyoruz

  return startsFromCurrentFloor && isCorrectDirection;
}

/**
 * Entry/Exit mantığı ile path finding
 * @param {string} startId - Başlangıç ID'si
 * @param {string} endId - Hedef ID'si
 * @param {string} startEntryConnector - Başlangıç ENTRY connector'ı
 * @param {Object} graph - Graph objesi
 * @param {Object} allGeoData - GeoJSON verileri
 * @returns {Array} Tam path
 */
export function findPathThroughConnectorEntryExit(startId, endId, startEntryConnector, graph, allGeoData) {
  // 1. Başlangıçtan ENTRY connector'a yürü
  let path = singleFloorDijkstra(startId, startEntryConnector, graph);
  if (path.length === 0) {
    return [];
  }

  let currentConnector = startEntryConnector;
  let currentFloor = graph[startEntryConnector].floor;
  const endFloor = graph[endId].floor;

  // İlk connector'ın transport tipini al ve koru
  const initialProps = getConnectorProperties(startEntryConnector, graph);
  let selectedTransportType = initialProps.connectorType;
  const direction = endFloor > currentFloor ? "up" : "down";

  while (currentFloor !== endFloor) {
    const nextFloor = currentFloor < endFloor ? currentFloor + 1 : currentFloor - 1;

    // Mevcut ENTRY connector'ın baseName'ini al
    const currentProps = getConnectorProperties(currentConnector, graph);
    const currentBaseName = currentProps.baseName;

    // Aynı escalator'ın sonraki kattaki EXIT'ini ara
    const baseNameParts = currentBaseName.replace(/-(up|down)$/, ""); // Son -up veya -down'ı çıkar
    const targetExitConnectorId = `f${nextFloor}-${baseNameParts}-${direction}-exit-node`;

    let exitConnector = null;
    if (graph[targetExitConnectorId]) {
      exitConnector = targetExitConnectorId;
    } else {
      // Alternatif: Aynı baseName'li herhangi bir EXIT ara
      const alternativeExits = Object.keys(graph).filter((id) => {
        const node = graph[id];
        if (node.type !== "floor-connector-node" || node.floor !== nextFloor) {
          return false;
        }

        const props = getConnectorProperties(id, graph);
        return (
          props.baseName === currentBaseName &&
          props.nodeType === "exit" &&
          props.connectorType === selectedTransportType &&
          canUseConnectorDirection(props, direction)
        );
      });

      if (alternativeExits.length === 0) {
        return [];
      }

      exitConnector = alternativeExits[0];
    }

    // Kat değişimi - path'e EXIT connector'ı ekle
    path.push(exitConnector);
    currentConnector = exitConnector;
    currentFloor = nextFloor;

    // Hedef kata ulaştık mı?
    if (currentFloor === endFloor) {
      break;
    }

    // ÇOK KATLI GEÇIŞ: Exit'ten sonraki en yakın ENTRY'yi bul

    const nextEntryConnectors = Object.keys(graph).filter((id) => {
      const node = graph[id];
      if (node.type !== "floor-connector-node" || node.floor !== currentFloor || id === currentConnector) {
        return false;
      }

      const props = getConnectorProperties(id, graph);
      const isValidEntry =
        props.nodeType === "entry" &&
        props.connectorType === selectedTransportType &&
        canUseConnectorDirection(props, direction) &&
        canUseConnectorFloors(id, currentFloor, endFloor, graph, allGeoData);

      return isValidEntry;
    });

    if (nextEntryConnectors.length === 0) {
      return [];
    }

    // Tüm ENTRY'lere olan mesafeleri hesapla
    const entryDistances = [];

    for (const entryId of nextEntryConnectors) {
      const entryProps = getConnectorProperties(entryId, graph);

      const walkPath = singleFloorDijkstra(currentConnector, entryId, graph);
      if (walkPath.length > 0) {
        const distance = calculatePathDistance(walkPath, graph);
        entryDistances.push({
          id: entryId,
          baseName: entryProps.baseName,
          distance: distance,
          pathLength: walkPath.length,
        });
      }
    }

    if (entryDistances.length === 0) {
      return [];
    }

    // En yakın ENTRY'yi seç
    entryDistances.sort((a, b) => a.distance - b.distance);

    const closestEntry = entryDistances[0];

    // EXIT'ten en yakın ENTRY'ye koridordan yürü
    const corridorWalk = singleFloorDijkstra(currentConnector, closestEntry.id, graph);
    if (corridorWalk.length === 0) {
      return [];
    }

    path = [...path, ...corridorWalk.slice(1)];
    currentConnector = closestEntry.id; // Yeni ENTRY artık mevcut connector
  }

  // Son adım: EXIT connector'dan hedefe yürü

  const finishWalk = singleFloorDijkstra(currentConnector, endId, graph);
  if (finishWalk.length === 0) {
    return [];
  }

  path = [...path, ...finishWalk.slice(1)];

  return path;
}
