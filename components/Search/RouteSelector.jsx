'use client';

import React, { useState } from 'react';

const RouteSelector = ({
  routeMode = 'basit',
  onRouteModeChange,
  onClose,
  onSwap,
  startLocation,
  endLocation,
}) => {
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const modes = [
    { id: 'basit', label: 'Basit', icon: '⚡' },
    { id: 'spor', label: 'Spor', icon: '🏃' },
    { id: 'keşfet', label: 'Keşfet', icon: '🔍' },
  ];

  const currentMode = modes.find(m => m.id === routeMode) || modes[0];
  return (
    <div className="relative w-auto max-w-[520px]">
      <div className="bg-white rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] py-[8px] px-[16px] flex items-center gap-[12px]">
        {/* Sol taraf - Dikey çizgi ikonu (başlangıç ve hedef noktaları) */}
        <div className="flex flex-col items-center justify-between h-[54px] w-[13px] flex-shrink-0">
          {/* Başlangıç noktası - Daire */}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="6" stroke="#1B3349" />
            <circle cx="6.5" cy="6.5" r="4.33333" fill="#1B3349" />
          </svg>

          {/* Orta noktalar */}
          <div className="flex flex-col items-center gap-[5.87px]">
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
              <circle
                cx="2"
                cy="2"
                r="1.63"
                fill="#1B3349"
                fillOpacity="0.36"
              />
            </svg>
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
              <circle
                cx="2"
                cy="2"
                r="1.63"
                fill="#1B3349"
                fillOpacity="0.36"
              />
            </svg>
            <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
              <circle
                cx="2"
                cy="2"
                r="1.63"
                fill="#1B3349"
                fillOpacity="0.36"
              />
            </svg>
          </div>

          {/* Hedef noktası - Pin */}
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
            <path
              d="M6.5 7.55C6.07381 7.55 5.66504 7.36563 5.36364 7.03744C5.06224 6.70926 4.89286 6.26407 4.89286 5.8C4.89286 5.33593 5.06224 4.89074 5.36364 4.56256C5.66504 4.23437 6.07381 4.05 6.5 4.05C6.92619 4.05 7.33496 4.23437 7.63636 4.56256C7.93776 4.89074 8.10714 5.33593 8.10714 5.8C8.10714 6.02976 8.06557 6.25738 7.98476 6.46973C7.90395 6.68207 7.78571 6.87487 7.63636 7.03744C7.48701 7.20001 7.31004 7.32877 7.11496 7.41676C6.91988 7.50474 6.71104 7.55 6.5 7.55ZM6.5 0.9C5.30653 0.9 4.16193 1.41625 3.31802 2.33518C2.47411 3.25411 2 4.50043 2 5.8C2 9.475 6.5 14.9 6.5 14.9C6.5 14.9 11 9.475 11 5.8C11 4.50043 10.5259 3.25411 9.68198 2.33518C8.83807 1.41625 7.69347 0.9 6.5 0.9Z"
              fill="#1B3349"
            />
          </svg>
        </div>

        {/* Sağ taraf - İçerik */}
        <div className="flex-1 flex flex-col">
          {/* Konumunuz başlığı */}
          <div className="flex justify-between items-start mb-[8px] mx-[7px]">
            <span className="text-[#1B3349] text-[13px] font-normal">
              Konumunuz
            </span>
            {/* X butonu */}
            <button
              onClick={onClose}
              className="w-[16px] h-[16px] flex items-center justify-center hover:bg-gray-100 rounded"
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path
                  d="M8.5 0.831543C8.43604 0.767578 8.36096 0.717041 8.27725 0.682373C8.19355 0.647705 8.10477 0.629883 8.01465 0.629883C7.92453 0.629883 7.83575 0.647705 7.75205 0.682373C7.66834 0.717041 7.59326 0.767578 7.5293 0.831543L4.16235 4.19141L0.795398 0.824543C0.731438 0.760578 0.656358 0.710041 0.572654 0.675373C0.48895 0.640705 0.400169 0.622883 0.310049 0.622883C0.219929 0.622883 0.131148 0.640705 0.0474437 0.675373C-0.0362606 0.710041 -0.111341 0.760578 -0.175301 0.824543C-0.239261 0.888508 -0.289798 0.963588 -0.324466 1.04729C-0.359134 1.131 -0.376956 1.21978 -0.376956 1.3099C-0.376956 1.40002 -0.359134 1.4888 -0.324466 1.57251C-0.289798 1.65621 -0.239261 1.73129 -0.175301 1.79525L3.19157 5.16229L-0.175301 8.52924C-0.239261 8.5932 -0.289798 8.66828 -0.324466 8.75198C-0.359134 8.83569 -0.376956 8.92447 -0.376956 9.01459C-0.376956 9.10471 -0.359134 9.19349 -0.324466 9.27719C-0.289798 9.3609 -0.239261 9.43598 -0.175301 9.49994C-0.111341 9.5639 -0.0362606 9.61444 0.0474437 9.64911C0.131148 9.68377 0.219929 9.7016 0.310049 9.7016C0.400169 9.7016 0.48895 9.68377 0.572654 9.64911C0.656358 9.61444 0.731438 9.5639 0.795398 9.49994L4.16235 6.13308L7.5293 9.49994C7.59326 9.5639 7.66834 9.61444 7.75205 9.64911C7.83575 9.68377 7.92453 9.7016 8.01465 9.7016C8.10477 9.7016 8.19355 9.68377 8.27725 9.64911C8.36096 9.61444 8.43604 9.5639 8.5 9.49994C8.56396 9.43598 8.6145 9.3609 8.64916 9.27719C8.68383 9.19349 8.70165 9.10471 8.70165 9.01459C8.70165 8.92447 8.68383 8.83569 8.64916 8.75198C8.6145 8.66828 8.56396 8.5932 8.5 8.52924L5.13313 5.16229L8.5 1.79525C8.76196 1.53329 8.76196 1.0935 8.5 0.831543Z"
                  fill="#1B3349"
                  fillOpacity="0.57"
                />
              </svg>
            </button>
          </div>

          {/* Ayırıcı çizgi */}
          <div className="h-[0.77px] bg-[#1B33498F] rounded-[30px] mb-[8px]"></div>

          {/* Hedef konum satırı */}
          <div className="flex items-center mx-[4px] sm:mx-[7px]">
            <span className="text-black text-[11px] sm:text-[13px] font-normal truncate max-w-[120px] sm:max-w-none">
              {endLocation || 'Hedef seçin'}
            </span>
            <div className="flex-1 min-w-[10px] sm:min-w-[20px]"></div>
            {/* Mod seçici butonu */}
            <div className="relative mr-[6px] sm:mr-[10px]">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="px-2 sm:px-4 h-[24px] sm:h-[26px] rounded-[20px] border-[0.5px] border-[#374D60] flex items-center justify-center min-w-[60px] sm:min-w-[70px] hover:bg-gray-50 transition-colors"
              >
                <span className="text-[10px] sm:text-[11px] text-[#1B3349]">
                  {currentMode.label}
                </span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  className={`ml-1.5 transition-transform ${
                    showModeDropdown ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="#1B3349"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown menü */}
              {showModeDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                  {modes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onRouteModeChange?.(mode.id);
                        setShowModeDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-[11px] hover:bg-gray-50 flex items-center gap-2 ${
                        routeMode === mode.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-[#1B3349]'
                      }`}
                    >
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Swap/Değiştir butonu */}
            <button
              onClick={onSwap}
              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] flex items-center justify-center hover:bg-gray-100 rounded flex-shrink-0"
            >
              <svg
                width="9"
                height="10"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-[10px] sm:h-[11px]"
              >
                <path
                  d="M8.42662 2.2579C8.52451 2.34911 8.65398 2.39877 8.78776 2.39641C8.92154 2.39405 9.04918 2.33986 9.1438 2.24524C9.23841 2.15063 9.2926 2.02299 9.29496 1.88921C9.29732 1.75543 9.24767 1.62596 9.15645 1.52806L7.77941 0.15102C7.68258 0.054317 7.55133 -7.622e-08 7.41449 -8.22017e-08C7.27764 -8.81833e-08 7.1464 0.054317 7.04957 0.15102L5.67253 1.52806C5.62179 1.57534 5.5811 1.63235 5.55288 1.69569C5.52465 1.75904 5.50948 1.82742 5.50825 1.89675C5.50703 1.96609 5.51978 2.03496 5.54576 2.09926C5.57173 2.16356 5.61038 2.22197 5.65942 2.27101C5.70846 2.32004 5.76687 2.3587 5.83116 2.38467C5.89546 2.41064 5.96434 2.4234 6.03367 2.42217C6.10301 2.42095 6.17139 2.40577 6.23473 2.37755C6.29808 2.34933 6.35509 2.30863 6.40236 2.2579L6.8981 1.76216V8.7782C6.8981 8.91516 6.9525 9.04651 7.04935 9.14335C7.14619 9.24019 7.27753 9.29459 7.41449 9.29459C7.55144 9.29459 7.68279 9.24019 7.77963 9.14335C7.87648 9.04651 7.93088 8.91516 7.93088 8.7782V1.76216L8.42662 2.2579ZM3.64827 8.41329C3.55145 8.31658 3.4202 8.26227 3.28336 8.26227C3.14651 8.26227 3.01526 8.31658 2.91844 8.41329L2.4227 8.90902L2.4227 1.89298C2.4227 1.75603 2.3683 1.62468 2.27145 1.52784C2.17461 1.431 2.04327 1.37659 1.90631 1.37659C1.76935 1.37659 1.63801 1.431 1.54117 1.52784C1.44432 1.62468 1.38992 1.75603 1.38992 1.89298L1.38992 8.90902L0.894183 8.41329C0.846908 8.36255 0.789898 8.32186 0.726555 8.29363C0.663211 8.26541 0.594831 8.25023 0.525495 8.24901C0.456159 8.24779 0.387287 8.26054 0.322988 8.28651C0.258687 8.31249 0.200277 8.35114 0.151241 8.40018C0.102206 8.44921 0.063549 8.50762 0.0375767 8.57192C0.0116053 8.63622 -0.00114918 8.70509 7.43866e-05 8.77443C0.00129795 8.84377 0.0164728 8.91215 0.0446968 8.97549C0.0729208 9.03884 0.113614 9.09584 0.164349 9.14312L1.54139 10.5202C1.63822 10.6169 1.76947 10.6712 1.90631 10.6712C2.04315 10.6712 2.1744 10.6169 2.27123 10.5202L3.64827 9.14312C3.74498 9.0463 3.79929 8.91505 3.79929 8.7782C3.79929 8.64136 3.74498 8.51011 3.64827 8.41329Z"
                  fill="#1B3349"
                  fillOpacity="0.57"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;
