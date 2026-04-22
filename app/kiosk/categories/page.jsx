'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  useEffect(() => {
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
      <div className="kiosk-frame">
        <div className="kiosk-screen">
          <div className="relative z-10">
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
              <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
            </header>

            <main className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Giyim & Moda */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-purple-900/40 hover:to-pink-900/30 transition-all border border-purple-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-purple-400"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Giyim & Moda
                    </span>
                  </div>
                </div>

                {/* Yemek & Kafe */}
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-orange-900/40 hover:to-red-900/30 transition-all border border-orange-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-orange-400"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Yemek & Kafe
                    </span>
                  </div>
                </div>

                {/* Elektronik */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-blue-900/40 hover:to-cyan-900/30 transition-all border border-blue-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-400"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Elektronik
                    </span>
                  </div>
                </div>

                {/* Kozmetik & Parfüm */}
                <div className="bg-gradient-to-br from-pink-900/30 to-rose-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-pink-900/40 hover:to-rose-900/30 transition-all border border-pink-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-pink-400"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Kozmetik
                    </span>
                  </div>
                </div>

                {/* Market */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-green-900/40 hover:to-emerald-900/30 transition-all border border-green-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-green-400"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Market
                    </span>
                  </div>
                </div>

                {/* Ev & Yaşam */}
                <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-yellow-900/40 hover:to-amber-900/30 transition-all border border-yellow-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-yellow-400"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Ev & Yaşam
                    </span>
                  </div>
                </div>

                {/* Spor & Outdoor */}
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-indigo-900/40 hover:to-purple-900/30 transition-all border border-indigo-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-indigo-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Spor & Outdoor
                    </span>
                  </div>
                </div>

                {/* Sinema & Eğlence */}
                <div className="bg-gradient-to-br from-red-900/30 to-pink-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-red-900/40 hover:to-pink-900/30 transition-all border border-red-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-400"
                      >
                        <rect x="2" y="7" width="20" height="15" rx="2" />
                        <polyline points="17 2 12 7 7 2" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Eğlence
                    </span>
                  </div>
                </div>

                {/* Aksesuar & Ayakkabı */}
                <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-teal-900/40 hover:to-cyan-900/30 transition-all border border-teal-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-teal-400"
                      >
                        <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
                        <path d="M11 3 8 9l4 13 4-13-3-6" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Aksesuar
                    </span>
                  </div>
                </div>

                {/* Kitap & Kırtasiye */}
                <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/20 backdrop-blur-sm rounded-2xl p-5 hover:from-violet-900/40 hover:to-purple-900/30 transition-all border border-violet-500/20 cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-violet-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-violet-400"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">
                      Kitap
                    </span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
