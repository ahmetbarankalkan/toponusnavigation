'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function KioskContent() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({ temp: '--', condition: 'loading' });
  const [selectedStores, setSelectedStores] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Eğer kiosk=true parametresi varsa harita sayfasına yönlendir
  useEffect(() => {
    if (!isMounted) return;
    const isKioskMode = searchParams.get('kiosk') === 'true';

    if (isKioskMode) {
      router.push(
        '/?slug=ankamall&lat=39.95026307131235&lng=32.83056577782409&floor=0&kiosk=true'
      );
    }
  }, [searchParams, router]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Saat formatı (HH:MM)
      const hours = now
        .getHours()
        .toString()
        .padStart(2, '0');
      const minutes = now
        .getMinutes()
        .toString()
        .padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      // Tarih formatı (Gün adı, Ay Gün)
      const days = [
        'Pazar',
        'Pazartesi',
        'Salı',
        'Çarşamba',
        'Perşembe',
        'Cuma',
        'Cumartesi',
      ];
      const months = [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ];

      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const day = now.getDate();

      setCurrentDate(`${dayName}, ${day} ${monthName}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Ankara hava durumu
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Ankara,TR&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        );
        const data = await response.json();
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main.toLowerCase(),
          });
        }
      } catch (error) {
        console.error('Hava durumu alınamadı:', error);
        setWeather({ temp: '--', condition: 'unknown' });
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000); // Her 10 dakikada bir güncelle

    return () => clearInterval(weatherInterval);
  }, []);

  // Seçili mağazaları ve kampanyaları yükle
  useEffect(() => {
    const loadSelectedStores = async () => {
      try {
        // Önce places'i al
        const placesResponse = await fetch('/api/places');
        const placesData = await placesResponse.json();

        let placesArray = [];
        if (placesData.success && placesData.places) {
          placesArray = placesData.places;
        } else if (
          typeof placesData === 'object' &&
          !Array.isArray(placesData)
        ) {
          placesArray = Object.values(placesData);
        }

        if (placesArray.length === 0) return;

        // İlk place'i al (Ankamall)
        const place = placesArray[0];

        // Kiosk content ayarlarını al (public API gerekli)
        const contentResponse = await fetch(
          `/api/kiosk-content?placeId=${place.id}`
        );
        const contentData = await contentResponse.json();

        if (contentData.success && contentData.data?.selectedStores) {
          const storeIds = contentData.data.selectedStores;

          // Tüm rooms'u al
          const roomsResponse = await fetch(`/api/places/${place.slug}/rooms`);
          const roomsData = await roomsResponse.json();

          if (roomsData.success && roomsData.rooms) {
            // Seçili mağazaları filtrele
            const stores = roomsData.rooms.filter(room =>
              storeIds.includes(room.room_id)
            );
            setSelectedStores(stores);

            // Kampanyaları topla
            if (contentData.data?.selectedDiscounts) {
              const discountIds = contentData.data.selectedDiscounts;
              const allCampaigns = [];

              roomsData.rooms.forEach(room => {
                if (
                  room.content?.discounts &&
                  Array.isArray(room.content.discounts)
                ) {
                  room.content.discounts.forEach(discount => {
                    if (discountIds.includes(discount.id)) {
                      allCampaigns.push({
                        ...discount,
                        storeName: room.name,
                        storeId: room.room_id,
                      });
                    }
                  });
                }
              });

              // Maksimum 2 kampanya seç
              setCampaigns(allCampaigns.slice(0, 2));
            }
          }
        }
      } catch (error) {
        console.error('Mağazalar yüklenemedi:', error);
      }
    };

    loadSelectedStores();
  }, []);

  // Kampanya carousel - 10 saniyede bir değiş
  useEffect(() => {
    if (campaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCampaignIndex(prev => (prev + 1) % campaigns.length);
    }, 10000); // 10 saniye

    return () => clearInterval(interval);
  }, [campaigns.length]);

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

        /* Mobile responsive */
        @media (max-width: 768px) {
          body {
            padding: 0;
            align-items: stretch;
          }
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

        /* Mobile: Tam ekran, border yok */
        @media (max-width: 768px) {
          .kiosk-frame {
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
        }

        .kiosk-screen {
          flex: 1;
          background-color: #1c1924; 
          padding: 1.25rem;
          overflow-y: auto;
          position: relative;
        }

        /* Mobile: Daha az padding */
        @media (max-width: 768px) {
          .kiosk-screen {
            padding: 1rem;
          }
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

        .campaign-slide {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

  if (!isMounted) return null;

  return (
    <>
      {/* Kiosk Çerçevesi */}
      <div className="kiosk-frame">
        {/* Kiosk Ekran İçeriği */}
        <div className="kiosk-screen">
          <div className="relative z-10">
            {/* 1. Üst Bar (Saat, Logo, Hava Durumu) */}
            <header className="flex justify-between items-center text-gray-300 mb-4">
              {/* Saat ve Tarih */}
              <div className="text-left">
                <div className="text-lg sm:text-xl font-semibold text-white">
                  {currentTime}
                </div>
                <div className="text-xs text-gray-400">{currentDate}</div>
              </div>

              {/* Logo */}
              <div className="flex flex-col items-center">
                <img
                  src="/ankamall-logo.png"
                  alt="Ankamall"
                  className="h-10 sm:h-12 w-auto object-contain bg-white p-2 rounded border-2 border-white"
                />
              </div>

              {/* Hava Durumu */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="text-lg sm:text-xl font-semibold text-white">
                  {weather.temp}°C
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white sm:w-6 sm:h-6"
                >
                  {weather.condition === 'clear' && (
                    <circle cx="12" cy="12" r="5" />
                  )}
                  {weather.condition === 'clouds' && (
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                  )}
                  {weather.condition === 'rain' && (
                    <>
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                      <path d="M16 14v6m-4-6v6m-4-6v6" />
                    </>
                  )}
                  {(weather.condition === 'loading' ||
                    weather.condition === 'unknown') && (
                    <>
                      <path d="M12 3V1m0 20v-2m9-9h2M1 12H3m16.6-7.1L18 6.5M6 18l-1.4 1.4M18 17.5l1.4 1.4M6 6.5 4.6 5.1M16 12a4 4 0 1 1-8 0" />
                      <path d="M22 17c0-2.2-1.4-4-3.5-4h-1.5A5.5 5.5 0 0 0 8 9.5a5.8 5.8 0 0 0-4 5.5A3.7 3.7 0 0 0 7 21h12.5c.8 0 1.5-.7 1.5-1.5v-.5Z" />
                    </>
                  )}
                </svg>
              </div>
            </header>

            {/* Ana İçerik Alanı */}
            <main className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* 2. Sol Bölüm: Kategoriler ve Markalar */}
                <div className="lg:col-span-8 space-y-3">
                  {/* Kategori Kartları */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {/* Ürün Kartı */}
                    <Link
                      href="/kiosk/product"
                      className="relative h-20 sm:h-24 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <img
                        src="https://placehold.co/200x200/666/fff?text=Ürün"
                        alt="Dining"
                        className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50"></div>
                      <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-0.5 rounded-full">
                        Ürünler
                      </span>
                    </Link>

                    {/* Entertainment Kartı */}
                    <Link
                      href="/kiosk/events"
                      className="relative h-20 sm:h-24 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative h-20 sm:h-24 rounded-lg overflow-hidden group">
                        <img
                          src="https://placehold.co/200x200/555/fff?text=Etkinlik"
                          alt="Entertainment"
                          className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-0.5 rounded-full">
                          Etkinlik
                        </span>
                      </div>
                    </Link>
                    {/* Deals Kartı */}
                    <Link
                      href="/kiosk/discount"
                      className="relative h-20 sm:h-24 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <div className="relative h-20 sm:h-24 rounded-lg overflow-hidden group">
                        <img
                          src="https://placehold.co/200x200/444/fff?text=Fırsatlar"
                          alt=""
                          className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-0.5 rounded-full">
                          Fırsatlar
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Arama Çubuğu */}
                  <div className="relative">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Mağazaları, Restoranları ve Mağaza İçi Ürünleri Arayın"
                      className="w-full bg-gray-800/80 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filtre Çipleri */}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-700/80 text-gray-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-gray-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                      </svg>
                      İndirimler
                    </span>
                    <span className="bg-gray-700/80 text-gray-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-gray-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                      </svg>
                      Mağazalar
                    </span>

                    <span className="bg-gray-700/80 text-gray-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-gray-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                      </svg>
                      Pantolon
                    </span>
                    <span className="bg-gray-700/80 text-gray-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-gray-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                      </svg>
                      Aksesuar
                    </span>
                  </div>

                  {/* Marka Logoları - Admin panelinden seçilen mağazalar */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {selectedStores.length > 0 ? (
                      <>
                        {selectedStores.slice(0, 8).map((store, index) => (
                          <Link
                            key={store.room_id || index}
                            href={`/?slug=ankamall&lat=39.95026307131235&lng=32.83056577782409&floor=0&kiosk=true&to=${encodeURIComponent(
                              store.name
                            )}`}
                            className="h-14 sm:h-16 bg-white rounded-lg flex items-center justify-center p-1.5 sm:p-2 text-black font-bold text-xs tracking-tighter cursor-pointer hover:bg-gray-100 transition-colors"
                            title={store.name}
                          >
                            {store.content?.logo ? (
                              <img
                                src={store.content.logo}
                                alt={store.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : store.content?.brand ? (
                              <span className="text-center line-clamp-2">
                                {store.content.brand}
                              </span>
                            ) : (
                              <span className="text-center line-clamp-2">
                                {store.name}
                              </span>
                            )}
                          </Link>
                        ))}
                        {/* Boş kutular (8'e tamamla) */}
                        {Array.from({
                          length: Math.max(0, 8 - selectedStores.length),
                        }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="h-14 sm:h-16 bg-white rounded-lg"
                          ></div>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Yükleniyor veya boş durum */}
                        <div className="h-14 sm:h-16 bg-white rounded-lg flex items-center justify-center p-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black sm:w-6 sm:h-6"
                          >
                            <path d="M4 4h4v4H4zM6 8v12m8-12h4v4h-4zm2 4v12M12 4V2M12 22v-2" />
                            <circle cx="6" cy="3" r="1" />
                            <circle cx="18" cy="3" r="1" />
                          </svg>
                        </div>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={`placeholder-${i}`}
                            className="h-14 sm:h-16 bg-white rounded-lg"
                          ></div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Kategori Butonları */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/kiosk/stores"
                      className="bg-gray-800/80 rounded-lg py-3 text-xs font-medium flex items-center justify-center gap-2 text-white hover:bg-gray-700"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                      </svg>
                      <span className="leading-none">Mağazalar</span>
                    </Link>
                    <Link
                      href="/kiosk/categories"
                      className="bg-gray-800/80 rounded-lg py-3 text-xs font-medium flex items-center justify-center text-white hover:bg-gray-700 relative"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 absolute left-4"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span className="leading-none">Kategori</span>
                    </Link>
                    <Link
                      href="/kiosk/categories"
                      className="bg-gray-800/80 rounded-lg py-3 text-xs font-medium flex items-center justify-center text-white hover:bg-gray-700 relative"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 absolute left-4"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span className="leading-none">null</span>
                    </Link>
                    <Link
                      href="/kiosk/categories"
                      className="bg-gray-800/80 rounded-lg py-3 text-xs font-medium flex items-center justify-center text-white hover:bg-gray-700 relative"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 absolute left-4"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <span className="leading-none">null</span>
                    </Link>
                  </div>
                </div>

                {/* Araç Kartları */}
                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <Link
                    href="/?slug=ankamall&lat=39.95026307131235&lng=32.83056577782409&floor=0&kiosk=true"
                    className="relative h-24 lg:h-[6.8rem] rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src="https://placehold.co/200x200/555/fff?text=Harita"
                      alt="Center Map"
                      className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-1 rounded-full">
                      Harita
                    </span>
                  </Link>

                  <Link
                    href="/kiosk/avm"
                    className="relative h-24 lg:h-[6.8rem] rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src="https://placehold.co/200x200/555/fff?text=AVM"
                      alt="Center Map"
                      className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-1 rounded-full">
                      AVM
                    </span>
                  </Link>

                  <Link
                    href="/kiosk/selfie"
                    className="relative h-24 lg:h-[6.8rem] rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src="https://placehold.co/200x200/666/fff?text=Selfie"
                      alt="Take a Selfie"
                      className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-1 rounded-full">
                      Selfie Çek
                    </span>
                  </Link>

                  <Link
                    href="/kiosk/ai"
                    className="relative h-24 lg:h-[6.8rem] rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src="https://placehold.co/200x200/777/fff?text=Ai"
                      alt="Ai"
                      className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs font-medium bg-white/90 text-black px-2 py-1 rounded-full">
                      Ai
                    </span>
                  </Link>
                </div>
              </div>

              {/* 4. Alt Banner - Kampanyalar */}
              <div className="relative rounded-lg h-32 sm:h-40 overflow-hidden">
                {campaigns.length > 0 ? (
                  <div
                    key={currentCampaignIndex}
                    className="campaign-slide relative w-full h-full"
                  >
                    {/* Arka Plan Görseli */}
                    {campaigns[currentCampaignIndex].image ? (
                      <img
                        src={campaigns[currentCampaignIndex].image}
                        alt={campaigns[currentCampaignIndex].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-blue-300 to-yellow-200" />
                    )}

                    {/* Koyu Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* İçerik */}
                    <div className="relative z-10 h-full flex items-center justify-between p-3 sm:p-4 gap-2 sm:gap-4">
                      {/* Sol Taraf - Kampanya Bilgisi */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base sm:text-xl mb-1 sm:mb-2 drop-shadow-lg line-clamp-1">
                          {campaigns[currentCampaignIndex].title}
                        </h3>
                        <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3 drop-shadow line-clamp-2">
                          {campaigns[currentCampaignIndex].description}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
                          {campaigns[currentCampaignIndex].discount && (
                            <span className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                              %{campaigns[currentCampaignIndex].discount}{' '}
                              İndirim
                            </span>
                          )}
                          {campaigns[currentCampaignIndex].oldPrice &&
                            campaigns[currentCampaignIndex].newPrice && (
                              <div className="flex items-center gap-1 sm:gap-2 bg-white/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                <span className="text-gray-500 line-through text-xs sm:text-sm">
                                  {campaigns[currentCampaignIndex].oldPrice} TL
                                </span>
                                <span className="text-green-600 font-bold text-sm sm:text-base">
                                  {campaigns[currentCampaignIndex].newPrice} TL
                                </span>
                              </div>
                            )}
                        </div>
                        <div className="text-xs sm:text-sm text-white/80 drop-shadow">
                          📍 {campaigns[currentCampaignIndex].storeName}
                        </div>
                      </div>

                      {/* Sağ Taraf - Gösterge */}
                      {campaigns.length > 1 && (
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          {campaigns.map((_, index) => (
                            <div
                              key={index}
                              className={`rounded-full transition-all shadow-lg ${
                                index === currentCampaignIndex
                                  ? 'bg-white w-2.5 h-2.5 sm:w-3 sm:h-3'
                                  : 'bg-white/50 w-1.5 h-1.5 sm:w-2 sm:h-2'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-blue-300 to-yellow-200" />
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="text-center text-white drop-shadow-lg">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="font-bold text-lg">Kampanyalar</div>
                        <div className="text-sm opacity-80">
                          Yakında harika fırsatlar!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. QR Kod Bölümü - Kiosk Akıllı Asistan */}
              <div className="relative bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-lg p-3 sm:p-4 h-32 sm:h-40 overflow-hidden">
                <div className="relative z-10 flex items-center justify-between h-full gap-3 sm:gap-6">
                  {/* Sol Taraf - Metin */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-2xl font-extrabold text-white drop-shadow-lg leading-tight">
                      Kiosk Akıllı Asistan Cebinizde
                    </h3>
                  </div>

                  {/* Sağ Taraf - QR Kod */}
                  <div className="bg-white p-2 sm:p-3 rounded-xl shadow-2xl">
                    <QRCodeSVG
                      value="https://clownfish-app-cc787.ondigitalocean.app/?slug=ankamall"
                      size={80}
                      level="H"
                      includeMargin={false}
                      className="w-20 h-20 sm:w-[100px] sm:h-[100px]"
                    />
                  </div>
                </div>

                {/* Dekoratif Elementler */}
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function KioskPage() {
  return (
    <Suspense fallback={null}>
      <KioskContent />
    </Suspense>
  );
}
