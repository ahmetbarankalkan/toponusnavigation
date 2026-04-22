'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Bot, Send } from 'lucide-react';

export default function AiAssistantPage() {
  useEffect(() => {
    // Dinamik stil ekleme
    const styleId = 'kiosk-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 2rem;
          overflow: hidden;
        }

        .kiosk-frame {
          width: 100%;
          max-width: 480px;
          height: 95vh;
          max-height: 1000px;
          background-color: #1a1a1a;
          border: 16px solid #0f0f0f;
          border-radius: 48px;
          box-shadow: 
            0 0 0 2px #2a2a2a,
            0 30px 80px rgba(0, 0, 0, 0.8),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .kiosk-screen {
          flex: 1;
          background-color: #1c1924; 
          padding: 1.25rem;
          overflow-y: auto;
          position: relative;
        }

        .kiosk-screen::before {
          content: '';
          position: absolute;
          top: -25%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 60%;
          background: radial-gradient(circle, rgba(192, 38, 211, 0.35), transparent 70%);
          filter: blur(120px);
          z-index: 0;
          pointer-events: none;
        }

        .kiosk-screen::-webkit-scrollbar {
          width: 4px;
        }

        .kiosk-screen::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Kiosk Çerçevesi */}
      <div className="kiosk-frame">
        {/* Kiosk Ekran İçeriği */}
        <div className="kiosk-screen">
          <div className="relative z-10">
            {/* Geri Butonu ve Başlık */}
            <header className="flex items-center gap-4 mb-6">
              <Link
                href="/kiosk"
                className="bg-gray-800/80 hover:bg-gray-700 rounded-full p-2 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">AI Asistan</h1>
            </header>

            {/* Ana İçerik */}
            <main className="flex flex-col h-[calc(100%-5rem)]">
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {/* Welcome Message */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-gradient-to-br from-purple-900/40 to-pink-900/30 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={20} className="text-purple-400" />
                      <span className="text-white font-semibold text-sm">
                        Toponus AI
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Merhaba! 👋 Ben Toponus AI, navigasyon asistanınızım.
                      <br />
                      <br />
                      Size nasıl yardımcı olabilirim?
                    </p>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="space-y-3">
                  <p className="text-white/60 text-xs text-center">
                    Hızlı Sorular:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 backdrop-blur-sm hover:from-blue-900/40 hover:to-cyan-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-blue-500/20 text-left">
                      <span className="block mb-1.5 text-lg">🏬</span>
                      <span className="font-medium">AVM Bilgileri</span>
                    </button>
                    <button className="bg-gradient-to-br from-orange-900/30 to-red-900/20 backdrop-blur-sm hover:from-orange-900/40 hover:to-red-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-orange-500/20 text-left">
                      <span className="block mb-1.5 text-lg">🔥</span>
                      <span className="font-medium">Kampanyalar</span>
                    </button>
                    <button className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm hover:from-green-900/40 hover:to-emerald-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-green-500/20 text-left">
                      <span className="block mb-1.5 text-lg">🗺️</span>
                      <span className="font-medium">Harita</span>
                    </button>
                    <button className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 backdrop-blur-sm hover:from-yellow-900/40 hover:to-amber-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-yellow-500/20 text-left">
                      <span className="block mb-1.5 text-lg">🎉</span>
                      <span className="font-medium">Etkinlikler</span>
                    </button>
                    <button className="bg-gradient-to-br from-pink-900/30 to-rose-900/20 backdrop-blur-sm hover:from-pink-900/40 hover:to-rose-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-pink-500/20 text-left">
                      <span className="block mb-1.5 text-lg">🏪</span>
                      <span className="font-medium">Mağazalar</span>
                    </button>
                    <button className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-sm hover:from-indigo-900/40 hover:to-purple-900/30 text-white text-xs py-4 px-3 rounded-xl transition-all border border-indigo-500/20 text-left">
                      <span className="block mb-1.5 text-lg">📱</span>
                      <span className="font-medium">Yardım</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-purple-500/20 pt-4">
                <div className="flex items-center gap-3">
                  <input
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-4 py-3 border border-purple-500/30 rounded-full text-sm bg-black/30 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />
                  <button className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-all shadow-lg">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
