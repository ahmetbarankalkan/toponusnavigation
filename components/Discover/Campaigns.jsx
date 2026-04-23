'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Campaigns({ campaignRooms, onRoomSelect }) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFav, setLoadingFav] = useState({});

  // Favorileri yükle
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchFavorites = async () => {
        try {
          const token = localStorage.getItem('user_token');
          const res = await fetch('/api/favorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setFavorites(data.campaigns || []);
          }
        } catch (err) {
          console.error('Favori yükleme hatası:', err);
        }
      };
      fetchFavorites();
    }
  }, [isAuthenticated, user]);

  const handleFavoriteToggle = async (e, campaign, room) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Favorilere eklemek için lütfen giriş yapın.');
      return;
    }

    const campaignId = campaign._id || campaign.id;
    setLoadingFav(prev => ({ ...prev, [campaignId]: true }));

    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: campaignId,
          storeName: room.name,
          type: 'campaign',
          roomData: {
            id: room.id,
            name: room.name,
            floor: room.floor,
            header_image: room.header_image || room.logo,
            rating: room.rating
          },
          campaignData: {
            title: campaign.title,
            image: campaign.image,
            discountPercentage: campaign.discountPercentage || campaign.discount_percentage
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFavorites(data.campaigns || []);
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
    } finally {
      setLoadingFav(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const isCampaignFavorite = (campaignId) => {
    return favorites.some(f => f.campaignId === campaignId || f.storeId === campaignId);
  };

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
    <div className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-[25px] h-[25px] bg-[#1B3349] rounded-full flex items-center justify-center">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#D9D9D9"/>
                <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" />
             </svg>
          </div>
          <span className="text-[#1B3349] text-[14px] font-bold font-poppins">
            Mağaza Kampanyaları
          </span>
        </div>
        <div className="border border-[#1B3349] rounded-[20px] px-[10px] h-[22px] shadow-[0px_0px_4px_rgba(0,0,0,0.15)] bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <span className="text-[#1B3349] text-[9px] font-bold tracking-tight font-poppins leading-none">
            {activeCampaignRooms.length} Yer
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {activeCampaignRooms.map((room, index) => {
          const displayCampaign = room.campaigns?.[0];
          const campaignId = displayCampaign?._id || displayCampaign?.id;
          const isFav = isCampaignFavorite(campaignId);

          return (
            <div
              key={room.id || index}
              onClick={() => onRoomSelect(room)}
              className="relative h-[132px] bg-cover bg-center rounded-[20px] flex items-end justify-between px-[13px] pb-[13px] cursor-pointer transition-all hover:scale-[1.01] shadow-md border border-black/5"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${displayCampaign?.image ? (displayCampaign.image.startsWith('http') || displayCampaign.image.startsWith('/') ? displayCampaign.image : '/' + displayCampaign.image) : 'https://images.unsplash.com/photo-1540959733332-e94e7bf71f0d?q=80&w=2070&auto=format&fit=crop'})`,
              }}
            >
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="border border-white/80 rounded-full px-3 h-[24px] bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold font-poppins tracking-wider whitespace-nowrap">
                      {(displayCampaign?.discountPercentage || displayCampaign?.discount_percentage) 
                        ? `%${displayCampaign.discountPercentage || displayCampaign.discount_percentage} İNDİRİM` 
                        : 'FIRSAT'}
                    </span>
                </div>

                <button
                  onClick={(e) => handleFavoriteToggle(e, displayCampaign, room)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isFav ? 'bg-white shadow-lg' : 'bg-white/90 hover:bg-white shadow-md'
                  } ${loadingFav[campaignId] ? 'animate-pulse' : ''}`}
                >
                  <Heart 
                    size={16} 
                    className={`transition-colors ${
                      isFav ? 'text-[#1B3349] fill-[#1B3349]' : 'text-[#1B3349]'
                    }`}
                  />
                </button>
              </div>

              {/* Logo Box (Plain text) - Bottom Left */}
              <div className="h-[32px] min-w-[80px] bg-white rounded-[20px] px-5 flex items-center justify-center shadow-lg border border-black/5">
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
                className="h-[32px] bg-white text-black rounded-[20px] px-5 flex items-center justify-center font-bold text-[9px] hover:bg-gray-100 transition-all shadow-lg font-poppins uppercase tracking-wide leading-none border border-black/5"
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
