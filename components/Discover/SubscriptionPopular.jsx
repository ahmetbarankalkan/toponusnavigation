'use client';

import { Star, MapPin } from 'lucide-react';

export default function SubscriptionPopular({ popularRooms, onRoomSelect }) {
  if (popularRooms.length === 0) {
    return null;
  }

  return (
    <div className="mb-0">
      {/* Header (Frame 54 style) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3.5">
          {/* Icon Circle */}
          <div className="w-[25px] h-[25px] bg-[#1B3349] rounded-full flex items-center justify-center">
             <Star size={13} className="text-[#D9D9D9]" fill="#D9D9D9" />
          </div>
          <h3 className="text-[#1B3349] text-[15px] font-bold font-poppins">Popüler Mağazalar</h3>
        </div>
        {/* Yer Count Badge */}
        <div className="border border-[#1B3349] rounded-[20px] px-[10px] h-[22px] shadow-[0px_0px_4px_rgba(0,0,0,0.15)] bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <span className="text-[#1B3349] text-[9px] font-bold tracking-tight font-poppins leading-none">
            {popularRooms.length} Yer
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {popularRooms.map((room) => (
            <div
              key={room.id}
              className="relative h-[132px] w-full rounded-[20px] overflow-hidden group cursor-pointer flex items-end justify-between px-[13px] pb-[13px] transition-transform active:scale-[0.98]"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${room.popular_campaign?.image ? (room.popular_campaign.image.startsWith('http') || room.popular_campaign.image.startsWith('/') ? room.popular_campaign.image : '/' + room.popular_campaign.image) : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              onClick={() => onRoomSelect(room)}
            >
              {/* Status Badge (Top Right) - White stroke, no fill */}
              <div className="absolute top-4 right-4 border border-white rounded-full px-3 h-[24px] bg-transparent flex items-center justify-center">
                 <span className="text-white text-[8px] font-bold font-poppins tracking-wider whitespace-nowrap uppercase">
                    {room.popular_campaign?.title || 'POPÜLER'}
                 </span>
              </div>

              {/* Logo Box (Plain text) */}
              <div className="h-[32px] min-w-[80px] bg-white rounded-[20px] px-5 flex items-center justify-center shadow-lg">
                <span className="text-black text-[10px] font-bold uppercase font-poppins tracking-widest leading-none">
                  {room.name}
                </span>
              </div>

              {/* Styled Navigate Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRoomSelect(room);
                }}
                className="h-[32px] bg-white text-black rounded-[20px] px-5 flex items-center justify-center font-bold text-[9px] hover:bg-gray-100 transition-all shadow-lg font-poppins uppercase tracking-wide leading-none"
              >
                YOL TARİFİ AL
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}
