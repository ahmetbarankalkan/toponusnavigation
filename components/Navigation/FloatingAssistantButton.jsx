'use client';

import { Bot } from 'lucide-react';

export default function FloatingAssistantButton({ onClick }) {
  return (
    <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[90]">
      <button onClick={onClick} className="group relative">
        {/* Ana buton container */}
        <div className="relative">
          {/* Ana buton */}
          <div className="w-16 h-16 bg-gradient-to-r from-brand-darkest to-brand-dark rounded-full flex items-center justify-center shadow-2xl shadow-brand-darkest/40 group-hover:shadow-brand-darkest/60 transition-all group-hover:scale-110 assistant-pulse">
            <Bot size={28} className="text-white" />
          </div>

          {/* Yanıp sönen animasyon halkaları - 4 katman */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <div
              className="absolute inset-0 rounded-full bg-brand-darkest/25 animate-ping"
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-brand-darkest/20 animate-ping"
              style={{ animationDelay: '0.3s' }}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-brand-darkest/15 animate-ping"
              style={{ animationDelay: '0.6s' }}
            ></div>
            <div
              className="absolute inset-0 rounded-full bg-brand-darkest/10 animate-ping"
              style={{ animationDelay: '0.9s' }}
            ></div>
          </div>

          {/* Dış halka efekti */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-brand-darkest/20 to-brand-darkest/20 blur-md animate-pulse"></div>

          {/* Gradient border efekti */}
          <div className="absolute inset-0 rounded-full ring-4 ring-brand-darkest/30 group-hover:ring-6 group-hover:ring-brand-darkest/50 transition-all"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Asistan
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    </div>
  );
}
