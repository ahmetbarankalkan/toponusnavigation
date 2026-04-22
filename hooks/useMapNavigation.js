'use client';

import { useCallback, useRef } from 'react';
import { multiFloorDijkstra, calculatePathDistance } from '../utils/dijkstra.js';

export function useMapNavigation() {
  const animationFrameIdRef = useRef(null);
  const isAnimationActiveRef = useRef(false);

  // İkonu rota boyunca hareket ettiren animasyon fonksiyonu
  const animateIconAlongRoute = useCallback(
    (path, currentFloor, mapRef) => {
      const map = mapRef.current;
      if (!map || !path || path.length === 0 || !isAnimationActiveRef.current)
        return;

      // Önceki animasyonu iptal et
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      let step = 0;
      let segmentStartTime = 0;
      let segmentIndex = 0;
      const speed = 15; // metre/saniye

      const animationStep = currentTime => {
        if (segmentStartTime === 0) {
          segmentStartTime = currentTime;
        }

        const elapsedTime = (currentTime - segmentStartTime) / 1000; // saniye

        const currentSegment = path[segmentIndex];
        if (!currentSegment) {
          // Animasyon bitti, ikonu temizle ve başa dön
          if (!isAnimationActiveRef.current) return; // Animasyon iptal edildiyse durma
          map.getSource('animation-icon-source').setData({
            type: 'FeatureCollection',
            features: [],
          });
          setTimeout(() => {
            if (isAnimationActiveRef.current) {
              animateIconAlongRoute(path, currentFloor, mapRef);
            }
          }, 2000); // 2 saniye sonra tekrar başlat
          return;
        }

        // Kat değişikliği kontrolü - Farklı kattaysa bu segmenti atla
        if (currentSegment.floor !== currentFloor) {
          segmentIndex++;
          segmentStartTime = 0;
          animationFrameIdRef.current = requestAnimationFrame(animationStep);
          return;
        }

        const segmentDistance = currentSegment.distance;
        const segmentDuration = (segmentDistance / speed) * 1000; // milisaniye

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
        map.getSource('animation-icon-source').setData(iconData);

        if (progress >= 1) {
          segmentIndex++;
          segmentStartTime = 0; // Reset for next segment
        }

        animationFrameIdRef.current = requestAnimationFrame(animationStep);
      };

      animationFrameIdRef.current = requestAnimationFrame(animationStep);
    },
    []
  );

  // Bearing hesaplama fonksiyonu
  const calculateBearing = useCallback((lat1, lon1, lat2, lon2) => {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(deltaLon) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLon);

    return (Math.atan2(y, x) * 180) / Math.PI;
  }, []);

  const fitMapToPath = useCallback((coords, mapRef) => {
    const map = mapRef.current;
    if (!map || !coords || coords.length < 2) return;

    const bounds = coords.reduce(
      (bounds, coord) => {
        return [
          [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
          [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
        ];
      },
      [
        [coords[0][0], coords[0][1]],
        [coords[0][0], coords[0][1]],
      ]
    );

    map.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
      maxZoom: 20,
      duration: 1000,
    });
  }, []);

  // Basit ve güvenilir path çizim fonksiyonu
  const drawPathSafely = useCallback(
    (coords, mapRef) => {
      const map = mapRef.current;
      if (!map || !coords || coords.length < 2) return;

      try {
        // Path source'u güncelle
        if (map.getSource('path')) {
          map.getSource('path').setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords,
            },
          });
        }

        // Arrow'ları çiz
        const arrows = [];
        for (let i = 0; i < coords.length - 1; i += 3) {
          const start = coords[i];
          const end = coords[i + 1] || coords[coords.length - 1];
          const bearing = calculateBearing(start[1], start[0], end[1], end[0]);

          arrows.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: start,
            },
            properties: {
              bearing: bearing,
            },
          });
        }

        if (map.getSource('path-arrows')) {
          map.getSource('path-arrows').setData({
            type: 'FeatureCollection',
            features: arrows,
          });
        }

        // Haritayı path'e fit et
        fitMapToPath(coords, mapRef);
      } catch (error) {
        console.error('Path çizim hatası:', error);
      }
    },
    [calculateBearing, fitMapToPath]
  );

  // Animasyon kontrolü
  const startAnimation = () => {
    isAnimationActiveRef.current = true;
  };

  const stopAnimation = () => {
    isAnimationActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  return {
    animateIconAlongRoute,
    calculateBearing,
    fitMapToPath,
    drawPathSafely,
    startAnimation,
    stopAnimation,
  };
}