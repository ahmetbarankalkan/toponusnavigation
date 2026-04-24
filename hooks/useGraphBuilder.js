import { useCallback } from 'react';

export const useGraphBuilder = () => {
  const buildMultiFloorGraph = useCallback(floorData => {
    const graph = {};
    const rooms = [];
    const doors = [];
    const allStores = new Set();

    // Helper function for reversing directions
    const reverseDirection = direction => {
      const opposites = {
        north: 'south',
        south: 'north',
        east: 'west',
        west: 'east',
        northeast: 'southwest',
        northwest: 'southeast',
        southeast: 'northwest',
        southwest: 'northeast',
      };
      return opposites[direction] || direction;
    };
    Object.entries(floorData).forEach(([floor, data]) => {
      const floorPrefix = `f${floor}`;
      if (!data || !data.features) return;
      data.features.forEach(({ geometry, properties }) => {
        if (
          properties.type === 'room' &&
          properties.name &&
          properties.name.trim() !== ''
        ) {
          allStores.add(properties.name);
        }
        const {
          type,
          id,
          connector,
          connector_type,
          direction,
          room: roomId,
        } = properties;
        if (!geometry || geometry.type !== 'Point') {
          return;
        }
        if (geometry.type === 'Point') {
          const [lon, lat] = geometry.coordinates;
          const namespacedId = `${floorPrefix}-${id}`;
          if (
            type === 'door-node' ||
            type === 'corridor-node' ||
            type === 'floor-connector-node'
          ) {
            graph[namespacedId] = {
              coords: [lat, lon],
              neighbors: [],
              floor: parseInt(floor),
              originalId: id,
              type: type,
              direction: direction || null,
              baseName: connector,
              connector_type: connector_type || null,
            };
            if (type === 'door-node') {
              doors.push({
                id: namespacedId,
                coords: [lat, lon],
                roomId: `${floorPrefix}-${roomId}`,
                floor: parseInt(floor),
                originalId: id,
              });
            }
          }
        }
      });
      if (!data || !data.features) return;
      data.features.forEach(({ properties }) => {
        const { type, from, to, weight, direction } = properties;
        const namespacedFrom = `${floorPrefix}-${from}`;
        const namespacedTo = `${floorPrefix}-${to}`;
        if (
          (type === 'corridor-edge' || type === 'door-connection') &&
          graph[namespacedFrom] &&
          graph[namespacedTo]
        ) {
          graph[namespacedFrom].neighbors.push({
            to: namespacedTo,
            weight,
            direction,
            type,
          });
          graph[namespacedTo].neighbors.push({
            to: namespacedFrom,
            weight,
            direction: reverseDirection(direction),
            type,
          });
        }
      });
      if (!data || !data.features) return;
      data.features.forEach(({ properties, geometry }) => {
        if (properties.type === 'room') {
          const doorObj = doors.find(
            d => d.roomId === `${floorPrefix}-${properties.id}`
          );
          let roomCoordinates = null;
          if (
            geometry &&
            geometry.type === 'Polygon' &&
            geometry.coordinates &&
            geometry.coordinates[0]
          ) {
            const coords = geometry.coordinates[0];
            const sumLon = coords.reduce((sum, coord) => sum + coord[0], 0);
            const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
            roomCoordinates = [sumLon / coords.length, sumLat / coords.length];
          }
          let parsedCampaigns = [];
          if (properties.campaigns) {
            if (Array.isArray(properties.campaigns)) {
              parsedCampaigns = properties.campaigns;
            } else if (typeof properties.campaigns === 'string') {
              try {
                const parsed = JSON.parse(properties.campaigns);
                parsedCampaigns = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.warn(
                  `⚠️ Campaign parse hatası (${properties.name}):`,
                  e
                );
                parsedCampaigns = [];
              }
            }
          }
          let popularCampaign = properties.popular_campaign || null;
          let productCampaigns = properties.product_campaigns || [];

          // Fallback for content object if still used
          if (!popularCampaign && properties.content) {
            try {
              const content = typeof properties.content === 'string' ? JSON.parse(properties.content) : properties.content;
              popularCampaign = content.popular_campaign || null;
              if (productCampaigns.length === 0) productCampaigns = content.product_campaigns || [];
            } catch (e) {}
          }
          const roomData = {
            id: `${floorPrefix}-${properties.id}`,
            name: properties.name,
            logo: properties.logo || null,
            doorId: doorObj?.originalId || null,
            floor: parseInt(floor),
            originalId: properties.id,
            coordinates: roomCoordinates,
            is_special: properties.is_special || false,
            special_type: properties.special_type || null,
            category: properties.category || 'general',
            subtype: properties.subtype || null,
            icon: properties.icon || null,
            display_name: properties.name,
            gender: properties.gender || null,
            priority: properties.priority || null,
            description: properties.description || null,
            phone: properties.phone || null,
            hours: properties.hours || null,
            promotion: properties.promotion || null,
            website: properties.website || null,
            email: properties.email || null,
            instagram: properties.instagram || null,
            twitter: properties.twitter || null,
            services: properties.services || null,
            tags: properties.tags || null,
            header_image: properties.header_image || null,
            campaigns: parsedCampaigns,
            popular_campaign: popularCampaign,
            product_campaigns: productCampaigns,
          };
          if (
            popularCampaign ||
            productCampaigns.length > 0 ||
            parsedCampaigns.length > 0
          ) {
            console.log(`🎁 ${properties.name} kampanyaları:`, {
              popular: popularCampaign ? '✅' : '❌',
              products: productCampaigns.length,
              regular: parsedCampaigns.length,
            });
          }
          rooms.push(roomData);
        }
      });
    });
    console.log(
      "🔗 Floor connector'ların corridor'lara bağlantısı kuruluyor..."
    );
    Object.entries(floorData).forEach(([floor, data]) => {
      if (!data || !data.features) {
        console.warn(`⚠️ Floor ${floor} data or features is missing.`);
        return;
      }
      console.log(
        `🔗 Floor ${floor} için connector bağlantıları kontrol ediliyor...`
      );
      const connectorEdges = data.features.filter(
        feature => feature.properties.type === 'floor-connector-connection'
      );
      console.log(
        `📍 Floor ${floor} - Connector edges bulundu: ${connectorEdges.length} adet`
      );
      connectorEdges.forEach(edge => {
        const { from, to, direction, weight } = edge.properties;
        const namespacedFrom = `f${floor}-${from}`;
        const namespacedTo = `f${floor}-${to}`;
        if (graph[namespacedFrom] && graph[namespacedTo]) {
          console.log(
            `✅ Floor ${floor} - Edge bulundu: ${namespacedFrom} → ${namespacedTo} (${direction})`
          );
          graph[namespacedFrom].neighbors.push({
            to: namespacedTo,
            weight,
            direction,
            type: 'floor-connector-connection',
          });
          graph[namespacedTo].neighbors.push({
            to: namespacedFrom,
            weight,
            direction: reverseDirection(direction),
            type: 'floor-connector-connection',
          });
        } else {
          console.warn(
            `❌ Floor ${floor} - Edge node'ları bulunamadı: ${namespacedFrom} veya ${namespacedTo}`
          );
        }
      });
    });
    const storeList = Array.from(allStores).sort();
    console.log('🏗️ Multi-floor graph oluşturuldu:', {
      totalNodes: Object.keys(graph).length,
      rooms: rooms.length,
      doors: doors.length,
      stores: storeList.length,
    });

    return { graph, rooms, doors, storeList };
  }, []);

  return { buildMultiFloorGraph };
};
