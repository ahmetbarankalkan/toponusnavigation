import { useEffect } from 'react';
import { calculateAdvancedRoute } from '../utils/advancedRouting.js';
import { shouldSkipStep } from '../utils/routeHelpers.js';
import { toAdvancedRouteMode, isExploreRouteMode } from '../utils/routeMode.js';

export const useRouteCalculation = ({
  mapRef,
  graph,
  rooms,
  selectedStartRoom,
  selectedEndRoom,
  routeMode,
  placeId,
  preferredTransport,
  allGeoData,
  currentFloor,
  changeFloor,
  setTotalDistance,
  setRouteByFloor,
  setRouteSteps,
  setSearchQuery,
  isAnimationActiveRef,
  animationFrameIdRef,
  animateIconAlongRoute,
  setExploreWaypoints,
  skippedWaypoints = [],
  userFavorites = null,
  allCampaigns = []
}) => {
  useEffect(() => {
    const clearMapSourceSafely = (map, sourceId, emptyData) => {
      if (!map) return;
      try {
        if (!map.isStyleLoaded()) return;
        const source = map.getSource(sourceId);
        if (source) {
          source.setData(emptyData);
        }
      } catch (error) {
        console.warn(`Source clear skipped (${sourceId}):`, error?.message || error);
      }
    };

    const normalizeId = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^f\d+-/, '')
        .replace(/^room-/, '');

    const buildExploreFallbackTargets = () => {
      if (!allCampaigns || allCampaigns.length === 0) return [];
      if (!selectedEndRoom) return [];

      const favoriteSet = new Set(
        [
          ...(userFavorites?.favorites || []),
          ...(userFavorites?.campaigns || []),
          ...(userFavorites?.products || []),
        ]
          .flatMap(item => [
            item.id,
            item.storeId,
            item.campaignId,
            item.productId,
            item.roomData?.id,
            item.roomData?.room_id,
            item.storeName,
            item.productData?.storeId,
          ])
          .map(normalizeId)
          .filter(Boolean)
      );
      if (favoriteSet.size === 0) return [];

      const skippedSet = new Set((skippedWaypoints || []).map(normalizeId));
      const endId = normalizeId(selectedEndRoom);

      const usedSet = new Set(
        [
          ...((userFavorites?.campaigns || []).filter(item => item?.is_used)),
          ...((userFavorites?.products || []).filter(item => item?.is_used)),
        ]
          .flatMap(item => [
            item.id,
            item.campaignId,
            item.productId,
            item.storeId,
            item.roomData?.id,
            item.roomData?.room_id,
            item.storeName,
          ])
          .map(normalizeId)
          .filter(Boolean)
      );

      const candidate = allCampaigns.find(camp => {
        const ids = [
          camp.id,
          camp.room_id,
          camp.originalId,
          camp.name,
        ].map(normalizeId);

        const isFavoriteMatch = ids.some(id => favoriteSet.has(id));
        const isSkipped = ids.some(id => skippedSet.has(id));
        const isUsed = ids.some(id => usedSet.has(id));
        const isDestination = ids.includes(endId);

        return isFavoriteMatch && !isSkipped && !isUsed && !isDestination;
      });

      return candidate ? [{ target: candidate }] : [];
    };

    // Async wrapper function
    const calculateRouteAsync = async () => {
      const map = mapRef.current;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      clearMapSourceSafely(map, 'animation-icon-source', {
        type: 'FeatureCollection',
        features: [],
      });
      if (!graph || !selectedStartRoom || !selectedEndRoom) {
        setTotalDistance(0);
        setRouteByFloor({});
        setRouteSteps([]);
        isAnimationActiveRef.current = false;
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        clearMapSourceSafely(map, 'animation-icon-source', {
          type: 'FeatureCollection',
          features: [],
        });
        clearMapSourceSafely(map, 'path', {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
        });
        return;
      }
      const startRoom = rooms.find(r => r.id === selectedStartRoom);
      const endRoom = rooms.find(r => r.id === selectedEndRoom);
      if (!startRoom || !endRoom) {
        setTotalDistance(0);
        setRouteByFloor({});
        setRouteSteps([]);
        return;
      }
      const normalizedMode = toAdvancedRouteMode(routeMode);
      console.log(`🔄 Route calculation starting... Mode: ${normalizedMode}`);
      console.log(`📍 PlaceId: ${placeId}`);
      console.log(`👤 User Favorites Status: ${userFavorites ? 'Loaded' : 'None'}`);
      console.log(
        `🏠 Start: ${startRoom.name} (${
          startRoom.floor
        }) -> ${startRoom.doorId || 'COORDINATE'}`
      );
      console.log(
        `🎯 End: ${endRoom.name} (${endRoom.floor}) -> ${endRoom.doorId}`
      );

      // Koordinat odası için graph'a dinamik node ekle
      let startDoorId, endDoorId;

      if (startRoom.isCoordinate) {
        // Koordinat için benzersiz node ID oluştur
        const coordNodeId = `f${startRoom.floor}-coord-${Date.now()}`;

        // En yakın 3 node'u bul
        const nearbyNodes = [];
        // startRoom.coordinates = [lng, lat] formatında
        const coordLat = startRoom.coordinates[1];
        const coordLng = startRoom.coordinates[0];

        Object.keys(graph).forEach(nodeId => {
          const node = graph[nodeId];
          if (node.floor === startRoom.floor) {
            // node.coords = [lat, lng] formatında
            const nodeLat = node.coords[0];
            const nodeLng = node.coords[1];

            const dx = nodeLat - coordLat;
            const dy = nodeLng - coordLng;
            const distance = Math.sqrt(dx * dx + dy * dy);

            nearbyNodes.push({ nodeId, distance, nodeLat, nodeLng });
          }
        });

        // Mesafeye göre sırala ve en yakın 3'ü al
        nearbyNodes.sort((a, b) => a.distance - b.distance);
        const closestNodes = nearbyNodes.slice(0, 3);

        if (closestNodes.length === 0) {
          setTotalDistance(0);
          setRouteByFloor({});
          setRouteSteps([]);
          return;
        }

        // Koordinat node'unu graph'a ekle
        graph[coordNodeId] = {
          coords: [coordLat, coordLng],
          floor: startRoom.floor,
          neighbors: [],
        };

        // En yakın node'lara çift yönlü bağlantı ekle
        closestNodes.forEach(({ nodeId, distance }) => {
          // Koordinattan node'a
          graph[coordNodeId].neighbors.push({
            to: nodeId,
            weight: distance * 111000, // Derece'den metreye yaklaşık çevrim
            type: 'corridor',
            direction: null,
          });

          // Node'dan koordinata
          graph[nodeId].neighbors.push({
            to: coordNodeId,
            weight: distance * 111000,
            type: 'corridor',
            direction: null,
          });
        });

        startDoorId = coordNodeId;
      } else {
        startDoorId = `f${startRoom.floor}-${startRoom.doorId}`;
      }

      endDoorId = `f${endRoom.floor}-${endRoom.doorId}`;

      // Gelişmiş rotalama algoritmasını kullan
      const { path, targets } = await calculateAdvancedRoute(
        startDoorId,
        endDoorId,
        graph,
        normalizedMode,
        preferredTransport,
        allGeoData,
        placeId, // Yer ID'si gerekli
        skippedWaypoints,
        userFavorites,
        rooms,
        allCampaigns
      );
      
      if (setExploreWaypoints) {
        if (isExploreRouteMode(normalizedMode) && (!targets || targets.length === 0)) {
          const fallbackTargets = buildExploreFallbackTargets();
          setExploreWaypoints(fallbackTargets);
        } else {
          setExploreWaypoints(targets || []);
        }
      }

      if (path.length === 0) {
        setTotalDistance(0);
        setRouteByFloor({});
        setRouteSteps([]);
        return;
      }
      let dist = 0;
      const steps = [];
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i],
          v = path[i + 1];
        const edge = graph[u].neighbors.find(e => e.to === v);
        let stepDistance,
          isFloorChange = false,
          direction = null;
        if (edge) {
          stepDistance = edge.weight;
          direction = edge.direction;
          isFloorChange = edge.type === 'floor-connector-connection';
        } else {
          const uFloor = graph[u]?.floor;
          const vFloor = graph[v]?.floor;
          if (uFloor !== vFloor) {
            stepDistance = 10;
            isFloorChange = true;
            direction = 'floor-change';
          } else {
            console.warn(`Edge bulunamadı: ${u} → ${v}`);
            stepDistance = 0;
          }
        }
        dist += stepDistance;
        steps.push({
          from: u,
          to: v,
          direction,
          distance: stepDistance,
          floorChange: isFloorChange,
        });
      }
      const filteredPath = [path[0]];
      for (let i = 1; i < path.length - 1; i++) {
        if (!shouldSkipStep(steps, i)) filteredPath.push(path[i]);
      }
      if (path.length > 1) filteredPath.push(path[path.length - 1]);
      const routeParts = {};
      filteredPath.forEach(nodeId => {
        const node = graph[nodeId];
        if (node) {
          const floor = node.floor;
          if (!routeParts[floor]) routeParts[floor] = [];
          routeParts[floor].push([...node.coords].reverse());
        }
      });

      console.log(
        '✅ Route calculated, routeParts:',
        Object.keys(routeParts).map(
          f => `Floor ${f}: ${routeParts[f].length} points`
        )
      );

      setRouteByFloor(routeParts);
      setRouteSteps(steps);
      setTotalDistance(dist);
      setSearchQuery('');

      // Adım sayısını kaydetme işlemi kaldırıldı (Manuel butona taşındı)
      if (!routeParts[currentFloor] && startRoom.floor !== currentFloor) {
        console.log(
          `⚠️ Mevcut katta (${currentFloor}) rota yok, başlangıç katına (${startRoom.floor}) geçiliyor`
        );
        changeFloor(startRoom.floor);
      }
      const animationSegments = [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const fromNode = graph[step.from];
        const toNode = graph[step.to];
        if (fromNode && toNode) {
          animationSegments.push({
            fromCoords: [...fromNode.coords].reverse(),
            toCoords: [...toNode.coords].reverse(),
            floor: fromNode.floor,
            distance: step.distance,
          });
        }
      }
      if (animationSegments.length > 0) {
        isAnimationActiveRef.current = true;
        setTimeout(() => {
          animateIconAlongRoute(animationSegments);
        }, 500);
      }

      // Koordinat node'unu graph'tan temizle (tüm işlemler bittikten sonra)
      if (startRoom.isCoordinate && startDoorId.includes('coord-')) {
        // Koordinat node'unun komşularından geri bağlantıları temizle
        if (graph[startDoorId]) {
          graph[startDoorId].neighbors.forEach(neighbor => {
            const neighborNode = graph[neighbor.to];
            if (neighborNode) {
              neighborNode.neighbors = neighborNode.neighbors.filter(
                n => n.to !== startDoorId
              );
            }
          });

          // Koordinat node'unu sil
          delete graph[startDoorId];
        }
      }
    };

    // Async function'ı çağır
    calculateRouteAsync();
  }, [
    selectedStartRoom,
    selectedEndRoom,
    graph,
    routeMode,
    preferredTransport,
    placeId,
    rooms,
    allGeoData,
    currentFloor,
    changeFloor,
    mapRef,
    setTotalDistance,
    setRouteByFloor,
    setRouteSteps,
    setSearchQuery,
    isAnimationActiveRef,
    animationFrameIdRef,
    animateIconAlongRoute,
    setExploreWaypoints,
    skippedWaypoints,
    userFavorites,
  ]);
};
