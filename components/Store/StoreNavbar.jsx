'use client';
import React from 'react';
import SearchBar from './SearchBar';

const StoreNavbar = ({
  logoSrc,
  logoAlt = 'Logo',
  searchValue,
  onSearchChange,
  onVoiceSearch,
  searchPlaceholder = 'Ara',
}) => {
  return (
    <div className="relative z-10 flex items-center px-3 py-2 h-full gap-2 md:gap-3">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="h-8 md:h-10 w-auto object-contain max-w-[100px] md:max-w-[160px]"
        />
      </div>

      {/* Arama Çubuğu */}
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        onVoiceSearch={onVoiceSearch}
        placeholder={searchPlaceholder}
      />
    </div>
  );
};

export default StoreNavbar;
