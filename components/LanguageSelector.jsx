'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector({ isAssistantOpen }) {
  const { language, changeLanguage } = useLanguage();

  // Sadece asistan açıkken göster
  if (!isAssistantOpen) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] flex flex-col items-center gap-3">
      <span className="text-white text-lg font-semibold">Test</span>
      <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex items-center gap-1 border border-white/20 shadow-lg">
        <button
          onClick={() => changeLanguage('tr')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            language === 'tr'
              ? 'bg-white text-gray-900 font-semibold'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span className="text-lg">🇹🇷</span>
          <span className="text-sm">TR</span>
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            language === 'en'
              ? 'bg-white text-gray-900 font-semibold'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <span className="text-lg">🇬🇧</span>
          <span className="text-sm">EN</span>
        </button>
      </div>
    </div>
  );
}
