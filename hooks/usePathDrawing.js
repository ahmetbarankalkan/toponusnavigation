import { useCallback } from 'react';

export const usePathDrawing = ({ mapRef, fitMapToPath }) => {
  const calculateBearing = useCallback((lat1, lon1, lat2, lon2) => {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dlambda = ((lon2 - lon1) * Math.PI) / 180;
    const x = Math.sin(dlambda) * Math.cos(phi2);
    const y =
      Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(dlambda);
    const bearing = (Math.atan2(x, y) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }, []);

  const drawPathSafely = useCallback(
    coords => {
      const map = mapRef.current;
      if (!map) {
        console.log('No map reference');
        return;
      }
      if (!map.isStyleLoaded()) {
        console.log('Map style not loaded, retrying...');
        setTimeout(() => drawPathSafely(coords), 50);
        return;
      }
      if (!coords || coords.length === 0) {
        console.log('🧹 Empty coordinates, clearing path AND arrows');
        try {
          if (map.getSource('path')) {
            map.getSource('path').setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: [] },
            });
          }
          if (map.getSource('path-arrows')) {
            map.getSource('path-arrows').setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
        } catch (error) {
          console.error('Error clearing path/arrows:', error);
        }
        return;
      }
      console.log(`🎯 Drawing path with ${coords.length} points`);
      try {
        // Safari için requestAnimationFrame kullan - daha hızlı render
        requestAnimationFrame(() => {
          const geo = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
          };
          if (map.getSource('path')) {
            map.getSource('path').setData(geo);
          } else {
            map.addSource('path', { type: 'geojson', data: geo });
            map.addLayer({
              id: 'path-line',
              type: 'line',
              source: 'path',
              paint: {
                'line-color': '#00334E',
                'line-width': 8,
              },
            });
          }

          // Ok işaretlerini ayrı bir frame'de çiz (Safari performansı için)
          requestAnimationFrame(() => {
            if (coords.length > 1) {
              const arrowPoints = [];
              for (let i = 3; i < coords.length; i += 3) {
                const current = coords[i];
                const previous = coords[i - 1];
                const bearing = calculateBearing(
                  previous[1],
                  previous[0],
                  current[1],
                  current[0]
                );
                arrowPoints.push({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: current },
                  properties: { bearing: bearing },
                });
              }
              const arrowGeo = {
                type: 'FeatureCollection',
                features: arrowPoints,
              };
              if (map.getSource('path-arrows')) {
                map.getSource('path-arrows').setData(arrowGeo);
              } else {
                map.addSource('path-arrows', {
                  type: 'geojson',
                  data: arrowGeo,
                });
                map.addLayer({
                  id: 'path-arrows',
                  type: 'symbol',
                  source: 'path-arrows',
                  layout: {
                    'icon-image': 'custom-arrow',
                    'icon-size': 0.4,
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': false,
                    'icon-ignore-placement': false,
                    'icon-padding': 5,
                  },
                });
              }
            } else {
              if (map.getSource('path-arrows')) {
                map.getSource('path-arrows').setData({
                  type: 'FeatureCollection',
                  features: [],
                });
              }
            }

            console.log('✅ Path drawn from drawPathSafely');
            if (map.getLayer('animation-icon-layer')) {
              map.moveLayer('animation-icon-layer');
            }
            if (coords && coords.length > 1) {
              fitMapToPath(mapRef.current, coords);
            }
          });
        });
      } catch (error) {
        console.error('❌ Path drawing error:', error);
      }
    },
    [fitMapToPath, calculateBearing, mapRef]
  );

  return { drawPathSafely, calculateBearing };
};
