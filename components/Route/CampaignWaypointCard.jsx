'use client';

import { useState } from 'react';

export default function CampaignWaypointCard({
  waypoint,
  onSkip,
  onVisit,
  isHidden
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (isHidden || !waypoint) return null;

  const campaign = waypoint.target?.popular_campaign || {};
  const storeName = waypoint.target?.name || 'Mağaza';
  const logoUrl = waypoint.target?.logo;
  const campaignTitle = campaign.title || `${storeName} Kampanyası`;

  const handleAction = async (actionFn) => {
    if (isProcessing) return;
    setIsProcessing(true);
    await actionFn(waypoint);
    setIsProcessing(false);
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[138px] sm:bottom-[158px] md:bottom-[208px] w-[310px] z-20 animate-in slide-in-from-bottom-2 fade-in duration-300"
    >
      <div className="bg-gradient-to-r from-amber-50/95 to-orange-50/95 backdrop-blur-md rounded-full shadow-[0px_4px_15px_rgba(245,158,11,0.2)] px-3 py-2 flex items-center gap-3 border-[1.5px] border-amber-400">
        
        {/* Yellow/Orange Logo Container */}
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-amber-200 shadow-sm">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full bg-amber-100 flex items-center justify-center">
               <span className="text-amber-600 font-bold text-[10px]">%</span>
            </div>
          )}
        </div>

        {/* Info Text with Orange Accents */}
        <div className="flex-1 min-w-0">
          <p className="text-[#1B3349] font-bold text-[11px] leading-tight truncate">
            {storeName} 
            {campaign.discount_percentage && (
               <span className="text-orange-600 ml-1">%{campaign.discount_percentage}</span>
            )}
          </p>
          <p className="text-orange-700/70 font-bold text-[8px] truncate uppercase tracking-tight leading-none mt-0.5">
            {campaignTitle}
          </p>
        </div>

        {/* Orange Theme Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => handleAction(onSkip)}
            disabled={isProcessing}
            className="px-2.5 h-7 rounded-full bg-white/50 hover:bg-white text-amber-800 font-bold text-[9px] transition-all border border-amber-200/50"
          >
            Atla
          </button>
          <button
            onClick={() => handleAction(onVisit)}
            disabled={isProcessing}
            className="px-3.5 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-[9px] transition-all shadow-md active:scale-95"
          >
            Ziyaret
          </button>
        </div>

      </div>
    </div>
  );
}
