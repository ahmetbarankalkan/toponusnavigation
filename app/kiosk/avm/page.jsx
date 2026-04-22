'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AvmPage() {
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
              <h1 className="text-2xl font-bold text-white">AVM Bilgileri</h1>
            </header>

            {/* Ana İçerik */}
            <main className="space-y-6">
              {/* AVM Hakkında */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/20">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Ankamall AVM
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Ankara'nın Akköprü semtinde yer alan Ankamall, Türkiye'nin en
                  büyük alışveriş merkezlerinden biridir. 300'den fazla mağaza,
                  yemek katı, sinema ve eğlence alanlarına ev sahipliği yapar.
                </p>
              </div>

              {/* Açılış Kapanış Saatleri */}
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Çalışma Saatleri
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3">
                    <span className="text-gray-300 font-medium">Hafta İçi</span>
                    <span className="text-white font-semibold">
                      10:00 - 22:00
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3">
                    <span className="text-gray-300 font-medium">Cumartesi</span>
                    <span className="text-white font-semibold">
                      10:00 - 22:00
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3">
                    <span className="text-gray-300 font-medium">Pazar</span>
                    <span className="text-white font-semibold">
                      10:00 - 22:00
                    </span>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm rounded-2xl p-5 border border-green-500/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  İletişim
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-xs">Adres</p>
                      <p className="text-gray-200 text-sm">
                        Akköprü Mahallesi, Ankara
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-gray-400 text-xs">Telefon</p>
                      <p className="text-gray-200 text-sm">0312 XXX XX XX</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Öne Çıkan Mağazalar */}
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 backdrop-blur-sm rounded-2xl p-5 border border-orange-500/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  Öne Çıkan Mağazalar
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-white font-medium">IKEA</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-white font-medium">5M Migros</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-white font-medium">Sinema</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-white font-medium">Yemek Katı</p>
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
