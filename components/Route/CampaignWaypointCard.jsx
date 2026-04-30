'use client';

import { useState } from 'react';

export default function CampaignWaypointCard({
  waypoint,
  onSkip,
  onVisit,
  isHidden
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisitSuccess, setIsVisitSuccess] = useState(false);

  if (isHidden || !waypoint) return null;

  const campaign = waypoint.target?.popular_campaign || {};
  const storeName = waypoint.target?.name || 'Mağaza';
  const logoUrl = waypoint.target?.logo;
  const campaignTitle = campaign.title || `${storeName} Kampanyası`;

  const handleSkip = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await onSkip(waypoint);
    setIsProcessing(false);
  };

  const handleVisit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsVisitSuccess(true);

    // Let the user see the success state before moving to next waypoint.
    await new Promise(resolve => setTimeout(resolve, 700));
    await onVisit(waypoint);

    setIsVisitSuccess(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[138px] sm:bottom-[158px] md:bottom-[208px] w-[310px] z-20 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div
        className={`rounded-full px-3 py-2 flex items-center gap-3 border-[1.5px] transition-all duration-500 ${
          isVisitSuccess
            ? 'bg-gradient-to-r from-emerald-400/95 to-green-500/95 border-emerald-300 shadow-[0px_8px_24px_rgba(16,185,129,0.35)] translate-x-1'
            : 'bg-gradient-to-r from-amber-50/95 to-orange-50/95 border-amber-400 shadow-[0px_4px_15px_rgba(245,158,11,0.2)]'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-amber-200 shadow-sm">
          {isVisitSuccess ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-[14px]">✓</span>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping" />
            </div>
          ) : logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-[10px]">%</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-[11px] leading-tight truncate transition-colors duration-300 ${isVisitSuccess ? 'text-white' : 'text-[#1B3349]'}`}>
            {storeName}
            {campaign.discount_percentage && !isVisitSuccess && (
              <span className="text-orange-600 ml-1">%{campaign.discount_percentage}</span>
            )}
          </p>
          <p className={`font-bold text-[8px] truncate uppercase tracking-tight leading-none mt-0.5 transition-colors duration-300 ${isVisitSuccess ? 'text-emerald-50' : 'text-orange-700/70'}`}>
            {isVisitSuccess ? 'Ziyaret edildi' : campaignTitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleSkip}
            disabled={isProcessing}
            className="px-2.5 h-7 rounded-full bg-white/50 hover:bg-white text-amber-800 font-bold text-[9px] transition-all border border-amber-200/50 disabled:opacity-70"
          >
            Atla
          </button>
          <button
            onClick={handleVisit}
            disabled={isProcessing}
            className={`px-3.5 h-7 rounded-full text-white font-bold text-[9px] transition-all shadow-md active:scale-95 ${
              isVisitSuccess
                ? 'bg-emerald-700/80'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
            }`}
          >
            {isProcessing ? '...' : 'Ziyaret'}
          </button>
        </div>
      </div>
    </div>
  );
}
