// components/kiosk/DiscoverSection.jsx
'use client';

import PopularPlaces from '@/components/Discover/PopularPlaces';
import Campaigns from '@/components/Discover/Campaigns';

export default function DiscoverSection({ rooms, onRoomSelect }) {
  // Campaigns komponenti 'campaignRooms' prop'u bekliyor.
  // PopularPlaces komponenti 'rooms' prop'u bekliyor.
  // İkisi de aynı temel veri yapısını kullanıyor, bu yüzden rooms'u ikisine de geçebiliriz.
  const campaignRooms = rooms.filter(
    room =>
      room.campaigns &&
      Array.isArray(room.campaigns) &&
      room.campaigns.length > 0
  );

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full bg-gradient-to-b from-white to-gray-50/50">
      {/* Popüler Yerler */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <PopularPlaces rooms={rooms} onRoomSelect={onRoomSelect} />
      </div>

      {/* Kampanyalar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <Campaigns campaignRooms={campaignRooms} onRoomSelect={onRoomSelect} />
      </div>
    </div>
  );
}
