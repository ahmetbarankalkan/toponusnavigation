/**
 * Search Bar Component
 * Normal arama modu - Logo ve arama input'u
 */

import { Search, Mic } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onVoiceClick,
  isRecording,
  isVoiceProcessing,
  onFocus,
  onBlur,
}) {
  return (
    <div className="relative flex items-center justify-between gap-3">
      {/* ANKAmall Logo */}
      <img
        src="/ankamall-logo.png"
        alt="ANKAmall"
        className="object-contain transition-all duration-500 ease-in-out h-10 w-28"
        style={{ maxWidth: 'none' }}
      />

      {/* Arama Input */}
      <div className="relative flex-1 transition-all duration-300">
        <input
          type="text"
          placeholder="Ara"
          value={searchQuery}
          onChange={e => {
            onSearchChange(e.target.value);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full h-10 bg-white/95 backdrop-blur-md border-2 border-brand-darkest/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-darkest focus:border-brand-darkest shadow-lg hover:shadow-xl transition-all pl-10 pr-12"
        />

        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-darkest pointer-events-none transition-transform" />

        {/* Ses Butonu */}
        <button
          onClick={onVoiceClick}
          disabled={isVoiceProcessing}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'hover:bg-brand-light text-brand-darkest'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
