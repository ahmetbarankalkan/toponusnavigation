/**
 * Gelişmiş Rotalama Algoritmaları
 * Spor ve Keşfet modları için özel rotalama
 */
import { singleFloorDijkstra, multiFloorDijkstra, calculatePathDistance } from './dijkstra';

// Yardımcı: Türkçe karakter sorunlarını çözen string normalize edici
export const normalizeStr = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .toLowerCase();
};

/**
 * Gelişmiş rota hesaplama - mod bazlı
 * @param {string} startId - Başlangıç node ID'si
 * @param {string} endId - Hedef node ID'si
 * @param {Object} graph - Graph objesi
 * @param {string} mode - Rotalama modu ('basit', 'spor', 'keşfet')
 * @param {string} preferredTransport - Tercih edilen transport
 * @param {Object} allGeoData - GeoJSON verileri
 * @param {string} placeId - Yer ID'si
 * @param {Array} skippedWaypoints - Atlanan noktalar
 * @param {Object} userFavorites - Kullanıcı favorileri
 * @param {Array} rooms - Mağaza/oda verileri
 * @returns {Array} Rota node ID'leri
 */
export async function calculateAdvancedRoute(
  startId,
  endId,
  graph,
  mode = 'basit',
  preferredTransport,
  allGeoData,
  placeId,
  skippedWaypoints = [],
  userFavorites = null,
  rooms = [],
  allCampaigns = []
) {
  // Sadece önemli logları tut
  if (mode !== 'basit') {
    console.log(`🎯 ${mode} modu: ${startId} → ${endId}`);
  }

  // Basit mod - mevcut algoritma
  if (mode === 'basit') {
    const startFloor = graph[startId]?.floor;
    const endFloor = graph[endId]?.floor;
    
    let path = [];
    if (startFloor === endFloor) {
      path = singleFloorDijkstra(startId, endId, graph);
    } else {
      path = multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData);
    }
    return { path, targets: [] };
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
        return { path: normalPath, targets: [] };
      }
    } else {
      // Farklı katlar arası - kat farkı 1'den fazlaysa spor modu gereksiz
      const floorDifference = Math.abs(endFloor - startFloor);
      if (floorDifference > 1) {
        return { path: multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData), targets: [] };
      }
    }
    
    return await calculateSpecialRoute(
      startId,
      endId,
      graph,
      mode,
      preferredTransport,
      allGeoData,
      placeId,
      skippedWaypoints,
      userFavorites,
      rooms,
      allCampaigns
    );
  }

  // Fallback
  return { path: singleFloorDijkstra(startId, endId, graph), targets: [] };
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
  placeId,
  skippedWaypoints = [],
  userFavorites = null,
  rooms = [],
  allCampaigns = []
) {
  const startFloor = graph[startId]?.floor;
  const endFloor = graph[endId]?.floor;

  // Hedef mağazaları yükle: Keşfet modunda tüm kampanyaları baz al, spor modunda sadece popülerleri
  let targetStores = [];
  if (mode === 'keşfet' && allCampaigns && allCampaigns.length > 0) {
    targetStores = allCampaigns.map(c => ({
      ...c,
      room_id: c.room_id || c.id
    }));
  } else {
    targetStores = await loadTargetStores(placeId, mode);
  }
  
  // KİŞİSELLEŞTİRME: Favori mağazaları, kampanyaları ve ürünleri hedef olarak ekle
  if (mode === 'keşfet' && userFavorites) {
    console.log("🧩 Personalization: Merging favorites into target pool...");
    
    // Yardımcı: Odadan kat ve veri bul
    const findRoomData = (storeId, name) => {
      const sId = normalizeStr(storeId);
      const sName = normalizeStr(name);
      return rooms.find(r => 
        (r.room_id && normalizeStr(r.room_id) === sId) ||
        (r.id && normalizeStr(r.id) === sId) ||
        (r.name && normalizeStr(r.name) === sName) ||
        (r.originalId && normalizeStr(r.originalId) === sId)
      );
    };

    // 1. Favori Mağazalar
    if (userFavorites.favorites && userFavorites.favorites.length > 0) {
      userFavorites.favorites.forEach(fav => {
        const favStoreId = normalizeStr(fav.storeId);
        const favId = normalizeStr(fav.id);
        const favName = normalizeStr(fav.storeName);

        const existingIdx = targetStores.findIndex(s => 
          normalizeStr(s.room_id) === favStoreId || 
          normalizeStr(s.id) === favId ||
          (favName && normalizeStr(s.name) === favName)
        );

        if (existingIdx === -1) {
          const roomData = findRoomData(fav.storeId, fav.storeName);
          if (roomData) {
            targetStores.push({
              id: fav.id || `fav-store-${favStoreId}`,
              room_id: roomData.room_id || fav.storeId,
              floor: roomData.floor,
              name: roomData.name || fav.storeName,
              category: roomData.category || fav.category,
              logo: roomData.logo,
              popular_campaign: {
                title: 'Favori Mağazanız',
                description: 'Sizin için seçtiğimiz favori mekanınız.',
                is_active: true
              },
              is_favorite_target: true
            });
          }
        } else {
          targetStores[existingIdx].is_favorite_target = true;
        }
      });
    }

    // 2. Favori Kampanyalar
    if (userFavorites.campaigns && userFavorites.campaigns.length > 0) {
      userFavorites.campaigns.forEach(camp => {
        const campStoreId = normalizeStr(camp.storeId || camp.roomData?.room_id || camp.roomData?.id);
        const campId = normalizeStr(camp.id || camp.campaignId);
        const campName = normalizeStr(camp.storeName);
        
        const existingIdx = targetStores.findIndex(s => 
          (campStoreId && normalizeStr(s.room_id) === campStoreId) || 
          (campId && normalizeStr(s.id) === campId) ||
          (campName && normalizeStr(s.name) === campName)
        );

        if (existingIdx === -1) {
          const roomData = findRoomData(camp.storeId, camp.storeName);
          if (roomData) {
            targetStores.push({
              id: camp.id || `fav-camp-${campId}`,
              room_id: roomData.room_id || camp.storeId,
              floor: roomData.floor,
              name: roomData.name || camp.storeName,
              category: roomData.category || camp.category,
              logo: roomData.logo,
              popular_campaign: {
                title: camp.title || camp.campaignTitle || 'Favori Kampanya',
                description: camp.description || 'İlgilendiğiniz güncel fırsat.',
                is_active: true
              },
              is_favorite_target: true
            });
          }
        } else {
          targetStores[existingIdx].is_favorite_target = true;
          // UI'da doğru gözükmesi için kampanya bilgisini güncelle
          if (camp.title || camp.campaignTitle) {
            targetStores[existingIdx].popular_campaign = {
              title: camp.title || camp.campaignTitle || 'Favori Kampanya',
              description: camp.description || 'İlgilendiğiniz güncel fırsat.',
              is_active: true
            };
          }
        }
      });
    }

    // 3. Favori Ürünler
    if (userFavorites.products && userFavorites.products.length > 0) {
      userFavorites.products.forEach(prod => {
        const prodStoreId = normalizeStr(prod.storeId || prod.productData?.storeId);
        const prodName = normalizeStr(prod.storeName);
        
        const existingIdx = targetStores.findIndex(s => 
          (prodStoreId && normalizeStr(s.room_id) === prodStoreId) ||
          (prodName && normalizeStr(s.name) === prodName)
        );

        if (existingIdx === -1) {
          const roomData = findRoomData(prod.storeId, prod.storeName);
          if (roomData) {
            targetStores.push({
              id: prod.id || `fav-prod-${prodStoreId}`,
              room_id: roomData.room_id || prod.storeId,
              floor: roomData.floor,
              name: roomData.name || prod.storeName,
              category: roomData.category || prod.category,
              logo: roomData.logo,
              popular_campaign: {
                title: prod.name || prod.productName || 'Favori Ürün',
                description: 'Favori ürünlerinizin bulunduğu mağaza.',
                is_active: true
              },
              is_favorite_target: true
            });
          }
        } else {
          targetStores[existingIdx].has_favorite_product = true;
          // UI'da ürünün gözükmesi için kampanya bilgisini güncelle
          if (prod.name || prod.productName) {
            targetStores[existingIdx].popular_campaign = {
              title: prod.name || prod.productName || 'Favori Ürün',
              description: 'Favori ürünlerinizin bulunduğu mağaza.',
              is_active: true
            };
          }
        }
      });
    }
  }

  if (skippedWaypoints && skippedWaypoints.length > 0) {
    console.log(`⏩ Skipping ${skippedWaypoints.length} waypoints:`, skippedWaypoints);
    const skippedSet = new Set(skippedWaypoints.map(w => w ? String(w).replace(/^f\d+-/, '').replace(/^room-/, '') : null).filter(Boolean));
    
    targetStores = targetStores.filter(store => {
      const sId = store.id ? String(store.id).replace(/^f\d+-/, '').replace(/^room-/, '') : null;
      const sRoomId = store.room_id ? String(store.room_id).replace(/^f\d+-/, '').replace(/^room-/, '') : null;
      return !skippedSet.has(sId) && !skippedSet.has(sRoomId);
    });
  }
  
  console.log(`🎯 Total candidate stores for route: ${targetStores.length}`);

  if (targetStores.length === 0) {
    const path = startFloor === endFloor 
      ? singleFloorDijkstra(startId, endId, graph)
      : multiFloorDijkstra(startId, endId, graph, preferredTransport, allGeoData);
    return { path, targets: [] };
  }

  // Tek kat rotası
  if (startFloor === endFloor) {
    return calculateSingleFloorSpecialRoute(
      startId,
      endId,
      graph,
      mode,
      targetStores,
      startFloor,
      userFavorites
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
    targetStores,
    userFavorites
  );
}

/**
 * Tek kat özel rota hesaplama
 */
function calculateSingleFloorSpecialRoute(
  startId, 
  endId, 
  graph, 
  mode, 
  targetStores, 
  floor, 
  userFavorites = null
) {
  // Keşfet modunda diğer katlardaki favorileri de görebilmek için tüm mağazaları al, spor modunda sadece bu kat
  const floorTargets = mode === 'keşfet' 
    ? targetStores 
    : targetStores.filter(store => store.floor !== undefined && Number(store.floor) === Number(floor));

  console.log(`🏢 Single Floor Routing: Evaluating ${floorTargets.length}/${targetStores.length} targets.`);

  if (floorTargets.length === 0) {
    return { path: singleFloorDijkstra(startId, endId, graph), targets: [] };
  }

  // En uygun mağazaları seç
  const selectedTargets = selectOptimalTargets(
    startId,
    endId,
    floorTargets,
    graph,
    mode,
    userFavorites
  );

  if (selectedTargets.length === 0) {
    return { path: singleFloorDijkstra(startId, endId, graph), targets: [] };
  }

  // Mağazalar üzerinden geçen rota oluştur
  const { fullPath, optimizedTargets } = buildRouteWithTargets(startId, endId, selectedTargets, graph);
  return { path: fullPath, targets: optimizedTargets };
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
  targetStores,
  userFavorites = null
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
  let allSelectedTargets = [];

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
          mode,
          userFavorites
        );
        
        if (selectedTargets.length > 0) {
          const { fullPath: pathWithTargets, optimizedTargets } = buildRouteWithTargets(currentNodeId, endId, selectedTargets, graph);
          if (pathWithTargets.length > 0) {
            fullPath = [...fullPath, ...pathWithTargets.slice(1)]; // İlk node'u çıkar (duplicate)
            allSelectedTargets = [...allSelectedTargets, ...optimizedTargets];
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
      return { path: multiFloorDijkstra(currentNodeId, endId, graph, preferredTransport, allGeoData), targets: allSelectedTargets };
    }

    // En yakın connector'ı seç
    let bestConnectorPath = null;
    let bestTargetsOnThisFloor = [];
    let minDistance = Infinity;

    for (const connector of connectors) {
      let pathToConnector;
      let currentConnectorTargets = [];
      
      if (floorTargets.length > 0) {
        // Hedef mağazalar varsa onlar üzerinden geç - SADECE BU KATTAKILER
        currentConnectorTargets = selectOptimalTargets(
          currentNodeId,
          connector.entry,
          floorTargets, // Sadece bu kattaki mağazalar
          graph,
          mode,
          userFavorites
        );
        
        if (currentConnectorTargets.length > 0) {
          const { fullPath: p, optimizedTargets: t } = buildRouteWithTargets(currentNodeId, connector.entry, currentConnectorTargets, graph);
          pathToConnector = p;
          currentConnectorTargets = t;
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
          bestTargetsOnThisFloor = currentConnectorTargets;
        }
      }
    }

    if (!bestConnectorPath) {
      // Fallback
      return { path: multiFloorDijkstra(currentNodeId, endId, graph, preferredTransport, allGeoData), targets: allSelectedTargets };
    }

    // Hedefleri asıl listeye ekle
    allSelectedTargets = [...allSelectedTargets, ...bestTargetsOnThisFloor];

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
  return { path: fullPath, targets: allSelectedTargets };
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
function selectOptimalTargets(startId, endId, targets, graph, mode, userFavorites = null) {
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
    const cleanRoomId = String(target.room_id || target.id || '').replace('room-', '');
    let targetNodeId = `f${target.floor}-${target.room_id || target.id}`;
    
    if (!graph[targetNodeId]) {
      // Alternatif formatları dene
      const alternatives = [
        `f${target.floor}-${target.room_id || target.id}`,
        `${target.room_id || target.id}`,
        `f${target.floor}-door-${cleanRoomId}`,
        `f${target.floor}-${cleanRoomId}`
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
    } else if (mode === 'keşfet') {
      // Ne başlangıç ne de bitiş katında olan (başka bir kattaki) favorileri ve kampanyaları ekle
      const estimatedDistance = Math.abs(Number(target.floor) - Number(startFloor)) * 150 + 100;
      targetDistances.push({
        target,
        nodeId: targetNodeId,
        distanceToTarget: estimatedDistance,
        distanceFromTarget: estimatedDistance,
        totalDistance: estimatedDistance * 2,
        naturalness: 0,
        priority: 3,
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

    // 2. Efficiency score hesapla - FAVORİLER İÇİN ESNEK
    const scoredTargets = reasonableTargets.map(target => {
      const detourCost = target.totalDistance - normalDistance;
      
      const isFavorite = target.target.is_favorite_target || target.target.has_favorite_product;

      // Favoriler için geri dönüş filtresini esnet veya kaldır
      const noBacktrackTargets = isFavorite 
        ? [target] // Favoriyse backtracking filtresini atla
        : filterNoBacktrackTargets(startId, endId, [target], graph);
      
      const isValid = noBacktrackTargets.length > 0;
      if (!isValid) return { ...target, score: -1000, isValid: false };

      let efficiency;
      if (detourCost <= 15) {
        efficiency = 10;
      } else if (detourCost <= 30) {
        efficiency = 6;
      } else if (detourCost <= 50) {
        efficiency = 3;
      } else {
        efficiency = 1;
      }
      
      const onRouteBonus = detourCost <= 20 ? 5 : 0;
      
      return {
        ...target,
        detourCost,
        efficiency,
        onRoute: detourCost <= 20,
        isValid: true,
        score: efficiency + onRouteBonus + (isFavorite ? 50 : 0) // Favoriye ek avantaj
      };
    }).filter(t => t.isValid);

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

  // Keşfet modu: Maksimum 3 mağaza, popüler ve KİŞİSELLEŞTİRİLMİŞ olanları tercih et
  if (mode === 'keşfet') {
    const scoredKeşfet = targetDistances.map((item, i) => {
      let relevanceScore = 0;
      
      if (userFavorites) {
        const { favorites = [], campaigns = [], products = [] } = userFavorites;
        
        const targetRoomId = String(item.target.room_id || '').toLowerCase();
        const targetId = String(item.target.id || '').toLowerCase();
        const targetCategory = String(item.target.category || '').toLowerCase();
        const targetName = String(item.target.name || '').toLowerCase();

        if (i === 0) {
          console.log(`🔍 Keşfet Modu: ${targetDistances.length} potansiyel hedef inceleniyor...`);
        }

        // 0. Kullanılmışlık Kontrolü
        const isUsed = campaigns.some(c => 
          (String(c.id).toLowerCase() === targetId || String(c.campaignId).toLowerCase() === targetId || String(c.storeId).toLowerCase() === targetRoomId) && c.is_used
        );
        
        if (isUsed) return { ...item, relevanceScore: -1, finalScore: -1000 };

        // 1. Favori Mağaza Kontrolü (+250) - ÇOK GÜÇLÜ EŞLEŞME
        const isFavStore = favorites.some(f => {
          const favStoreId = String(f.storeId || '').toLowerCase();
          const favId = String(f.id || '').toLowerCase();
          const favRoomId = String(f.roomData?.id || f.roomData?.room_id || '').toLowerCase();
          
          return (
            favStoreId === targetRoomId || 
            favId === targetId ||
            favRoomId === targetRoomId ||
            favStoreId === targetId ||
            targetName.includes(normalizeStr(f.storeName)) ||
            normalizeStr(f.storeName) === targetName
          );
        });
        if (isFavStore) relevanceScore += 250;
        
        // 2. Favori Kampanya Kontrolü (+200)
        const isFavCampaign = campaigns.some(c => {
          const favCId = normalizeStr(c.id || c.campaignId);
          const favCStoreId = normalizeStr(c.storeId);
          return favCId === targetId || favCStoreId === targetRoomId;
        });
        if (isFavCampaign) relevanceScore += 200;
        
        // 3. Favori Ürün Barındıran Mağaza (+150)
        const hasFavProduct = products.some(p => {
          const pStoreId = normalizeStr(p.storeId || p.productData?.storeId);
          const pStoreName = normalizeStr(p.storeName);
          return pStoreId === targetRoomId || (pStoreName && pStoreName === targetName);
        });
        if (hasFavProduct) relevanceScore += 150;
        
        // 4. AI MANTIĞI: İlgili Kategoriler ve Benzerlik (+80)
        const userFavCategories = [
          ...favorites.map(f => f.roomData?.category || f.category),
          ...campaigns.map(c => c.category || c.roomData?.category),
          ...products.map(p => p.category || p.roomData?.category)
        ].map(cat => normalizeStr(cat)).filter(Boolean);
        
        const relatedCategoryMap = {
          'moda': ['ayakkabi', 'aksesuar', 'canta', 'kozmetik', 'giyim', 'taki'],
          'teknoloji': ['elektronik', 'beyaz esya', 'telefon', 'bilgisayar', 'aksesuar'],
          'yeme-icme': ['restoran', 'kafe', 'tatli', 'fast-food', 'market'],
          'kozmetik': ['guzellik', 'bakim', 'parfum', 'moda', 'kisisel bakim'],
          'ev-yasam': ['mobilya', 'dekorasyon', 'zuccaciye', 'beyaz esya', 'market'],
          'spor': ['outdoor', 'fitness', 'ayakkabi', 'moda', 'giyim'],
          'market': ['supermarket', 'gida', 'kisisel bakim', 'ev-yasam', 'kozmetik'],
          'kisisel bakim': ['kozmetik', 'bakim', 'guzellik', 'market']
        };

        userFavCategories.forEach(cat => {
          if (cat === targetCategory) {
            relevanceScore += 80;
          } else if (relatedCategoryMap[cat]?.includes(targetCategory)) {
            relevanceScore += 40; 
          }
        });

        // İsim bazlı benzerlik (Tüm favori tiplerinden isimleri topla)
        const allFavNames = [
          ...favorites.map(f => normalizeStr(f.storeName)),
          ...campaigns.map(c => normalizeStr(c.storeName)),
          ...products.map(p => normalizeStr(p.storeName))
        ].filter(Boolean);
        
        if (allFavNames.some(name => targetName.includes(name) || name.includes(targetName))) {
          relevanceScore += 120; 
        }

        // 5. DOĞRUDAN FAVORİ ETİKETİ KONTROLÜ (Garantili Bonus)
        if (item.target.is_favorite_target) relevanceScore += 300;
        if (item.target.has_favorite_product) relevanceScore += 200;

        if (relevanceScore > 0) {
          console.log(`🤖 [AI Score] ${item.target.name}: ${relevanceScore} (Favori: ${item.target.is_favorite_target})`);
        }
      }

      // Final Skoru: (Alaka Puanı * 10) - (Mesafe / 5)
      // Bu sayede çok yakın olmayan ama alakalı olan mağazalar öne çıkar
      return {
        ...item,
        relevanceScore,
        finalScore: (relevanceScore * 10) - (item.totalDistance / 5)
      };
    });

    // Skora göre büyükten küçüğe sırala
    scoredKeşfet.sort((a, b) => b.finalScore - a.finalScore);
    
    // KİŞİSELLEŞTİRME FİLTRESİ: 
    // Eğer kullanıcı giriş yapmışsa ve favorileri varsa, SADECE alakalı (relevanceScore > 0) olanları göster.
    const hasAnyFavorites = userFavorites && (
      (userFavorites.favorites && userFavorites.favorites.length > 0) || 
      (userFavorites.campaigns && userFavorites.campaigns.length > 0) || 
      (userFavorites.products && userFavorites.products.length > 0)
    );

    // KİŞİSELLEŞTİRME FİLTRESİ: KOMPLE KULLANICI ODAKLI
    if (hasAnyFavorites) {
      // SADECE relevanceScore > 0 olanları (alakalı olanları) al
      const strictlyRelevant = scoredKeşfet.filter(item => item.relevanceScore > 0);
      
      // Alakalı olanlar varsa skora göre sırala ve max 10 tane dön
      strictlyRelevant.sort((a, b) => b.finalScore - a.finalScore);
      
      if (strictlyRelevant.length > 0) {
        console.log(`✅ Keşfet: ${strictlyRelevant.length} alakalı hedef seçildi:`, strictlyRelevant.map(t => t.target.name).join(', '));
      }
      
      return strictlyRelevant.slice(0, 10);
    }

    // Misafir: Sadece çok yakın popülerleri göster
    return scoredKeşfet.filter(item => item.totalDistance < 100).slice(0, 2);
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

  return { fullPath, optimizedTargets };
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