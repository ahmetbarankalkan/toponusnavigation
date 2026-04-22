// components/Discover/Campaigns.jsx
'use client';

export default function Campaigns({ campaignRooms, onRoomSelect }) {
  // Aktif kampanyaları olan mağazaları filtrele
  const activeCampaignRooms = campaignRooms.filter(
    room =>
      room.campaigns &&
      Array.isArray(room.campaigns) &&
      room.campaigns.length > 0
  );

  if (activeCampaignRooms.length === 0) {
    return null;
  }

  return (
    <div className="mb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3.5">
          {/* Icon Circle (Rectangle 18) - Megaphone icon */}
          <div className="w-[25px] h-[25px] bg-[#1B3349] rounded-full flex items-center justify-center">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#D9D9D9"/>
                <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" />
             </svg>
          </div>
          <span className="text-[#1B3349] text-[14px] font-normal tracking-wide">
            Mağaza Kampanyaları
          </span>
        </div>
        {/* Yer Count Badge (Rectangle 18 + 1 Yer) */}
        <div className="border border-[#1B3349] rounded-[20px] px-[10px] h-[22px] shadow-[0px_0px_4px_rgba(0,0,0,0.15)] bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <span className="text-[#1B3349] text-[9px] font-bold tracking-tight font-poppins leading-none">
            {activeCampaignRooms.length} Yer
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {activeCampaignRooms.map((room, index) => {
          const displayCampaign = room.campaigns?.[0];

          return (
            <div
              key={room.id || index}
              onClick={() => onRoomSelect(room)}
              className="relative h-[132px] bg-cover bg-center rounded-[20px] flex items-end justify-between px-[13px] pb-[13px] cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${displayCampaign?.image ? (displayCampaign.image.startsWith('http') || displayCampaign.image.startsWith('/') ? displayCampaign.image : '/' + displayCampaign.image) : 'https://images.unsplash.com/photo-1540959733332-e94e7bf71f0d?q=80&w=2070&auto=format&fit=crop'})`,
              }}
            >
              <div className="absolute top-4 right-4 border border-white rounded-full px-3 h-[24px] bg-transparent flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold font-poppins tracking-wider whitespace-nowrap">
                    {(displayCampaign?.discountPercentage || displayCampaign?.discount_percentage) 
                      ? `%${displayCampaign.discountPercentage || displayCampaign.discount_percentage} İNDİRİM` 
                      : 'FIRSAT'}
                  </span>
              </div>

              {/* Logo Box (Plain text) - Bottom Left */}
              <div className="h-[32px] min-w-[80px] bg-white rounded-[20px] px-5 flex items-center justify-center shadow-lg">
                 <span className="text-black text-[10px] font-bold uppercase font-poppins tracking-widest whitespace-nowrap leading-none">
                    {room.name}
                 </span>
              </div>

              {/* Action Button - Bottom Right */}
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
          );
        })}
      </div>
    </div>
  );
}
