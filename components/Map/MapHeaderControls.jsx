import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import FloorSelector from '@/components/UI/FloorSelector';
import RouteSelector from '@/components/Search/RouteSelector';

const MapHeaderControls = ({
  isDiscoverOpen,
  isSelectingStartRoom,
  routeSteps,
  routeMode,
  setRouteMode,
  startQuery,
  setStartQuery,
  setShowStartDropdown,
  setIsAssistantOpen,
  showStartDropdown,
  rooms,
  setSelectedStartRoom,
  setActiveNavItem,
  setIsCardMinimized,
  handleFinish,
  endQuery,
  setEndQuery,
  setShowEndDropdown,
  showEndDropdown,
  setSelectedEndRoom,
  isFloorPanelOpen,
  setIsFloorPanelOpen,
  changeFloor,
  currentFloor,
  floors,
  isKioskMode,
  selectedStartRoom,

  selectedEndRoom,
  mapView,
  setMapView,
}) => {
  const handleSwap = () => {
    // Başlangıç ve hedef noktalarını değiştir
    const tempStartRoom = selectedStartRoom;
    const tempStartQuery = startQuery;
    setSelectedStartRoom(selectedEndRoom);
    setStartQuery(endQuery);
    setSelectedEndRoom(tempStartRoom);
    setEndQuery(tempStartQuery);
  };
  return (
    <>
      {/* RouteSelector - QuickAccessButtons'ın altında, ortada */}
      {(isSelectingStartRoom || routeSteps.length > 0) && (
        <div
          className={`absolute left-[55%] -translate-x-1/2 transition-all duration-300 mt-8 sm:mt-10 ${
            isDiscoverOpen ? 'z-[50]' : 'z-[110]'
          }`}
          style={{
            top: 'max(6rem, calc(env(safe-area-inset-top) + 5rem))',
          }}
        >
          <RouteSelector
            routeMode={routeMode}
            onRouteModeChange={setRouteMode}
            onClose={handleFinish}
            onSwap={handleSwap}
            startLocation={startQuery}
            endLocation={endQuery}
          />
        </div>
      )}

      {/* Kat Seçici - Sol üstte */}
      <div
        className={`absolute left-4 transition-all duration-300 ${
          isDiscoverOpen ? 'z-[50]' : 'z-[110]'
        }`}
        style={{ top: 'max(6rem, calc(env(safe-area-inset-top) + 5rem))' }}
      >
        <FloorSelector
          floors={floors}
          currentFloor={currentFloor}
          isOpen={isFloorPanelOpen}
          onToggle={() => setIsFloorPanelOpen(!isFloorPanelOpen)}
          onFloorChange={floor => changeFloor(parseInt(floor))}
          isDiscoverOpen={isDiscoverOpen}
          mapView={mapView}
          setMapView={setMapView}
        />
      </div>

      {/* Kioska Dön Butonu - Sadece kiosk modda göster */}
      {isKioskMode && (
        <button
          onClick={() => (window.location.href = '/kiosk')}
          className="fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Kioska Dön</span>
        </button>
      )}
    </>
  );
};

export default MapHeaderControls;
