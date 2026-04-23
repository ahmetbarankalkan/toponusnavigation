import { useCallback, useRef } from 'react';

/**
 * Rota animasyonu için custom hook
 */
export const useRouteAnimation = ({ mapRef, currentFloor, changeFloor }) => {
  const animationFrameIdRef = useRef(null);
  const isAnimationActiveRef = useRef(false);
  const segmentIndexRef = useRef(0);
  const segmentStartTimeRef = useRef(0);
  const currentPathRef = useRef([]);

  const animateIconAlongRoute = useCallback(
    path => {
      const map = mapRef.current;
      if (!map || !path || path.length === 0) return;
      
      // Her yeni yol geldiğinde veya manuel başlatıldığında state'i sıfırla
      // Sadece yolun uzunluğu veya ilk/son noktası değişmişse gerçek bir değişim kabul et
      const isNewPath = !currentPathRef.current || 
                        path.length !== currentPathRef.current.length ||
                        (path.length > 0 && (
                          path[0].fromCoords[0] !== currentPathRef.current[0].fromCoords[0] ||
                          path[path.length-1].toCoords[0] !== currentPathRef.current[currentPathRef.current.length-1].toCoords[0]
                        ));

      if (isNewPath) {
        currentPathRef.current = path;
        segmentIndexRef.current = 0;
        segmentStartTimeRef.current = 0;
      }

      if (!isAnimationActiveRef.current) return;

      if (!map.getSource('animation-icon-source')) {
        console.warn('Animation source not ready, skipping animation');
        return;
      }

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      const speed = 15;
      
      const animationStep = currentTime => {
        const currentMap = mapRef.current;
        if (!currentMap || !isAnimationActiveRef.current) return;

        if (segmentStartTimeRef.current === 0) {
          segmentStartTimeRef.current = currentTime;
        }

        const elapsedTime = (currentTime - segmentStartTimeRef.current) / 1000;
        const currentSegment = path[segmentIndexRef.current];

        // Rota bitti
        if (!currentSegment) {
          const animationSource = currentMap.getSource('animation-icon-source');
          if (animationSource) {
            animationSource.setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
          
          // Başa dön ve tekrarla
          setTimeout(() => {
            if (isAnimationActiveRef.current) {
              segmentIndexRef.current = 0;
              segmentStartTimeRef.current = 0;
              animateIconAlongRoute(path);
            }
          }, 2000);
          return;
        }

        // KAT DEĞİŞİMİ KONTROLÜ
        if (currentSegment.floor !== currentFloor) {
          if (changeFloor) {
            changeFloor(currentSegment.floor);
            return; 
          } else {
            // changeFloor yoksa atla
            segmentIndexRef.current++;
            segmentStartTimeRef.current = 0;
            animationFrameIdRef.current = requestAnimationFrame(animationStep);
            return;
          }
        }

        const segmentDistance = currentSegment.distance;
        const segmentDuration = (segmentDistance / speed) * 1000;
        const progress = Math.min((elapsedTime * 1000) / segmentDuration, 1);
        
        const startPoint = currentSegment.fromCoords;
        const endPoint = currentSegment.toCoords;
        const newLng = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const newLat = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;

        const iconData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [newLng, newLat],
              },
              properties: {},
            },
          ],
        };

        const animationSource = currentMap.getSource('animation-icon-source');
        if (animationSource) {
          animationSource.setData(iconData);
        }

        if (progress >= 1) {
          segmentIndexRef.current++;
          segmentStartTimeRef.current = 0;
        }

        animationFrameIdRef.current = requestAnimationFrame(animationStep);
      };

      animationFrameIdRef.current = requestAnimationFrame(animationStep);
    },
    [currentFloor, changeFloor, mapRef]
  );

  const stopAnimation = useCallback(() => {
    isAnimationActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    // İkonu temizle
    if (mapRef.current) {
      const source = mapRef.current.getSource('animation-icon-source');
      if (source) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [mapRef]);

  const startAnimation = useCallback((path) => {
    isAnimationActiveRef.current = true;
    if (path) {
      animateIconAlongRoute(path);
    }
  }, [animateIconAlongRoute]);

  return {
    animateIconAlongRoute,
    stopAnimation,
    startAnimation,
    isAnimationActiveRef,
    animationFrameIdRef,
  };
};
