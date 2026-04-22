// components/kiosk/KioskMap.jsx
'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function KioskMap({
  allGeoData,
  center,
  zoom,
  startRoom,
  endRoom,
  routePath,
  onMapLoad,
  currentFloor,
  onFloorChange,
  availableFloors = [],
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Haritayı başlatan ana useEffect
  useEffect(() => {
    if (mapRef.current || !center || center[0] === 0) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:
        'https://api.maptiler.com/maps/basic/style.json?key=c2b5poelsH66NYMBeaq6',
      center: center,
      zoom: zoom,
      minZoom: 16.5,
      maxZoom: 22,
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('🗺️ Harita yüklendi.');
      if (onMapLoad) onMapLoad(map);

      // Rota çizim katmanı için kaynak ekle
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
        },
      });
      map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#14b8a6',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });

      Object.keys(allGeoData).forEach(floor => {
        const floorNum = parseInt(floor);
        const geojson = allGeoData[floorNum];
        if (map.getSource(`floor-source-${floorNum}`)) return;

        map.addSource(`floor-source-${floorNum}`, {
          type: 'geojson',
          data: geojson,
        });
        map.addLayer({
          id: `rooms-floor-${floorNum}`,
          type: 'fill-extrusion',
          source: `floor-source-${floorNum}`,
          layout: {
            visibility: floorNum === currentFloor ? 'visible' : 'none',
          },
          paint: {
            'fill-extrusion-color': '#F5F0FF',
            'fill-extrusion-height': 2,
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.7,
          },
          filter: ['==', ['get', 'type'], 'room'],
        });
        map.addLayer({
          id: `labels-floor-${floorNum}`,
          type: 'symbol',
          source: `floor-source-${floorNum}`,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-anchor': 'center',
            visibility: floorNum === currentFloor ? 'visible' : 'none',
          },
          paint: {
            'text-color': '#333',
            'text-halo-color': 'white',
            'text-halo-width': 1,
          },
          filter: ['==', ['get', 'type'], 'room'],
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [allGeoData, center, zoom]);

  // Kat değiştirme effect'i - currentFloor prop'u değiştiğinde haritayı güncelle
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const map = mapRef.current;

    Object.keys(allGeoData).forEach(floor => {
      const floorNum = parseInt(floor);
      if (map.getLayer(`rooms-floor-${floorNum}`)) {
        map.setLayoutProperty(
          `rooms-floor-${floorNum}`,
          'visibility',
          floorNum === currentFloor ? 'visible' : 'none'
        );
      }
      if (map.getLayer(`labels-floor-${floorNum}`)) {
        map.setLayoutProperty(
          `labels-floor-${floorNum}`,
          'visibility',
          floorNum === currentFloor ? 'visible' : 'none'
        );
      }
    });

    // Rota katmanının görünürlüğünü de ayarla
    if (map.getLayer('route-layer')) {
      map.setFilter('route-layer', ['==', ['get', 'floor'], currentFloor]);
    }
  }, [currentFloor, allGeoData]);

  // Başlangıç ve Bitiş odaları değiştiğinde haritayı güncelle
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const map = mapRef.current;

    const startId = startRoom?.id;
    const endId = endRoom?.id;

    // Vurguları ayarla
    Object.keys(allGeoData).forEach(floor => {
      map.setPaintProperty(
        `rooms-floor-${parseInt(floor)}`,
        'fill-extrusion-color',
        [
          'case',
          ['==', ['get', 'id'], startId],
          '#3b82f6', // Başlangıç: Mavi
          ['==', ['get', 'id'], endId],
          '#10b981', // Bitiş: Yeşil
          '#F5F0FF', // Varsayılan
        ]
      );
    });

    // Eğer sadece bitiş odası seçiliyse (rota yokken) oraya odaklan
    if (endRoom && !startRoom) {
      if (endRoom.floor !== currentFloor && onFloorChange) {
        onFloorChange(endRoom.floor);
      }
      if (endRoom.center)
        map.flyTo({ center: endRoom.center, zoom: 21, duration: 1500 });
    }
  }, [startRoom, endRoom, allGeoData, currentFloor, onFloorChange]);

  // Rota yolu değiştiğinde haritada çiz
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const map = mapRef.current;
    const routeSource = map.getSource('route-source');

    if (routePath && routePath.length > 0) {
      const routeByFloor = routePath.reduce((acc, val) => {
        if (!acc[val.floor]) acc[val.floor] = [];
        acc[val.floor].push(val.coords);
        return acc;
      }, {});

      // Her kat için ayrı bir feature oluştur
      const features = Object.keys(routeByFloor).map(floor => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeByFloor[floor],
        },
        properties: {
          floor: parseInt(floor),
        },
      }));

      routeSource.setData({
        type: 'FeatureCollection',
        features: features,
      });

      // Haritayı rotaya sığdır
      const bounds = new maplibregl.LngLatBounds();
      routePath.forEach(p => bounds.extend(p.coords));
      map.fitBounds(bounds, { padding: 100, duration: 1500 });
    } else {
      // Rotayı temizle
      routeSource.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [] },
      });
    }
  }, [routePath]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
