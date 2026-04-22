import React, { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { usePlatformVoice } from '@/hooks/usePlatformVoice';

const MapHeader = ({
  searchQuery,
  setSearchQuery,
  setShowSearchDropdown,
  setIsAssistantOpen,
  setIsSearchFocused,
  showSearchDropdown,
  searchResults,
  handleSearchResultSelect,
  isKioskMode,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { isRecording, isProcessing, error, handleVoiceButtonClick, platformIcon, platform, transcript } = usePlatformVoice();
  const [isMicActive, setIsMicActive] = useState(false);

  useEffect(() => {
    if (isRecording && transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript, isRecording, setSearchQuery]);

  // Kayıt dışarıdan biterse (sessizlik vs) butonu da eski haline döndür
  useEffect(() => {
    if (!isRecording && !isProcessing) {
      setIsMicActive(false);
    }
  }, [isRecording, isProcessing]);

  const handleMicClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMicActive) {
      setIsMicActive(false);
      handleVoiceButtonClick(); // Durdur
      return;
    }

    setIsMicActive(true);
    await handleVoiceButtonClick((result) => {
      if (result) {
        setSearchQuery(result);
        setShowSearchDropdown(true);
      }
      setIsMicActive(false);
    });
  };

  // Hydration-safe mounting check
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return null during SSR and initial client render to prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <>
      {/* Floating Header Section - Haritanın üzerinde */}
      <div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-4xl h-14 rounded-2xl overflow-hidden px-4 z-30 shadow-2xl"
        style={{ backgroundColor: '#1B3349' }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-4 md:inset-0 w-full h-full opacity-5"
          style={{
            background: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
                        linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
                        linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%)`,
          }}
        />

        {/* Decorative Pattern */}
        <div
          className="absolute rounded-xl"
          style={{
            top: '0',
            left: '0',
            width: '100%',
            height: '25%',
            opacity: '0.08',
            background: `conic-gradient(from 45deg at 20% 30%, rgba(255,255,255,0.1) 0deg, transparent 90deg),
                        conic-gradient(from 225deg at 80% 70%, rgba(255,255,255,0.05) 0deg, transparent 90deg)`,
          }}
        />

        {/* Header Content */}
        <div className="relative z-10 flex items-center px-3 py-2 h-full gap-2 md:gap-3">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img
              src="/ankamall-logo.png"
              alt="Ankamall Logo"
              className="h-8 md:h-10 w-auto object-contain max-w-[100px] md:max-w-[160px]"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 md:max-w-sm md:ml-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Ara"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setShowSearchDropdown(true);
                    setIsAssistantOpen(false);
                  } else {
                    setShowSearchDropdown(false);
                  }
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsAssistantOpen(false);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setShowSearchDropdown(false);
                  }, 200);
                }}
                className="w-full h-8 md:h-9 backdrop-blur-md border border-white/30 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all pl-8 md:pl-9 pr-9 md:pr-10 text-white placeholder-white/70"
                style={{ backgroundColor: 'rgba(49, 95, 111, 0.7)' }}
              />
              {/* Search Icon */}
              <Search className="absolute left-2 md:left-2.5 top-1/2 transform -translate-y-1/2 w-3 md:w-3.5 h-3 md:h-3.5 text-white/70 pointer-events-none" />
              {/* Microphone Icon */}
              <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 z-[30]">
                <button 
                  onClick={handleMicClick}
                  className={`p-0.5 transition-all rounded-full flex items-center justify-center ${isMicActive ? 'bg-[#FF3B30] text-white shadow-[0_0_8px_rgba(255,59,48,0.3)]' : isProcessing ? 'bg-yellow-500 text-white animate-pulse' : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-red-500/20 active:scale-95'}`}
                  title={isMicActive ? 'Durdur' : 'Sesle Ara'}
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isMicActive ? 'animate-pulse' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error && (
                    <div className="absolute bottom-full right-0 mb-2 bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl whitespace-normal min-w-[120px] text-center z-[200] animate-in fade-in slide-in-from-bottom-1">
                      {error}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showSearchDropdown && searchQuery && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-[130]"
          style={{ top: '67px' }}
        >
          <div className="ml-auto max-w-xs">
            {searchResults.length > 0 ? (
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.slice(0, 10).map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleSearchResultSelect(room)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {room.logo && (
                        <img
                          src={room.logo}
                          alt={room.name}
                          className="w-8 h-8 object-contain rounded border"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {room.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Kat {room.floor === 0 ? 'Zemin' : room.floor}
                          {room.category && ` • ${room.category}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  "{searchQuery}" için sonuç bulunamadı
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      {!isKioskMode && !isSidebarOpen && (
        <button
          onClick={() => {
            setIsSidebarOpen(true);
            setIsAssistantOpen(false);
          }}
          className="hidden fixed top-4 left-4 z-[60] p-3 bg-gradient-to-br from-brand to-brand-dark rounded-full shadow-lg shadow-brand/30 hover:shadow-xl hover:scale-110 transition-all border border-brand/20 group"
          title="Paneli Aç"
        >
          <Menu className="w-5 h-5 text-white" />
          <div className="absolute inset-0 rounded-full bg-brand opacity-0 group-hover:opacity-20 animate-ping pointer-events-none"></div>
        </button>
      )}
    </>
  );
};

export default MapHeader;
