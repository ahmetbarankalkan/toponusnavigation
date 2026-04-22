'use client';

import { Search, Mic, ArrowUpDown } from 'lucide-react';

export default function SearchBar({
  isSelectingStartRoom,
  routeSteps,
  searchQuery,
  setSearchQuery,
  setShowSearchDropdown,
  setIsSearchFocused,
  handleVoiceButtonClick,
  isRecording,
  isVoiceProcessing,
  startQuery,
  setStartQuery,
  setShowStartDropdown,
  endQuery,
  setEndQuery,
  setShowEndDropdown,
  handleFinish,
  selectedStartRoom,
  selectedEndRoom,
  setSelectedStartRoom,
  setStartQuery: setStartQueryProp,
  setSelectedEndRoom,
  setEndQuery: setEndQueryProp,
  rooms,
  showStartDropdown,
  showEndDropdown,
  setActiveNavItem,
  setIsCardMinimized,
  setIsAssistantOpen,
}) {
  if (!isSelectingStartRoom && !routeSteps.length) {
    // Normal arama modu
    return (
      <div className="relative flex items-center justify-between gap-3">
        <img
          src="/ankamall-logo.png"
          alt="ANKAmall"
          className="object-contain transition-all duration-500 ease-in-out h-12 w-32"
          style={{ maxWidth: 'none' }}
        />

        <div className="relative flex-1 transition-all duration-300">
          <input
            type="text"
            placeholder="Ara"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) {
                setShowSearchDropdown(true);
                setIsAssistantOpen && setIsAssistantOpen(false);
              } else {
                setShowSearchDropdown(false);
              }
            }}
            onFocus={() => {
              setIsSearchFocused(true);
              setIsAssistantOpen && setIsAssistantOpen(false);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsSearchFocused(false);
                setShowSearchDropdown(false);
              }, 200);
            }}
            className="w-full h-12 bg-white/95 backdrop-blur-md border-2 border-brand-darkest/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-darkest focus:border-brand-darkest shadow-lg hover:shadow-xl transition-all pl-12 pr-14"
          />

          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-darkest pointer-events-none transition-transform" />

          <button
            onClick={handleVoiceButtonClick}
            disabled={isVoiceProcessing}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'hover:bg-brand-light text-brand-darkest'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Rota seçim modu
  return (
    <div className="relative">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
        {/* Başlangıç Noktası */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Başlangıç noktası seçin"
              value={startQuery}
              onChange={e => {
                setStartQuery(e.target.value);
                setShowStartDropdown(true);
                setIsAssistantOpen && setIsAssistantOpen(false);
              }}
              onFocus={() => {
                setShowStartDropdown(true);
                setIsAssistantOpen && setIsAssistantOpen(false);
              }}
              onBlur={() => {
                setTimeout(() => setShowStartDropdown(false), 200);
              }}
              className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-500"
            />

            {/* Başlangıç Dropdown */}
            {showStartDropdown && startQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-[60]">
                {rooms
                  .filter(r =>
                    r.name.toLowerCase().includes(startQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedStartRoom(r.id);
                        setStartQuery(r.name);
                        setShowStartDropdown(false);
                        setActiveNavItem(0);
                        setIsCardMinimized(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      {r.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={handleFinish}
            className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Bitiş Noktası */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Hedef noktası seçin"
              value={endQuery}
              onChange={e => {
                setEndQuery(e.target.value);
                setShowEndDropdown(true);
                setIsAssistantOpen && setIsAssistantOpen(false);
              }}
              onFocus={() => {
                setShowEndDropdown(true);
                setIsAssistantOpen && setIsAssistantOpen(false);
              }}
              onBlur={() => {
                setTimeout(() => setShowEndDropdown(false), 200);
              }}
              className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-500"
            />

            {/* Bitiş Dropdown */}
            {showEndDropdown && endQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-[60]">
                {rooms
                  .filter(r =>
                    r.name.toLowerCase().includes(endQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map(r => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedEndRoom(r.id);
                        setEndQuery(r.name);
                        setShowEndDropdown(false);
                        setActiveNavItem(0);
                        setIsCardMinimized(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      {r.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const tempStartRoom = selectedStartRoom;
              const tempStartQuery = startQuery;
              setSelectedStartRoom(selectedEndRoom);
              setStartQuery(endQuery);
              setSelectedEndRoom(tempStartRoom);
              setEndQuery(tempStartQuery);
            }}
            className="p-1.5 text-gray-400 hover:text-brand-darkest hover:bg-brand-light rounded-lg transition-all flex-shrink-0"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
