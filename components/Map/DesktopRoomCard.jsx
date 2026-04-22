'use client';

import RoomCard from '@/components/Room/RoomCard';

export default function DesktopRoomCard({
  selectedEndRoom,
  rooms,
  isSelectingStartRoom,
  onClose,
  onGetDirections,
}) {
  if (!selectedEndRoom) return null;

  return (
    <div className="hidden md:block absolute bottom-4 left-16 max-w-md min-w-[420px] z-40">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <RoomCard
          selectedEndRoom={selectedEndRoom}
          rooms={rooms}
          isSelectingStartRoom={isSelectingStartRoom}
          onClose={onClose}
          onGetDirections={onGetDirections}
          isMobile={false}
        />
      </div>
    </div>
  );
}
