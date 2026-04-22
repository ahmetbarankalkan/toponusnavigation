'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function YemekPage() {
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
              <h1 className="text-2xl font-bold text-white">Etkinlik</h1>
            </header>

            {/* Ana İçerik */}
            <main className="space-y-4">
              <p className="text-gray-300 text-center">
                Selfie içeriği buraya gelecek...
              </p>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
