'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import SubscriptionPopular from '@/components/Discover/SubscriptionPopular';
import Campaigns from '@/components/Discover/Campaigns';
import ProductCampaigns from '@/components/Discover/ProductCampaigns';
import AssistantDiscover from '@/components/Discover/AssistantDiscover';

export default function DiscoverModal({
  isOpen,
  onClose,
  placeName,
  discoverHeight,
  setDiscoverHeight,
  rooms,
  placeId,
  onRoomSelect,
  onAssistantOpen,
}) {
  const [enrichedRooms, setEnrichedRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Verileri direkt props'tan al (API zaten zenginleştirilmiş veri gönderiyor)
  useEffect(() => {
    if (!isOpen || !rooms) return;
    setEnrichedRooms(rooms);
  }, [isOpen, rooms]);

  if (!isOpen) return null;

  const handleClose = () => {
    setDiscoverHeight(50); // Modal kapanınca height'i sıfırla
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-[70] rounded-t-[30px] animate-in slide-in-from-bottom duration-300 flex flex-col touch-pan-y shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
        style={{
          bottom: 0,
          height: `${discoverHeight}vh`,
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          paddingBottom: '80px',
          background: '#EAEAEA',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-[90] w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
              fill="#32475A"
            />
          </svg>
        </button>

        {/* Drag Handle - Hidden */}
        <div
          className="w-full py-2 flex justify-center cursor-grab active:cursor-grabbing touch-none absolute top-0 left-0 right-0 z-20"
          style={{ backgroundColor: 'transparent' }}
          onTouchStart={e => {
            const startY = e.touches[0].clientY;
            const startHeight = discoverHeight;
            const startTime = Date.now();

            const handleTouchMove = e => {
              const currentY = e.touches[0].clientY;
              const delta = startY - currentY;

              // Canlı hareket - minimum kontrol yok
              const sensitivity = 0.15;
              const newHeight = Math.min(
                80,
                Math.max(
                  50,
                  startHeight + (delta / window.innerHeight) * 100 * sensitivity
                )
              );
              setDiscoverHeight(newHeight);
            };

            const handleTouchEnd = e => {
              const endY = e.changedTouches[0].clientY;
              const deltaY = startY - endY;
              const duration = Date.now() - startTime;
              const velocity = Math.abs(deltaY) / duration;

              // Snap işlemi - minimum 5px hareket gerekli
              if (Math.abs(deltaY) > 5) {
                // Hızlı hareket algılama (velocity-based)
                if (velocity > 0.3 || Math.abs(deltaY) > 50) {
                  if (deltaY > 0) {
                    // Yukarı kaydırma - tam aç
                    setDiscoverHeight(80);
                  } else {
                    // Aşağı kaydırma - yarı aç
                    setDiscoverHeight(50);
                  }
                } else {
                  // Yavaş hareket - pozisyona göre karar ver
                  if (discoverHeight > 65) {
                    setDiscoverHeight(80);
                  } else {
                    setDiscoverHeight(50);
                  }
                }
              }

              document.removeEventListener('touchmove', handleTouchMove);
              document.removeEventListener('touchend', handleTouchEnd);
            };

            document.addEventListener('touchmove', handleTouchMove, {
              passive: false,
            });
            document.addEventListener('touchend', handleTouchEnd);
          }}
        >
          <div className="w-16 h-1 bg-gray-400 rounded-full transition-colors" />
        </div>

        {/* Content - Scrollable - Fixed structural integrity */}
        <div
          className="flex-1 overflow-y-auto bg-[#EAEAEA] scrollbar-hide relative rounded-t-[30px]"
          onScroll={e => {
            const scrollTop = e.target.scrollTop;
            if (scrollTop > 50 && discoverHeight < 75) {
              setDiscoverHeight(80);
            }
          }}
        >
          {/* SECTION 1: MALL DISCOVER */}
          <div className="relative">
            {/* Sticky Header 1: Mall - Clean Floating Header */}
            <div className="sticky top-0 z-40 bg-[#EAEAEA] pt-14 pb-8 px-3">
              <div className="relative mx-auto w-full max-w-[380px] h-[135px]">
                {/* Floating Icon Box with Cutout effect */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[145px] h-[90px] bg-white rounded-[24px] shadow-[0px_10px_25px_rgba(0,0,0,0.15)] z-50 flex items-center justify-center p-[6px]">
                  <div 
                    className="w-full h-full rounded-[20px] flex items-center justify-center relative shadow-inner overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, rgba(37, 60, 81, 0.75) 0%, rgba(37, 60, 81, 0.95) 100%), url(https://images.unsplash.com/photo-1567401724428-7967c816675e?q=80&w=2070&auto=format&fit=crop)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                     <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H19M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 17C7.895 17 7 17.895 7 19C7 20.105 7.895 21 9 21C10.105 21 11 20.105 11 19C11 17.895 10.105 17 9 17Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                </div>

                {/* Main Banner Card */}
                <div 
                   className="absolute top-[18px] inset-x-0 h-[125px] bg-[#253C51] rounded-[28px] shadow-[0px_10px_30px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center pt-10"
                   style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <h2 className="text-white text-[22px] font-normal tracking-wide font-poppins text-center">
                    {placeName ? (
                      <>
                        {placeName }’{placeName.toLowerCase().endsWith('l') ? 'u' : 'ü'} <span className="font-semibold">Keşfet</span>
                      </>
                    ) : (
                      <>
                        Ankamall’ü <span className="font-semibold">Keşfet</span>
                      </>
                    )}
                  </h2>
                  <p className="text-white text-[11px] font-light opacity-75 mt-1.5 font-poppins uppercase tracking-[0.1em]">
                    Fırsatlara göz atmak için <span className="font-bold">kaydır.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 space-y-10 pt-6 pb-12">
              {loading && (
                <div className="text-center py-8">
                   <div className="w-16 h-16 rounded-full mx-auto animate-spin border-4 border-[#00334e] border-t-transparent" />
                   <p className="text-[#00334e] text-sm mt-4 font-semibold font-poppins">Kampanyalar yükleniyor...</p>
                </div>
              )}

              <SubscriptionPopular
                popularRooms={enrichedRooms.filter(r => r.popular_campaign && (r.popular_campaign.isActive || r.popular_campaign.is_active))}
                onRoomSelect={onRoomSelect}
              />

              <Campaigns
                campaignRooms={enrichedRooms.filter(r => r.campaigns?.length > 0)}
                onRoomSelect={onRoomSelect}
              />
            </div>
          </div>

          {/* SECTION 2: ASSISTANT & PRODUCTS */}
          <div className="relative mt-8">
            <div className="sticky top-0 z-40 bg-[#EAEAEA] pt-14 pb-8 px-3">
              <div className="relative mx-auto w-full max-w-[380px] h-[135px]">
                {/* Floating Icon Box */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[145px] h-[90px] bg-white rounded-[24px] shadow-[0px_10px_25px_rgba(0,0,0,0.15)] z-50 flex items-center justify-center p-[6px]">
                  <div 
                    className="w-full h-full rounded-[20px] flex items-center justify-center relative shadow-inner overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, rgba(37, 60, 81, 0.75) 0%, rgba(37, 60, 81, 0.95) 100%), url(https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                     <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3L14.5 9L21 11.5L14.5 14L12 21L9.5 14L3 11.5L9.5 9L12 3Z" fill="white" className="animate-pulse" />
                        <path d="M18 4L19 6L21 7L19 8L18 10L17 8L15 7L17 6L18 4Z" fill="white" opacity="0.6" />
                     </svg>
                  </div>
                </div>

                <div 
                   className="absolute top-[18px] inset-x-0 h-[125px] bg-[#253C51] rounded-[28px] shadow-[0px_10px_30px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center pt-10"
                   style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <h2 className="text-white text-[22px] font-normal tracking-wide font-poppins text-center">
                    Asistanı <span className="font-semibold">Keşfet</span>
                  </h2>
                  <p className="text-white text-[11px] font-light opacity-75 mt-1.5 font-poppins uppercase tracking-[0.1em]">
                    Akıllı yardımcınız size <span className="font-bold">eşlik etsin.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 space-y-12">
              <AssistantDiscover onAssistantOpen={onAssistantOpen} />
              
              <div className="pb-24">
                <ProductCampaigns
                  productRooms={enrichedRooms.filter(r => 
                    r.product_campaigns && 
                    Array.isArray(r.product_campaigns) && 
                    r.product_campaigns.length > 0
                  )}
                  onRoomSelect={onRoomSelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
