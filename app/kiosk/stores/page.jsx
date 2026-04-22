'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);

      // Önce place'i slug ile bul
      const placeResponse = await fetch('/api/places?slug=ankamall');
      const placeData = await placeResponse.json();

      if (!placeData.place_id) {
        console.error('Place bulunamadı');
        setStores([]);
        return;
      }

      // Place_id ile rooms'u çek
      const roomsResponse = await fetch(
        `/api/rooms?place_id=${placeData.place_id}`
      );
      const roomsData = await roomsResponse.json();

      // Tüm katlardan mağazaları topla
      const allStores = [];
      Object.keys(roomsData).forEach(floor => {
        if (roomsData[floor].features) {
          roomsData[floor].features.forEach(feature => {
            const props = feature.properties;
            // Sadece mağazaları al (type: store veya category varsa)
            if (props.type === 'store' || props.category) {
              allStores.push({
                id: props.id,
                name: props.name,
                floor: props.floor,
                category: props.category || 'Genel',
                logo: props.logo,
                type: props.type,
              });
            }
          });
        }
      });

      // İsme göre sırala
      allStores.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      setStores(allStores);
    } catch (error) {
      console.error('Mağazalar yüklenirken hata:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const getFloorText = floor => {
    if (floor === 0) return 'Zemin Kat';
    if (floor === -1) return 'Bodrum Kat';
    return `Kat ${floor}`;
  };

  const getCategoryColor = category => {
    const colors = {
      giyim: 'from-purple-900/30 to-pink-900/20 border-purple-500/20',
      yemek: 'from-orange-900/30 to-red-900/20 border-orange-500/20',
      elektronik: 'from-blue-900/30 to-cyan-900/20 border-blue-500/20',
      kozmetik: 'from-pink-900/30 to-rose-900/20 border-pink-500/20',
      market: 'from-green-900/30 to-emerald-900/20 border-green-500/20',
      ev: 'from-yellow-900/30 to-amber-900/20 border-yellow-500/20',
      spor: 'from-indigo-900/30 to-purple-900/20 border-indigo-500/20',
      eğlence: 'from-red-900/30 to-pink-900/20 border-red-500/20',
      kafe: 'from-green-900/30 to-emerald-900/20 border-green-500/20',
    };

    const categoryLower = category.toLowerCase();
    for (const key in colors) {
      if (categoryLower.includes(key)) {
        return colors[key];
      }
    }
    return 'from-gray-900/30 to-slate-900/20 border-gray-500/20';
  };
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
              <h1 className="text-2xl font-bold text-white">Mağazalar</h1>
            </header>

            <main className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-white text-sm">
                    Mağazalar yükleniyor...
                  </div>
                </div>
              ) : stores.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-400 text-sm">
                    Henüz mağaza eklenmemiş
                  </div>
                </div>
              ) : (
                stores.map(store => (
                  <div
                    key={store.id}
                    className={`bg-gradient-to-br ${getCategoryColor(
                      store.category
                    )} backdrop-blur-sm rounded-xl p-4 hover:opacity-80 transition-all border cursor-pointer`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {store.logo ? (
                          <img
                            src={store.logo}
                            alt={store.name}
                            className="w-full h-full object-contain p-1"
                            onError={e => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-gray-800 font-bold text-xs">${store.name.charAt(
                                0
                              )}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-gray-800 font-bold text-xs">
                            {store.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">
                          {store.name}
                        </h3>
                        <p className="text-gray-300 text-xs">
                          {getFloorText(store.floor)} - {store.category}
                        </p>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-400"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
