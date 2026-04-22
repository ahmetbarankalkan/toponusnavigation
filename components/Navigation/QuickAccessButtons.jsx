/**
 * Quick Access Buttons Component
 * Hızlı erişim butonları (WC, Eczane, ATM vb.)
 */

import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  PersonStanding,
  Baby,
  DoorOpen,
  Flame,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

// İkon mapping
const iconMap = {
  pharmacy: HeartPulse,
  wc: PersonStanding,
  'baby-care': Baby,
  exit: DoorOpen,
  entrance: DoorOpen,
  'fire-exit': Flame,
  'emergency-exit': AlertTriangle,
  point: MapPin,
};

// Buton stilleri
const buttonStyles = {
  pharmacy: {
    active:
      'bg-gradient-to-r from-brand-dark to-brand-darkest text-white shadow-lg shadow-brand-dark/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  wc: {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  'baby-care': {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  exit: {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  entrance: {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  'fire-exit': {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  'emergency-exit': {
    active:
      'bg-gradient-to-r from-brand-dark to-brand-darkest text-white shadow-lg shadow-brand-dark/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
  point: {
    active:
      'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/30',
    inactive:
      'bg-white text-brand-darkest border border-brand-darkest hover:bg-brand-light',
  },
};

export default function QuickAccessButtons({
  locations,
  selectedLocation,
  onLocationClick,
}) {
  const handleScroll = direction => {
    const container = document.getElementById('quick-access-container');
    if (container) {
      const buttons = container.querySelectorAll('button');
      if (buttons.length > 0) {
        const buttonWidth = buttons[0].offsetWidth + 8;
        const scrollAmount = buttonWidth * 3;
        container.scrollLeft +=
          direction === 'right' ? scrollAmount : -scrollAmount;
      }
    }
  };

  return (
    <div className="mt-3 relative z-[200]">
      <div className="flex items-center gap-2">
        {/* Sol Ok */}
        <button
          onClick={() => handleScroll('left')}
          className="p-2.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-light/50 shadow-lg hover:shadow-xl hover:bg-brand-light hover:text-brand-darkest hover:border-brand-darkest transition-all flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Butonlar Container */}
        <div
          id="quick-access-container"
          className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 transition-all duration-300 ease-in-out"
        >
          {locations.map(location => {
            const style = buttonStyles[location.key] || buttonStyles.point;
            const Icon = iconMap[location.key] || MapPin;

            return (
              <button
                key={location.key}
                onClick={() => onLocationClick(location.key)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 shadow-sm hover:shadow-md ${
                  selectedLocation === location.key
                    ? style.active + ' scale-105'
                    : style.inactive
                }`}
              >
                <Icon size={14} className="flex-shrink-0" />
                <span>{location.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sağ Ok */}
        <button
          onClick={() => handleScroll('right')}
          className="p-2.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-light/50 shadow-lg hover:shadow-xl hover:bg-brand-light hover:text-brand-darkest hover:border-brand-darkest transition-all flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
