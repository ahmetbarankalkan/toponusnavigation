/**
 * Gelişmiş Rotalama Algoritmaları
 * Spor ve Keşfet modları için özel rotalama
 */

import { singleFloorDijkstra, multiFloorDijkstra, calculatePathDistance } from './dijkstra';

/**
 * Gelişmiş rota hesaplama - mod bazlı
 * @param {string} startId - Başlangıç node ID'si
 * @param {string} endId - Hedef node ID'si
 * @param {Object} graph - Graph objesi
 * @param {string} mode - Rotalama modu ('basit', 'spor', 'keşfet')
 * @param {string} preferredTransport - Tercih edilen transport
 * @param {Object} allGeoData - GeoJSON verileri
 * @param {string} placeId - Yer ID'si
 * @returns {Array} Rota node ID'leri
 */
export async function calculateAdvancedRoute(
  startId,
  endId,
  graph,
  mode = 'basit',
  preferredTransport,
  allGeoData,
  placeId
) {
  // Sadece önemli logları tut
  if (mode !== 'basit') {
    console.log(`🎯 ${mode} modu: ${startId} → ${endId}`);
  }

  // Basit mod - mevcut algoritma
  if (mode === 'basit') {
    const startFloor = graph[startId]?.floor;
    const endFloor = graph[endId]?.floor;
    
    if (startFloor === endFloor) {
      return singleFloorDijkstra(startId, endId, graph);
    } else {
      return multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData);
    }
  }

  // Spor ve Keşfet modları için özel algoritma
  if (mode === 'spor' || mode === 'keşfet') {
    // MİNİMUM MESAFE KONTROLÜ - Çok yakın mağazalar için spor modu gereksiz
    const startFloor = graph[startId]?.floor;
    const endFloor = graph[endId]?.floor;
    
    if (startFloor === endFloor) {
      // Aynı katta normal mesafeyi hesapla
      const normalPath = singleFloorDijkstra(startId, endId, graph);
      const normalDistance = normalPath.length > 0 ? calculatePathDistance(normalPath, graph) : 0;
      
      // 50m'den kısa rotalar için spor modu gereksiz
      if (normalDistance < 50) {
        return normalPath;
      }
    } else {
      // Farklı katlar arası - kat farkı 1'den fazlaysa spor modu gereksiz
      const floorDifference = Math.abs(endFloor - startFloor);
      if (floorDifference > 1) {
        return multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData);
      }
    }
    
    return await calculateSpecialRoute(
      startId,
      endId,
      graph,
      mode,
      preferredTransport,
      allGeoData,
      placeId
    );
  }

  // Fallback
  return singleFloorDijkstra(startId, endId, graph);
}

/**
 * Spor ve Keşfet modları için özel rota hesaplama
 */
async function calculateSpecialRoute(
  startId,
  endId,
  graph,
  mode,
  preferredTransport,
  allGeoData,
  placeId
) {
  const startFloor = graph[startId]?.floor;
  const endFloor = graph[endId]?.floor;

  // Hedef mağazaları yükle
  const targetStores = await loadTargetStores(placeId, mode);
  
  if (targetStores.length === 0) {
    return startFloor === endFloor 
      ? singleFloorDijkstra(startId, endId, graph)
      : multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData);
  }

  // Tek kat rotası
  if (startFloor === endFloor) {
    return calculateSingleFloorSpecialRoute(
      startId,
      endId,
      graph,
      mode,
      targetStores,
      startFloor
    );
  }

  // Çok katlı rota
  return calculateMultiFloorSpecialRoute(
    startId,
    endId,
    graph,
    mode,
    preferredTransport,
    allGeoData,
    targetStores
  );
}

/**
 * Tek kat özel rota hesaplama
 */
function calculateSingleFloorSpecialRoute(startId, endId, graph, mode, targetStores, floor) {
  // Bu kattaki hedef mağazaları filtrele
  const floorTargets = targetStores.filter(store => store.floor === floor);

  if (floorTargets.length === 0) {
    return singleFloorDijkstra(startId, endId, graph);
  }

  // En uygun mağazaları seç
  const selectedTargets = selectOptimalTargets(
    startId,
    endId,
    floorTargets,
    graph,
    mode
  );

  if (selectedTargets.length === 0) {
    return singleFloorDijkstra(startId, endId, graph);
  }

  // Mağazalar üzerinden geçen rota oluştur
  return buildRouteWithTargets(startId, endId, selectedTargets, graph);
}

/**
 * Çok katlı özel rota hesaplama
 */
async function calculateMultiFloorSpecialRoute(
  startId,
  endId,
  graph,
  mode,
  preferredTransport,
  allGeoData,
  targetStores
) {
  const startFloor = graph[startId]?.floor;
  const endFloor = graph[endId]?.floor;
  const isGoingUp = endFloor > startFloor;

  // Geçilecek katları belirle
  const floors = [];
  if (isGoingUp) {
    for (let f = startFloor; f <= endFloor; f++) {
      floors.push(f);
    }
  } else {
    for (let f = startFloor; f >= endFloor; f--) {
      floors.push(f);
    }
  }

  let fullPath = [];
  let currentNodeId = startId;

  for (let i = 0; i < floors.length; i++) {
    const currentFloor = floors[i];
    const isLastFloor = i === floors.length - 1;

    if (isLastFloor) {
      // Son kat - hedefe git
      const floorTargets = targetStores.filter(store => store.floor === currentFloor);
      
      if (floorTargets.length > 0) {
        // Son katta olduğumuz için tüm hedef mağazaları değil, sadece bu kattakiler
        const selectedTargets = selectOptimalTargets(
          currentNodeId,
          endId,
          floorTargets, // Sadece bu kattaki mağazalar
          graph,
          mode
        );
        
        if (selectedTargets.length > 0) {
          const pathWithTargets = buildRouteWithTargets(currentNodeId, endId, selectedTargets, graph);
          if (pathWithTargets.length > 0) {
            fullPath = [...fullPath, ...pathWithTargets.slice(1)]; // İlk node'u çıkar (duplicate)
            break;
          }
        }
      }
      
      // Normal rota
      const finalPath = singleFloorDijkstra(currentNodeId, endId, graph);
      if (finalPath.length > 0) {
        fullPath = [...fullPath, ...finalPath.slice(1)];
      }
      break;
    }

    // Ara kat - bir sonraki kata geç
    const nextFloor = floors[i + 1];
    const floorTargets = targetStores.filter(store => store.floor === currentFloor);
    
    // Floor connector'ları bul
    const connectors = findFloorConnectors(currentFloor, nextFloor, graph, preferredTransport);
    
    if (connectors.length === 0) {
      // Fallback: Normal multi-floor algoritması
      return multiFloorDijkstra(currentNodeId, endId, graph, preferredTransport, allGeoData);
    }

    // En yakın connector'ı seç
    let bestConnectorPath = null;
    let minDistance = Infinity;

    for (const connector of connectors) {
      let pathToConnector;
      
      if (floorTargets.length > 0) {
        // Hedef mağazalar varsa onlar üzerinden geç - SADECE BU KATTAKILER
        const selectedTargets = selectOptimalTargets(
          currentNodeId,
          connector.entry,
          floorTargets, // Sadece bu kattaki mağazalar
          graph,
          mode
        );
        
        if (selectedTargets.length > 0) {
          pathToConnector = buildRouteWithTargets(currentNodeId, connector.entry, selectedTargets, graph);
        } else {
          pathToConnector = singleFloorDijkstra(currentNodeId, connector.entry, graph);
        }
      } else {
        pathToConnector = singleFloorDijkstra(currentNodeId, connector.entry, graph);
      }

      if (pathToConnector.length > 0) {
        const distance = calculatePathDistance(pathToConnector, graph);
        if (distance < minDistance) {
          minDistance = distance;
          bestConnectorPath = {
            path: pathToConnector,
            exit: connector.exit,
          };
        }
      }
    }

    if (!bestConnectorPath) {
      // Fallback
      return multiFloorDijkstra(currentNodeId, endId, graph, preferredTransport, allGeoData);
    }

    // Path'i ekle
    if (fullPath.length === 0) {
      fullPath = bestConnectorPath.path;
    } else {
      fullPath = [...fullPath, ...bestConnectorPath.path.slice(1)];
    }

    // Exit node'unu ekle
    fullPath.push(bestConnectorPath.exit);
    currentNodeId = bestConnectorPath.exit;
  }

  return fullPath;
}

/**
 * Hedef mağazaları yükle
 */
async function loadTargetStores(placeId, mode) {
  try {
    if (mode === 'spor') {
      // Client-side'da public API kullan
      if (typeof window !== 'undefined') {
        const response = await fetch(`/api/sport-stores/${placeId}`);
        const data = await response.json();
        return data.success ? data.stores : [];
      }
      // Server-side'da direkt database'e bağlan
      return [];
    }
    
    if (mode === 'keşfet') {
      // Client-side'da public API kullan
      if (typeof window !== 'undefined') {
        const response = await fetch(`/api/popular-stores/${placeId}`);
        const data = await response.json();
        return data.success ? data.stores : [];
      }
      // Server-side'da direkt database'e bağlan
      return [];
    }
    
    return [];
  } catch (error) {
    console.error(`${mode} mağazaları yüklenemedi:`, error);
    return [];
  }
}

/**
 * En uygun hedef mağazaları seç - Akıllı kat filtreleme ile
 */
function selectOptimalTargets(startId, endId, targets, graph, mode) {
  const startFloor = graph[startId]?.floor;
  const endFloor = graph[endId]?.floor;

  // AKILLI KAT FİLTRELEME
  let relevantTargets = targets;
  
  if (mode === 'spor') {
    if (startFloor === endFloor) {
      relevantTargets = targets.filter(target => target.floor === startFloor);
    } else {
      const minFloor = Math.min(startFloor, endFloor);
      const maxFloor = Math.max(startFloor, endFloor);
      relevantTargets = targets.filter(target => 
        target.floor >= minFloor && target.floor <= maxFloor
      );
    }
  } else if (mode === 'keşfet') {
    if (startFloor === endFloor) {
      relevantTargets = targets.filter(target => target.floor === startFloor);
    } else {
      const minFloor = Math.min(startFloor, endFloor);
      const maxFloor = Math.max(startFloor, endFloor);
      relevantTargets = targets.filter(target => 
        target.floor >= minFloor && target.floor <= maxFloor
      );
    }
  }

  if (relevantTargets.length === 0) {
    return [];
  }

  // Her hedef için mesafe hesapla
  const targetDistances = [];

  for (const target of relevantTargets) {
    let targetNodeId = `f${target.floor}-${target.room_id}`;
    
    if (!graph[targetNodeId]) {
      // Alternatif formatları dene
      const alternatives = [
        `f${target.floor}-${target.room_id}`,
        `${target.room_id}`,
        `f${target.floor}-door-${target.room_id.replace('room-', '')}`,
        `f${target.floor}-${target.room_id.replace('room-', '')}`
      ];
      
      let foundNode = null;
      for (const alt of alternatives) {
        if (graph[alt]) {
          foundNode = alt;
          break;
        }
      }
      
      if (!foundNode) {
        continue;
      }
      
      targetNodeId = foundNode;
    }

    // Door node yerine yakınındaki corridor node'unu bul
    const nearbyCorridorNode = findNearbyCorridorNode(targetNodeId, graph);
    if (nearbyCorridorNode) {
      targetNodeId = nearbyCorridorNode;
    }

    // Aynı katta mı kontrol et
    if (target.floor === startFloor) {
      // Başlangıçtan hedefe mesafe
      const pathToTarget = singleFloorDijkstra(startId, targetNodeId, graph);
      if (pathToTarget.length === 0) continue;

      // Hedeften sona mesafe (eğer aynı kattaysa)
      let pathFromTarget = [];
      if (target.floor === endFloor) {
        pathFromTarget = singleFloorDijkstra(targetNodeId, endId, graph);
        if (pathFromTarget.length === 0) continue;
      }

      const distanceToTarget = calculatePathDistance(pathToTarget, graph);
      const distanceFromTarget = pathFromTarget.length > 0 ? calculatePathDistance(pathFromTarget, graph) : 0;
      const totalDistance = distanceToTarget + distanceFromTarget;

      // 🧠 DOĞALLIK KONTROLÜ - Bu spor mağazası doğal rota üzerinde mi?
      const naturalness = calculateNaturalness(startId, endId, targetNodeId, graph);

      targetDistances.push({
        target,
        nodeId: targetNodeId,
        distanceToTarget,
        distanceFromTarget,
        totalDistance,
        naturalness, // Doğallık skoru
        priority: target.floor === startFloor ? 1 : 2,
      });
    } else if (target.floor === endFloor) {
      // Hedef kattaki mağazalar için mesafe hesaplama daha karmaşık
      // Şimdilik basit bir yaklaşım: hedef kata olan mesafe + hedeften sona mesafe
      const pathFromTarget = singleFloorDijkstra(targetNodeId, endId, graph);
      if (pathFromTarget.length === 0) continue;

      const distanceFromTarget = calculatePathDistance(pathFromTarget, graph);
      // Başlangıçtan hedefe olan mesafeyi yaklaşık olarak hesapla
      const estimatedDistanceToTarget = Math.abs(target.floor - startFloor) * 50; // Kat başına 50m varsayımı

      targetDistances.push({
        target,
        nodeId: targetNodeId,
        distanceToTarget: estimatedDistanceToTarget,
        distanceFromTarget,
        totalDistance: estimatedDistanceToTarget + distanceFromTarget,
        priority: 2, // Hedef kattakiler ikinci öncelik
      });
    }
  }

  if (targetDistances.length === 0) {
    console.log(`❌ Erişilebilir hedef mağaza yok`);
    return [];
  }

  // AKILLI SPOR MAĞAZASI SEÇİMİ
  if (mode === 'spor') {
    // 1. Çok uzak olanları filtrele - SIKI TOLERANS
    const normalPath = singleFloorDijkstra(startId, endId, graph);
    const normalDistance = normalPath.length > 0 ? calculatePathDistance(normalPath, graph) : 100;
    const maxAcceptableDistance = normalDistance * 1.8;
    
    const reasonableTargets = targetDistances.filter(t => t.totalDistance <= maxAcceptableDistance);
    
    if (reasonableTargets.length === 0) {
      return [];
    }

    // GERİ DÖNÜŞ KONTROLÜ
    const noBacktrackTargets = filterNoBacktrackTargets(startId, endId, reasonableTargets, graph);
    
    if (noBacktrackTargets.length === 0) {
      return [];
    }

    // 2. Efficiency score hesapla - SIKI PUANLAMA
    const scoredTargets = noBacktrackTargets.map(target => {
      // Detour maliyeti = (spor mağazası rotası - normal rota)
      const detourCost = target.totalDistance - normalDistance;
      
      // Sıkı efficiency hesaplama - sadece çok yakın olanlar kabul
      let efficiency;
      if (detourCost <= 15) {
        efficiency = 10; // Çok az detour = mükemmel
      } else if (detourCost <= 30) {
        efficiency = 6; // Az detour = iyi
      } else if (detourCost <= 50) {
        efficiency = 3; // Orta detour = zayıf
      } else {
        efficiency = 1; // Fazla detour = çok zayıf
      }
      
      // Rotaya uygunluk bonusu - normal rotanın üzerinde olanlar
      const onRouteBonus = detourCost <= 20 ? 5 : 0; // Rotaya çok yakın olanlar bonus
      
      return {
        ...target,
        detourCost,
        efficiency,
        onRoute: detourCost <= 20, // Rotaya uygun mu?
        score: efficiency + onRouteBonus
      };
    });

    // 3. Score'a göre sırala (yüksek score = daha iyi)
    scoredTargets.sort((a, b) => b.score - a.score);

    // 4. AKILLI MAĞAZA SEÇİMİ - Rotaya uygunluğa göre
    const onRouteTargets = scoredTargets.filter(t => t.onRoute);
    const offRouteTargets = scoredTargets.filter(t => !t.onRoute);
    
    let selected = [];
    
    if (onRouteTargets.length >= 2) {
      selected = onRouteTargets.slice(0, 2);
    } else if (onRouteTargets.length === 1) {
      selected = [onRouteTargets[0]];
      if (offRouteTargets.length > 0) {
        selected.push(offRouteTargets[0]);
      }
    } else {
      selected = scoredTargets.slice(0, 1);
    }
    
    return selected;
  }

  // Keşfet modu: Maksimum 3 mağaza, popüler olanları tercih et
  if (mode === 'keşfet') {
    return targetDistances.slice(0, 3);
  }

  return [];
}

/**
 * Hedef mağazalar üzerinden geçen akıllı rota oluştur
 */
function buildRouteWithTargets(startId, endId, selectedTargets, graph) {
  if (selectedTargets.length === 0) {
    return singleFloorDijkstra(startId, endId, graph);
  }

  // Hedefleri coğrafi olarak optimize et
  const optimizedTargets = optimizeTargetOrder(startId, endId, selectedTargets, graph);
  
  let fullPath = [];
  let currentId = startId;

  // Her hedefe sırayla git
  for (let i = 0; i < optimizedTargets.length; i++) {
    const target = optimizedTargets[i];
    const pathToTarget = singleFloorDijkstra(currentId, target.nodeId, graph);
    
    if (pathToTarget.length === 0) {
      continue;
    }

    if (fullPath.length === 0) {
      fullPath = pathToTarget;
    } else {
      fullPath = [...fullPath, ...pathToTarget.slice(1)];
    }

    currentId = target.nodeId;
  }

  // Son hedeften finale git
  const finalPath = singleFloorDijkstra(currentId, endId, graph);
  if (finalPath.length > 0) {
    fullPath = [...fullPath, ...finalPath.slice(1)];
  }

  return fullPath;
}

/**
 * Hedefleri coğrafi olarak optimize et - GERİ DÖNÜŞ ENGELLEME
 */
function optimizeTargetOrder(startId, endId, targets, graph) {
  if (targets.length <= 1) return targets;

  const startCoords = graph[startId]?.coords;
  const endCoords = graph[endId]?.coords;
  
  if (!startCoords || !endCoords) {
    return targets;
  }

  // Ana rota vektörünü hesapla (başlangıçtan hedefe)
  const mainRouteVector = {
    x: endCoords[0] - startCoords[0],
    y: endCoords[1] - startCoords[1]
  };

  // Her hedef için rota üzerindeki konumunu hesapla
  const targetsWithPosition = targets.map(target => {
    const targetCoords = graph[target.nodeId]?.coords;
    if (!targetCoords) return { ...target, routePosition: -1, distanceFromRoute: Infinity };

    // Hedefin başlangıçtan olan vektörü
    const targetVector = {
      x: targetCoords[0] - startCoords[0],
      y: targetCoords[1] - startCoords[1]
    };

    // Ana rota üzerindeki projeksiyon pozisyonu (0-1 arası)
    const dotProduct = (targetVector.x * mainRouteVector.x + targetVector.y * mainRouteVector.y);
    const mainRouteLength = Math.sqrt(mainRouteVector.x * mainRouteVector.x + mainRouteVector.y * mainRouteVector.y);
    const routePosition = Math.max(0, Math.min(1, dotProduct / (mainRouteLength * mainRouteLength)));

    // Ana rotadan olan mesafe (yan sapma)
    const projectionX = startCoords[0] + routePosition * mainRouteVector.x;
    const projectionY = startCoords[1] + routePosition * mainRouteVector.y;
    const distanceFromRoute = Math.sqrt(
      Math.pow(targetCoords[0] - projectionX, 2) + 
      Math.pow(targetCoords[1] - projectionY, 2)
    );

    return { 
      ...target, 
      routePosition, 
      distanceFromRoute,
      projectionX,
      projectionY
    };
  });

  // Rota pozisyonuna göre sırala (başlangıçtan hedefe doğru)
  return targetsWithPosition
    .filter(t => t.routePosition >= 0)
    .sort((a, b) => a.routePosition - b.routePosition);
}

/**
 * Spor mağazasının doğal rota üzerinde olup olmadığını hesapla
 * Yüksek skor = doğal, düşük skor = zoraki sapma
 */
function calculateNaturalness(startId, endId, targetId, graph) {
  const normalPath = singleFloorDijkstra(startId, endId, graph);
  if (normalPath.length === 0) return 0;
  
  const normalDistance = calculatePathDistance(normalPath, graph);
  
  const pathToTarget = singleFloorDijkstra(startId, targetId, graph);
  const pathFromTarget = singleFloorDijkstra(targetId, endId, graph);
  
  if (pathToTarget.length === 0 || pathFromTarget.length === 0) return 0;
  
  const sportDistance = calculatePathDistance(pathToTarget, graph) + calculatePathDistance(pathFromTarget, graph);
  const detourRatio = sportDistance / normalDistance;
  
  if (detourRatio <= 1.1) return 1.0;
  if (detourRatio <= 1.2) return 0.8;
  if (detourRatio <= 1.3) return 0.5;
  if (detourRatio <= 1.5) return 0.2;
  return 0.0;
}

/**
 * Geri dönüş gerektiren spor mağazalarını filtrele - ASLA GERİ DÖNÜŞ OLMAYACAK
 */
function filterNoBacktrackTargets(startId, endId, targets, graph) {
  const startCoords = graph[startId]?.coords;
  const endCoords = graph[endId]?.coords;
  
  if (!startCoords || !endCoords) {
    return targets;
  }

  // Ana rota vektörünü hesapla
  const mainVector = {
    x: endCoords[0] - startCoords[0],
    y: endCoords[1] - startCoords[1]
  };

  const validTargets = targets.filter(target => {
    const targetCoords = graph[target.nodeId]?.coords;
    if (!targetCoords) return false;

    // Hedefin başlangıçtan olan vektörü
    const targetVector = {
      x: targetCoords[0] - startCoords[0],
      y: targetCoords[1] - startCoords[1]
    };

    // Dot product ile yön kontrolü
    const dotProduct = targetVector.x * mainVector.x + targetVector.y * mainVector.y;
    
    // Pozitif dot product = aynı yön (geri dönüş yok)
    // Negatif dot product = ters yön (geri dönüş var)
    const isForwardDirection = dotProduct >= 0;
    
    // Ek kontrol: Hedef ana rotanın %80'inden fazla ilerlemişse kabul etme
    const mainRouteLength = Math.sqrt(mainVector.x * mainVector.x + mainVector.y * mainVector.y);
    const targetLength = Math.sqrt(targetVector.x * targetVector.x + targetVector.y * targetVector.y);
    const progressRatio = targetLength / mainRouteLength;
    const isTooFarAhead = progressRatio > 0.8;

    return isForwardDirection && !isTooFarAhead;
  });

  return validTargets;
}

/**
 * Spor mağazasının yakınındaki corridor node'unu bul (önünden geçmek için)
 */
function findNearbyCorridorNode(doorNodeId, graph) {
  const doorNode = graph[doorNodeId];
  if (!doorNode || !doorNode.coords) {
    return null;
  }

  const doorCoords = doorNode.coords;
  const floor = doorNode.floor;
  
  // Aynı kattaki corridor node'larını bul
  const corridorNodes = Object.keys(graph).filter(nodeId => {
    const node = graph[nodeId];
    return node && 
           node.floor === floor && 
           nodeId.includes('corridor') && 
           node.coords;
  });

  if (corridorNodes.length === 0) {
    return null;
  }

  // En yakın corridor node'unu bul
  let closestNode = null;
  let minDistance = Infinity;

  for (const corridorId of corridorNodes) {
    const corridorNode = graph[corridorId];
    const corridorCoords = corridorNode.coords;
    
    // Mesafe hesapla
    const distance = Math.sqrt(
      Math.pow(corridorCoords[0] - doorCoords[0], 2) + 
      Math.pow(corridorCoords[1] - doorCoords[1], 2)
    );

    // Yakın corridor'ları tercih et (mağaza önü)
    if (distance < minDistance && distance < 40) {
      minDistance = distance;
      closestNode = corridorId;
    }
  }

  return closestNode;
}

/**
 * Floor connector'ları bul
 */
function findFloorConnectors(currentFloor, nextFloor, graph, preferredTransport) {
  const connectors = [];
  const direction = nextFloor > currentFloor ? 'up' : 'down';

  // Entry connector'ları bul
  const entryConnectors = Object.keys(graph).filter(id => {
    const node = graph[id];
    return (
      node.type === 'floor-connector-node' &&
      node.floor === currentFloor &&
      id.includes('entry') &&
      (node.connector_type === preferredTransport || node.connector_type === 'escalator' || node.connector_type === 'elevator') &&
      (node.direction === direction || node.direction === 'bidirectional')
    );
  });

  // Her entry için karşılık gelen exit'i bul
  for (const entryId of entryConnectors) {
    const entryNode = graph[entryId];
    const baseName = entryNode.baseName;

    // Karşılık gelen exit'i ara
    const exitId = Object.keys(graph).find(id => {
      const node = graph[id];
      return (
        node.type === 'floor-connector-node' &&
        node.floor === nextFloor &&
        id.includes('exit') &&
        node.baseName === baseName
      );
    });

    if (exitId) {
      connectors.push({
        entry: entryId,
        exit: exitId,
        baseName: baseName,
      });
    }
  }

  return connectors;
}