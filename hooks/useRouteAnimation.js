import { useCallback, useRef } from 'react';

/**
 * Rota animasyonu için custom hook
 */
export const useRouteAnimation = ({ mapRef, currentFloor }) => {
  const animationFrameIdRef = useRef(null);
  const isAnimationActiveRef = useRef(false);

  const animateIconAlongRoute = useCallback(
    path => {
      const map = mapRef.current;
      if (!map || !path || path.length === 0 || !isAnimationActiveRef.current)
        return;
      if (!map.getSource('animation-icon-source')) {
        console.warn('Animation source not ready, skipping animation');
        isAnimationActiveRef.current = false;
        return;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      let segmentStartTime = 0;
      let segmentIndex = 0;
      const speed = 15;
      const animationStep = currentTime => {
        // GÜVENLİK KONTROLÜ: map veya aktiflik durumu yoksa durdur
        const currentMap = mapRef.current;
        if (!currentMap || !isAnimationActiveRef.current) {
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
          }
          return;
        }

        if (segmentStartTime === 0) {
          segmentStartTime = currentTime;
        }
        const elapsedTime = (currentTime - segmentStartTime) / 1000;
        const currentSegment = path[segmentIndex];
        if (!currentSegment) {
          const animationSource = currentMap.getSource('animation-icon-source');
          if (animationSource) {
            animationSource.setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
          setTimeout(() => {
            if (isAnimationActiveRef.current) {
              animateIconAlongRoute(path);
            }
          }, 2000);
          return;
        }
        if (currentSegment.floor !== currentFloor) {
          segmentIndex++;
          segmentStartTime = 0;
          animationFrameIdRef.current = requestAnimationFrame(animationStep);
          return;
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
        if (!animationSource) {
          console.warn('Animation source not found, stopping animation');
          isAnimationActiveRef.current = false;
          return;
        }
        animationSource.setData(iconData);
        if (progress >= 1) {
          segmentIndex++;
          segmentStartTime = 0;
        }
        animationFrameIdRef.current = requestAnimationFrame(animationStep);
      };
      animationFrameIdRef.current = requestAnimationFrame(animationStep);
    },
    [currentFloor]
  );

  const stopAnimation = useCallback(() => {
    isAnimationActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    isAnimationActiveRef.current = true;
  }, []);

  return {
    animateIconAlongRoute,
    stopAnimation,
    startAnimation,
    isAnimationActiveRef,
    animationFrameIdRef,
  };
};
