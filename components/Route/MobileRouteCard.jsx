'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function MobileRouteCard({
  isKioskMode,
  isCardMinimized,
  selectedEndRoom,
  routeSteps,
  activeNavItem,
  rooms,
  handleFinish,
  totalDistance,
  getInstruction,
  routeByFloor,
  currentFloor,
  selectedStartRoom,
  handlePreviousFloor,
  handleNextFloor,
  isSelectingStartRoom,
  handleCompleteRoute,
}) {
  // ✅ TÜM HOOK'LAR EN ÜSTTE OLMALI (conditional return'lerden ÖNCE!)
  const [arrivalTime, setArrivalTime] = useState('');
  const [success, setSuccess] = useState(false);
  
  // ✅ useEffect de en üstte
  useEffect(() => {
    // Sadece client-side'da çalışır
    if (totalDistance > 0) {
      const now = new Date();
      const arrival = new Date(now.getTime() + (totalDistance / 80) * 60000);
      setArrivalTime(
        arrival.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }, [totalDistance]);

  // ✅ Normal değişkenler hook'lardan sonra
  const selectedRoom = rooms.find(r => r.id === selectedEndRoom);
  const shouldHide = isKioskMode || isCardMinimized || (!selectedEndRoom && routeSteps.length === 0);
  
  // ✅ Conditional return en sonda
  if (shouldHide) {
    return null; // Artık hook order bozulmuyor, null güvenli
  }

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 bottom-[185px] sm:bottom-[210px] md:bottom-[260px] w-[318px] h-[140px] z-30
        ${activeNavItem !== 0 || routeSteps.length === 0 ? 'hidden' : ''}
      `}
    >
      {/* Main Group Container */}
      <div className="bg-white rounded-[20px] shadow-[0px_2px_20px_rgba(0,0,0,0.25)] flex w-[318px] h-[107px]">
        {/* Inner Div */}
        <div className="relative w-[291px] h-[81px] ml-[14px] mt-[11px]">
            {/* Group 4 - Main Content Row */}
            <div className="absolute left-0 top-0 w-full h-[76px] flex items-center pr-2">
              {/* Logo Box */}
              <div className="w-[70px] h-[76px] bg-white rounded-[20px] shadow-[0px_4px_14.1px_rgba(0,0,0,0.25)] flex items-center justify-center flex-shrink-0">
                {selectedRoom?.logo ? (
                  <img
                    src={selectedRoom.logo}
                    alt={selectedRoom.name}
                    className="w-[60px] h-[60px] object-contain"
                  />
                ) : (
                  <span className="text-[#263d52] font-bold text-xl">
                    {selectedRoom?.name?.[0] || '?'}
                  </span>
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-center ml-4">
                {/* Store Name */}
                <div className="text-[#263d52] font-semibold text-[14px] leading-tight truncate mb-2">
                  {selectedRoom?.name || 'HEDEF'}
                </div>

                {/* Info Pills Row */}
                <div className="flex items-center gap-2">
                  {/* Varış Süresi Pill */}
                  <div className="flex-1 min-w-[60px] h-[36px] border-[0.7px] border-[#263d52] rounded-[12px] flex flex-col items-center justify-center px-1">
                    <span className="text-[#263d52] font-medium text-[6px] leading-none mb-0.5">Varış Süresi</span>
                    <span className="text-[#263d52] font-semibold text-[11px] leading-none">
                      {Math.ceil(totalDistance / 80)} dk
                    </span>
                  </div>

                  {/* Mesafe Pill */}
                  <div className="flex-1 min-w-[60px] h-[36px] border-[0.7px] border-[#263d52] rounded-[12px] flex flex-col items-center justify-center px-1">
                    <span className="text-[#263d52] font-medium text-[6px] leading-none mb-0.5">Mesafe</span>
                    <span className="text-[#263d52] font-semibold text-[11px] leading-none whitespace-nowrap">
                      {totalDistance > 999 ? `${(totalDistance/1000).toFixed(1)} km` : `${Math.round(totalDistance)} m`}
                    </span>
                  </div>

                  {/* Varış Zamanı Pill */}
                  <div className="flex-1 min-w-[60px] h-[36px] border-[0.7px] border-[#263d52] rounded-[12px] flex flex-col items-center justify-center px-1">
                    <span className="text-[#263d52] font-medium text-[6px] leading-none mb-0.5">Varış Zamanı</span>
                    <span className="text-[#263d52] font-semibold text-[11px] leading-none whitespace-nowrap">
                      {arrivalTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotayı Tamamla Butonu - Yeni Kibar Tasarım */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full flex justify-center px-4">
              {typeof window !== 'undefined' && localStorage.getItem('user_token') ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (success) return;
                    setSuccess(true);
                    // Küçük bir gecikme ile hem kaydet hem de kapat
                    setTimeout(() => {
                      handleCompleteRoute();
                      handleFinish?.();
                    }, 1500);
                  }}
                  disabled={success}
                  className={`
                    relative overflow-hidden transition-all duration-500 active:scale-95
                    ${success ? 'bg-emerald-500 w-[160px]' : 'bg-[#1B3349] w-[140px]'}
                    h-[36px] rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.2)] 
                    flex items-center justify-center gap-2 border border-white/20
                    backdrop-blur-md group
                  `}
                >
                  {success ? (
                    <>
                      <span className="text-white text-[11px] font-bold tracking-wide animate-in fade-in zoom-in duration-300">
                        HEDEFE ULAŞILDI
                      </span>
                      <svg className="animate-in zoom-in spin-in-12 duration-500" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase opacity-90 group-hover:opacity-100 italic">
                        Rotayı Tamamla
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-gray-400 text-[9px] font-medium uppercase tracking-tight">Kayıt için giriş yapın</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="absolute left-[270px] top-0 w-[21px] h-[21px] aspect-square">
              <button onClick={handleFinish} className="relative w-full h-full">
                <X
                  className="absolute text-[#263d52]"
                  style={{
                    height: '54.93%',
                    width: '54.93%',
                    left: '22.53%',
                    top: '22.53%',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
