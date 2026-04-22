// app/kiosk/location/page.jsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import KioskMap from '@/components/Kiosk/KioskMap';
import KioskSearchModal from '@/components/Kiosk/KioskSearchModal';
import KioskRoutePlanner from '@/components/Kiosk/KioskRoutePlanner';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGraphBuilder } from '@/hooks/useGraphBuilder';
import { multiFloorDijkstra } from '@/utils/dijkstra';

function KioskLocationContent() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { buildMultiFloorGraph } = useGraphBuilder();

  // Data and State
  const [allGeoData, setAllGeoData] = useState({});
  const [graphData, setGraphData] = useState({ graph: null, rooms: [] });
  const [placeName, setPlaceName] = useState('');
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [availableFloors, setAvailableFloors] = useState([]);

  // UI State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(true); // Default to open
  const [routePointSelector, setRoutePointSelector] = useState(null); // 'start' or 'end'

  // Routing State
  const [startRoom, setStartRoom] = useState(null);
  const [endRoom, setEndRoom] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  // Data Fetching
  useEffect(() => {
    const slug = searchParams.get('slug') || 'ankamall';
    async function fetchData() {
      try {
        const placeRes = await fetch(`/api/places?slug=${slug}`);
        const placeData = await placeRes.json();
        if (placeData.error) throw new Error(placeData.error);

        setPlaceName(placeData.place);
        setMapCenter(placeData.center);
        setMapZoom(placeData.zoom);

        if (placeData.place_id) {
          const roomsRes = await fetch(
            `/api/rooms?place_id=${placeData.place_id}`
          );
          const roomsData = await roomsRes.json();
          if (roomsData.error) throw new Error(roomsData.error);
          setAllGeoData(roomsData);
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

  // Graph Building
  useEffect(() => {
    if (Object.keys(allGeoData).length > 0) {
      const { graph, rooms } = buildMultiFloorGraph(allGeoData);
      setGraphData({ graph, rooms });
      const floors = Object.keys(allGeoData)
        .map(f => parseInt(f))
        .sort((a, b) => b - a);
      setAvailableFloors(floors);
    }
  }, [allGeoData, buildMultiFloorGraph]);

  // Handlers
  const handleRoomSelect = room => {
    if (routePointSelector === 'start') {
      setStartRoom(room);
    } else {
      setEndRoom(room);
    }
    if (!isRoutePlannerOpen) {
      setIsRoutePlannerOpen(true);
    }
  };

  const handleCalculateRoute = (startId, endId) => {
    if (!graphData.graph) return;
    const pathNodes = multiFloorDijkstra(
      startId,
      endId,
      graphData.graph,
      'escalator',
      allGeoData
    );
    if (pathNodes && pathNodes.length > 0) {
      const pathCoordinates = pathNodes.map(nodeId => {
        const node = graphData.graph[nodeId];
        return { coords: [node.coords[1], node.coords[0]], floor: node.floor };
      });
      setRoutePath(pathCoordinates);
      setStartRoom(graphData.rooms.find(r => r.id === startId));
      setEndRoom(graphData.rooms.find(r => r.id === endId));
      if (pathCoordinates.length > 0) {
        setCurrentFloor(pathCoordinates[0].floor);
      }
    } else {
      console.error('Rota bulunamadı!');
      setRoutePath([]);
    }
  };

  const handleFloorChange = floor => {
    setCurrentFloor(floor);
  };

  // UI State Handlers
  const handleOpenSearchModal = (selector = 'end') => {
    setRoutePointSelector(selector);
    setIsSearchModalOpen(true);
  };
  const handleCloseSearchModal = () => setIsSearchModalOpen(false);

  const handleOpenRoutePlanner = () => setIsRoutePlannerOpen(true);
  const handleCloseRoutePlanner = () => setIsRoutePlannerOpen(false);

  const handleBackToKiosk = () => {
    router.push('/kiosk');
  };

  // Render Logic
  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">
          Harita Yükleniyor...
        </h1>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Basit Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between z-10">
        <button
          onClick={handleBackToKiosk}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">{placeName}</h1>
        <button
          onClick={() => handleOpenSearchModal('end')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Harita Alanı */}
      <div className="flex-grow relative">
        <KioskMap
          allGeoData={allGeoData}
          center={mapCenter}
          zoom={mapZoom}
          startRoom={startRoom}
          endRoom={endRoom}
          routePath={routePath}
          currentFloor={currentFloor}
          onFloorChange={handleFloorChange}
          availableFloors={availableFloors}
        />

        {/* Kat Seçici - Sağ Taraf */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col gap-2">
          {availableFloors.map(floor => (
            <button
              key={floor}
              onClick={() => handleFloorChange(floor)}
              className={`w-14 h-14 rounded-xl font-bold text-lg transition-all shadow-lg ${
                currentFloor === floor
                  ? 'bg-blue-600 text-white scale-110'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {floor === 0 ? 'Z' : floor}
            </button>
          ))}
        </div>
      </div>

      {/* Alt Panel - Rota Oluştur */}
      <div className="bg-white shadow-lg p-4 z-10">
        {routePath.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-bold text-gray-800">Rota Aktif</span>
              </div>
              <button
                onClick={() => {
                  setRoutePath([]);
                  setStartRoom(null);
                  setEndRoom(null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Temizle
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Başlangıç</div>
                <div className="font-semibold text-gray-800 truncate">
                  {startRoom?.name || '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Hedef</div>
                <div className="font-semibold text-gray-800 truncate">
                  {endRoom?.name || '-'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleOpenRoutePlanner}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
          >
            Rota Oluştur
          </button>
        )}
      </div>

      {/* Modals */}
      <KioskSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        onRoomSelect={room => {
          handleRoomSelect(room);
          handleCloseSearchModal();
        }}
        rooms={graphData.rooms}
      />

      <KioskRoutePlanner
        isOpen={isRoutePlannerOpen}
        onClose={handleCloseRoutePlanner}
        onCalculateRoute={handleCalculateRoute}
        startRoom={startRoom}
        endRoom={endRoom}
        onSelectStart={() => handleOpenSearchModal('start')}
        onSelectEnd={() => handleOpenSearchModal('end')}
      />
    </div>
  );
}

export default function KioskLocationPage() {
  return (
    <Suspense fallback={null}>
      <KioskLocationContent />
    </Suspense>
  );
}
