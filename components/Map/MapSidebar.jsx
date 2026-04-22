import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation, Sparkles, Settings, ChevronLeft } from 'lucide-react';

const MapSidebar = ({
  isKioskMode,
  isSidebarOpen,
  setIsSidebarOpen,
  setIsAssistantOpen,
}) => {
  // Hydration-safe mounting check
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return null during SSR and initial client render to prevent hydration mismatch
  if (!isMounted) return null;
  
  if (isKioskMode) return null;

  return (
    <div
      className={`hidden h-screen bg-white/95 backdrop-blur-md overflow-y-auto order-0 shadow-lg transition-all duration-300 relative z-10 ${
        isSidebarOpen ? 'w-80' : 'w-0'
      }`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-brand-light to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center shadow-lg shadow-brand/30">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              SIGNOASSIST
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Explore in your walk</span>
            </p>
          </div>
          {/* Admin Panel Link */}
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-brand-light transition-all text-gray-600 hover:text-brand-dark"
            title="Admin Panel"
          >
            <Settings className="w-5 h-5" />
          </Link>
          {/* Toggle Button */}
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              if (!isSidebarOpen) {
                setIsAssistantOpen(false);
              }
            }}
            className="p-2 rounded-lg hover:bg-brand-light transition-all text-gray-600 hover:text-brand-dark"
            title={isSidebarOpen ? 'Paneli Kapat' : 'Paneli Aç'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSidebar;
