'use client';

import React from 'react';
import { Search } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  setShowSearchDropdown,
  setIsSearchFocused,
  setIsAssistantOpen,
}) {
  return (
    <div
      className="relative w-full h-20 pt-safe-top rounded-3xl overflow-hidden"
      style={{ backgroundColor: '#2A5A6B' }}
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
        className="absolute inset-0 w-full h-full opacity-10 rounded-2xl"
        style={{
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
              className="w-full h-9 md:h-10 bg-white/95 backdrop-blur-md border border-gray-300 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all pl-9 md:pl-10 pr-10 md:pr-12 text-gray-900 placeholder-gray-500"
            />
            {/* Search Icon */}
            <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-gray-400 pointer-events-none" />
            {/* Microphone Icon */}
            <div className="absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2">
              <button className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-3.5 md:w-4 h-3.5 md:h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
