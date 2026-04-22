'use client';

import Link from 'next/link';
import {
  Navigation,
  Sparkles,
  Settings,
  ChevronLeft,
  Menu,
} from 'lucide-react';

export function Sidebar({ isOpen, onToggle }) {
  return (
    <div
      className={`hidden lg:block h-screen bg-white/95 backdrop-blur-md overflow-y-auto order-0 shadow-lg transition-all duration-300 relative z-10 ${
        isOpen ? 'w-80' : 'w-0'
      }`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-brand-light to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
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
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-brand-light transition-all text-gray-600 hover:text-brand-dark"
            title={isOpen ? 'Paneli Kapat' : 'Paneli Aç'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SidebarToggleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hidden lg:block fixed top-4 left-4 z-[60] p-3 bg-gradient-to-br from-brand to-brand-dark rounded-full shadow-lg shadow-brand/30 hover:shadow-xl hover:scale-110 transition-all border border-brand/20 group"
      title="Paneli Aç"
    >
      <Menu className="w-5 h-5 text-white" />
      <div className="absolute inset-0 rounded-full bg-brand opacity-0 group-hover:opacity-20 animate-ping pointer-events-none"></div>
    </button>
  );
}
