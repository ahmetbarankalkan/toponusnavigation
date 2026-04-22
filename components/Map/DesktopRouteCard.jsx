'use client';

import RouteCard from '@/components/Route/RouteCard';

export default function DesktopRouteCard({
  routeSteps,
  selectedEndRoom,
  rooms,
  totalDistance,
  getInstruction,
  handleFinish,
  handlePreviousFloor,
  handleNextFloor,
  routeByFloor,
  currentFloor,
  selectedStartRoom,
}) {
  if (routeSteps.length === 0) return null;

  return (
    <div className="hidden md:block absolute bottom-4 left-24 max-w-sm min-w-[380px] z-30">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] border-2 border-transparent bg-clip-padding p-[8px] min-h-[190px] relative">
        <div className="absolute inset-0 rounded-[20px] p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 -z-10" style={{maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor'}}></div>
        <RouteCard
          selectedEndRoom={selectedEndRoom}
          rooms={rooms}
          totalDistance={totalDistance}
          routeSteps={routeSteps}
          getInstruction={getInstruction}
          handleFinish={handleFinish}
          handlePreviousFloor={handlePreviousFloor}
          handleNextFloor={handleNextFloor}
          routeByFloor={routeByFloor}
          currentFloor={currentFloor}
          selectedStartRoom={selectedStartRoom}
          isMobile={false}
        />
      </div>
    </div>
  );
}
