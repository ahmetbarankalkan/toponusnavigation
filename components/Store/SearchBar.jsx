'use client';
import React from 'react';
import { Search, Mic } from 'lucide-react';

const SearchBar = ({ value, onChange, onVoiceSearch, placeholder = 'Ara' }) => {
  return (
    <div className="flex-1 md:max-w-sm md:ml-auto">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-9 md:h-10 bg-white/95 backdrop-blur-md border border-gray-300 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all pl-9 md:pl-10 pr-10 md:pr-12 text-gray-900 placeholder-gray-500"
          value={value}
          onChange={e => onChange(e.target.value)}
        />

        {/* Arama İkonu */}
        <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-gray-400 pointer-events-none" />

        {/* Ses Arama Butonu */}
        <div className="absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2">
          <button
            onClick={onVoiceSearch}
            className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600"
            aria-label="Sesli arama"
          >
            <Mic className="w-3.5 md:w-4 h-3.5 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
