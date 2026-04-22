'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Shirt, Smartphone, Sparkles } from 'lucide-react';

const QuickAccessButtons = ({ rooms = [], onRoomSelect, onQuickAccess, onMenuToggle }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  const menuRef = useRef(null);

  // Helper for filtering
  const getFilteredRooms = (keywords) => {
    return rooms.filter(room => {
      const name = room.name?.toLowerCase() || '';
      const category = room.category?.toLowerCase() || '';
      return keywords.some(keyword => 
        name.includes(keyword) || category.includes(keyword)
      );
    });
  };

  // Define categories
  const categories = {
    kafe: {
      title: 'Kafeler',
      keywords: ['cafe', 'kafe', 'coffee', 'restaurant', 'kahve', 'starbucks', 'gloria', 'yemek', 'food'],
      icon: <Coffee size={18} color="currentColor" />
    },
    moda: {
      title: 'Giyim & Moda',
      keywords: ['giyim', 'moda', 'tekstil', 'ayakkabı', 'çanta', 'kıyafet', 'aksesuar', 'spor', 'lcw', 'defacto', 'zara', 'mavi', 'boyner', 'koton', 'h&m', 'colins', 'network', 'ipekyol', 'damat', 'kiğılı', 'altınyıldız'],
      icon: <Shirt size={18} color="currentColor" />
    },
    teknoloji: {
      title: 'Teknoloji',
      keywords: ['teknoloji', 'elektronik', 'bilgisayar', 'telefon', 'gsm', 'apple', 'samsung', 'mediamarkt', 'teknosa', 'vatan', 'reeder', 'turkcell', 'vodafone', 'türk telekom'],
      icon: <Smartphone size={18} color="currentColor" />
    },
    kozmetik: {
      title: 'Kozmetik',
      keywords: ['kozmetik', 'parfüm', 'bakım', 'güzellik', 'gratis', 'watsons', 'rossmann', 'sephora', 'eve', 'flormar', 'golden rose', 'mac', 'yves rocher'],
      icon: <Sparkles size={18} color="currentColor" />
    }
  };

  // Prepare data
  const menuData = Object.entries(categories).reduce((acc, [key, config]) => {
    acc[key] = getFilteredRooms(config.keywords);
    return acc;
  }, {});

  useEffect(() => {
    const handleClickOutside = event => {
      const isOutsideMenu = !menuRef.current || !menuRef.current.contains(event.target);
      const isOutsideButtons = !Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target));

      if (isOutsideMenu && isOutsideButtons) {
        setActiveMenu(null);
        if (onMenuToggle) onMenuToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onMenuToggle]);

  const handleButtonClick = (button, event) => {
    if (button.type === 'menu') {
      if (activeMenu === button.id) {
        setActiveMenu(null);
        if (onMenuToggle) onMenuToggle(false);
      } else {
        const rect = event.currentTarget.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const menuWidth = 220;
        
        let leftPos = Math.max(10, rect.left - (menuWidth - rect.width) / 2);
        if (leftPos + menuWidth > screenWidth - 10) {
          leftPos = screenWidth - menuWidth - 10;
        }

        setMenuPosition({
          top: rect.bottom + 8,
          left: leftPos,
        });
        setActiveMenu(button.id);
        if (onMenuToggle) onMenuToggle(true);
      }
    } else {
      if (activeMenu === button.id) {
        setActiveMenu(null);
      } else {
        setActiveMenu(button.id);
      }
      
      if (onMenuToggle) onMenuToggle(false);
      if (onQuickAccess) {
        onQuickAccess(button.action);
      }
    }
  };

  const buttons = [
    { id: 'kafe', label: 'Kafe', icon: categories.kafe.icon, type: 'menu' },
    { id: 'moda', label: 'Moda', icon: categories.moda.icon, type: 'menu' },
    { id: 'teknoloji', label: 'Teknoloji', icon: categories.teknoloji.icon, type: 'menu' },
    { id: 'kozmetik', label: 'Kozmetik', icon: categories.kozmetik.icon, type: 'menu' },
    {
      id: 'wc',
      label: 'WC',
      type: 'action',
      action: 'wc',
      icon: (
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 2.5C5.5 2.63261 5.44732 2.75979 5.35355 2.85355C5.25979 2.94732 5.13261 3 5 3H4C3.86739 3 3.74021 2.94732 3.64645 2.85355C3.55268 2.75979 3.5 2.63261 3.5 2.5C3.5 2.36739 3.55268 2.24021 3.64645 2.14645C3.74021 2.05268 3.86739 2 4 2H5C5.13261 2 5.25979 2.05268 5.35355 2.14645C5.44732 2.24021 5.5 2.36739 5.5 2.5ZM8.77 10.8212L8.99 12.3588C9.01024 12.5006 8.99976 12.6451 8.95929 12.7825C8.91882 12.9199 8.84929 13.0471 8.75541 13.1553C8.66154 13.2635 8.54551 13.3503 8.41518 13.4098C8.28485 13.4692 8.14326 13.5 8 13.5H4C3.85674 13.5 3.71515 13.4692 3.58482 13.4098C3.45449 13.3503 3.33846 13.2635 3.24459 13.1553C3.15071 13.0471 3.08118 12.9199 3.04071 12.7825C3.00024 12.6451 2.98976 12.5006 3.01 12.3588L3.23 10.8212C2.25681 10.3141 1.44121 9.54989 0.871765 8.61177C0.302324 7.67364 0.000819445 6.59742 0 5.5C0 5.36739 0.0526785 5.24021 0.146447 5.14645C0.240215 5.05268 0.367392 5 0.5 5H1.5V1C1.5 0.734784 1.60536 0.48043 1.79289 0.292893C1.98043 0.105357 2.23478 0 2.5 0H9.5C9.76522 0 10.0196 0.105357 10.2071 0.292893C10.3946 0.48043 10.5 0.734784 10.5 1V5H11.5C11.6326 5 11.7598 5.05268 11.8536 5.14645C11.9473 5.24021 12 5.36739 12 5.5C11.9992 6.59742 11.6977 7.67364 11.1282 8.61177C10.5588 9.54989 9.74319 10.3141 8.77 10.8212ZM2.5 5H9.5V1H2.5V5ZM7.81688 11.2188C6.63465 11.5937 5.36535 11.5937 4.18313 11.2188L4 12.5H8L7.81688 11.2188ZM10.975 6H1.025C1.14881 7.23343 1.72639 8.37689 2.64567 9.20851C3.56494 10.0401 4.76037 10.5006 6 10.5006C7.23963 10.5006 8.43506 10.0401 9.35433 9.20851C10.2736 8.37689 10.8512 7.23343 10.975 6Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'bebek',
      label: 'Bebek Odası',
      type: 'action',
      action: 'baby-care',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 1.66667C14.6025 1.66667 18.3333 5.39751 18.3333 10C18.3333 14.6025 14.6025 18.3333 10 18.3333C5.39751 18.3333 1.66667 14.6025 1.66667 10C1.66667 5.39751 5.39751 1.66667 10 1.66667ZM10 3.33334C8.34146 3.33424 6.74281 3.95333 5.51624 5.0697C4.28968 6.18608 3.52328 7.71957 3.36673 9.37071C3.21017 11.0218 3.67469 12.672 4.66958 13.9991C5.66447 15.3261 7.11828 16.2346 8.74709 16.5472C10.3759 16.8598 12.0628 16.554 13.4782 15.6896C14.8937 14.8252 15.9361 13.4642 16.4019 11.8724C16.8678 10.2806 16.7235 8.57237 15.9974 7.08124C15.2713 5.5901 14.0154 4.42317 12.475 3.80834C12.5485 4.3149 12.4647 4.83182 12.235 5.28924C12.0052 5.74666 11.6406 6.12254 11.1904 6.3661C10.7402 6.60965 10.2261 6.70914 9.71753 6.65112C9.20896 6.5931 8.73046 6.38037 8.34667 6.04167C8.18728 5.90157 8.08735 5.70594 8.06725 5.49468C8.04716 5.28342 8.10842 5.07246 8.23853 4.90482C8.36865 4.73717 8.55782 4.62549 8.76746 4.59254C8.97709 4.55959 9.1914 4.60786 9.36667 4.7275L9.44917 4.79167C9.55031 4.88087 9.67158 4.94418 9.80258 4.97619C9.93357 5.0082 10.0704 5.00794 10.2013 4.97543C10.3321 4.94292 10.4532 4.87914 10.554 4.78956C10.6547 4.69998 10.7323 4.58728 10.7799 4.46113C10.8276 4.33498 10.8439 4.19915 10.8275 4.0653C10.8111 3.93145 10.7625 3.80358 10.6858 3.69267C10.6091 3.58176 10.5066 3.49112 10.3871 3.42853C10.2677 3.36595 10.1349 3.33328 10 3.33334ZM12.2 12.6933C12.3697 12.8348 12.4762 13.0379 12.4962 13.2579C12.5162 13.4779 12.4481 13.6969 12.3067 13.8667C11.7467 14.5392 10.9367 15 10 15C9.06334 15 8.25334 14.5392 7.69334 13.8667C7.55812 13.6962 7.4949 13.4797 7.5172 13.2633C7.53949 13.0469 7.64553 12.8478 7.81266 12.7085C7.97978 12.5692 8.19475 12.5009 8.41162 12.5179C8.6285 12.535 8.83009 12.6363 8.97334 12.8C9.2725 13.1583 9.63834 13.3333 10 13.3333C10.3617 13.3333 10.7275 13.1583 11.0267 12.8C11.1682 12.6303 11.3712 12.5238 11.5913 12.5038C11.8113 12.4838 12.0302 12.552 12.2 12.6933ZM7.08334 8.33334C7.41486 8.33334 7.7328 8.46503 7.96722 8.69945C8.20164 8.93388 8.33334 9.25182 8.33334 9.58334C8.33334 9.91486 8.20164 10.2328 7.96722 10.4672C7.7328 10.7016 7.41486 10.8333 7.08334 10.8333C6.75182 10.8333 6.43388 10.7016 6.19945 10.4672C5.96503 10.2328 5.83334 9.91486 5.83334 9.58334C5.83334 9.25182 5.96503 8.93388 6.19945 8.69945C6.43388 8.46503 6.75182 8.33334 7.08334 8.33334ZM12.9167 8.33334C13.2482 8.33334 13.5661 8.46503 13.8006 8.69945C14.035 8.93388 14.1667 9.25182 14.1667 9.58334C14.1667 9.91486 14.035 10.2328 13.8006 10.4672C13.5661 10.7016 13.2482 10.8333 12.9167 10.8333C12.5852 10.8333 12.2672 10.7016 12.0328 10.4672C11.7984 10.2328 11.6667 9.91486 11.6667 9.58334C11.6667 9.25182 11.7984 8.93388 12.0328 8.69945C12.2672 8.46503 12.5852 8.33334 12.9167 8.33334Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'eczane',
      label: 'Eczane',
      type: 'action',
      action: 'pharmacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="7" viewBox="0 0 19 7" fill="none">
          <path d="M15.2605 0H3.74031C1.68314 0 0 1.49882 0 3.5C0 5.50118 1.68314 7 3.74031 7H15.2605C17.3169 7 19 5.50076 19 3.5C19 1.49882 17.3169 0 15.2605 0ZM15.2617 6.17647H9.54974V0.823529H15.2617C16.7785 0.823529 18.0208 2.02382 18.0208 3.5C18.0208 4.97618 16.7789 6.17647 15.2617 6.17647Z" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <div 
      className="absolute top-20 left-0 right-0 z-[120] px-2 sm:px-4"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div 
        className="overflow-x-auto scrollbar-hide"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max sm:min-w-0 px-2">
          {buttons.map(button => (
            <button
              key={button.id}
              ref={el => buttonRefs.current[button.id] = el}
              onClick={(e) => handleButtonClick(button, e)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`flex flex-row justify-center items-center gap-1.5 sm:gap-2 flex-shrink-0 w-auto min-w-[90px] sm:min-w-[107px] h-[38px] sm:h-[41px] px-3 sm:px-4 rounded-[20px] sm:hover:shadow-lg transition-all active:scale-95 active:shadow-none outline-none focus:outline-none focus:ring-0 ring-0 select-none touch-manipulation ${
                activeMenu === button.id 
                  ? 'bg-[#00334E] text-white' 
                  : 'bg-white text-[#1B3349] active:bg-[#00334E] active:text-white'
              }`}
            >
              <span className="flex-shrink-0 flex items-center justify-center scale-90 sm:scale-100">
                {button.icon}
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium whitespace-nowrap font-poppins">
                {button.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Menü */}
      {activeMenu && menuData[activeMenu] && (
        <div
          ref={menuRef}
          className="fixed z-[150] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: '220px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
              {categories[activeMenu].title}
            </div>
            {menuData[activeMenu].length > 0 ? (
              menuData[activeMenu].map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    onRoomSelect(room);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-dark rounded-lg transition-colors flex items-center gap-2 group"
                >
                  {room.logo ? (
                    <img src={room.logo} alt="" className="w-5 h-5 object-contain rounded-full bg-white border border-gray-100" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-[10px]">
                      {activeMenu === 'kafe' ? '☕' : activeMenu === 'moda' ? '👕' : activeMenu === 'teknoloji' ? '📱' : '✨'}
                    </span>
                  )}
                  <span className="font-medium truncate">{room.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                Sonuç bulunamadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccessButtons;
