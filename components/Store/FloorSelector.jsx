'use client';
import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

const FloorSelector = ({
  currentFloor,
  floors = [0, 1, 2],
  onFloorChange,
  isOpen,
  onToggle,
}) => {
  const getFloorLabel = floor => {
    if (floor === 0) return 'Z';
    if (floor === -1) return 'B';
    return floor;
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 px-1 py-0.5">
      <div className="flex flex-col items-center gap-0.5">
        {/* Kat Başlığı */}
        <button
          onClick={onToggle}
          className="flex items-center gap-0.5 text-[9px] font-bold text-[#00334E] tracking-wider hover:text-[#00334E]/80 transition-colors cursor-pointer px-0.5"
        >
          <Building2 className="w-2 h-2" />
          <span>KAT</span>
          <ChevronDown
            className={`w-2 h-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Ayırıcı Çizgi */}
        <div className="w-5 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Kat Butonları */}
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => onFloorChange(floor)}
            className={`w-6 h-6 rounded-md font-bold text-xs
              transition-all duration-200 hover:scale-110 relative
              ${
                currentFloor === floor
                  ? 'bg-gradient-to-br from-[#00334E] to-[#00334E]/90 text-white shadow-md shadow-[#00334E]/30 scale-105'
                  : 'bg-gray-50 text-[#00334E] hover:bg-[#00334E]/10 hover:text-[#00334E] hover:shadow-sm'
              }`}
          >
            {getFloorLabel(floor)}
            {currentFloor === floor && (
              <div className="absolute inset-0 rounded-md ring-1 ring-[#00334E]/50 ring-offset-1"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FloorSelector;
