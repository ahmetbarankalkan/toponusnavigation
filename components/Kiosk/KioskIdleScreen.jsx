// components/Kiosk/KioskIdleScreen.jsx
'use client';

import { useState, useEffect } from 'react';
import { Store, MapPin, Sparkles, Info, Image } from 'lucide-react';
import Link from 'next/link';

export default function KioskIdleScreen({ placeName, onFeatureSelect }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mallInfo, setMallInfo] = useState(null);

  // Slayt görselleri (Admin panelden gelecek)
  const slides = [
    { id: 1, image: '/images/slide1.jpg', title: 'Yaz İndirimleri Başladı!' },
    { id: 2, image: '/images/slide2.jpg', title: 'Yeni Mağazalarımızı Keşfedin' },
    { id: 3, image: '/images/slide3.jpg', title: 'Hafta Sonu Canlı Müzik' },
    { id: 4, image: '/images/slide1.jpg', title: 'Gastronomi Katında Lezzet Şöleni' },
    { id: 5, image: '/images/slide2.jpg', title: 'Vizyondaki Filmlerle Sinema Keyfi' },
  ];

  // Otomatik slayt değişimi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // AVM bilgilerini çek
  useEffect(() => {
    async function fetchMallInfo() {
      try {
        const res = await fetch('/api/mall-info');
        const data = await res.json();
        if (!data.error) {
          setMallInfo(data);
        }
      } catch (error) {
        console.error('AVM bilgileri yüklenemedi:', error);
      }
    }
    fetchMallInfo();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8">
        {/* Header */}
        <div className="py-4 text-center flex-shrink-0">
          <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {placeName || 'AnkaMall'} Hoş Geldiniz
          </h1>
          <p className="text-xl text-blue-100/80 font-light">
            Ekrana dokunarak başlayın
          </p>
        </div>

        {/* Main Grid Layout - Görseldeki düzen */}
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-4xl space-y-4">
            {/* Üst Sıra: Mağaza (sol) + Konum (sağ) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Mağaza Butonu */}
              <Link
                href="/kiosk/rooms?slug=ankamall"
                className="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-h-[180px]"
              >
                <Store size={56} className="text-white mb-3" strokeWidth={2} />
                <h3 className="text-3xl font-bold">Mağaza</h3>
                <p className="text-lg text-white/90 mt-2">Mağaza Rehberi</p>
              </Link>

              {/* Konum Butonu */}
              <Link
                href="/kiosk/location?slug=ankamall"
                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-h-[180px]"
              >
                <MapPin size={56} className="text-white mb-3" strokeWidth={2} />
                <h3 className="text-3xl font-bold">Konum</h3>
                <p className="text-lg text-white/90 mt-2">Rota Al</p>
              </Link>
            </div>

            {/* Orta Sıra 1: Keşfet (tam genişlik) */}
            <Link
                href="/kiosk/discover?slug=ankamall"
                className="w-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-h-[180px]"
              >
                <div className="flex items-center gap-4">
                  <Image size={56} className="text-white" strokeWidth={2} />
                  <div className="text-left">
                    <h3 className="text-4xl font-bold">Keşfet</h3>
                    <p className="text-xl text-white/90 mt-1">
                      Etkinlikler, Kampanyalar ve Duyurular
                    </p>
                  </div>
                </div>
              </Link>

            {/* Orta Sıra 2: AVM Bilgi (sol) + Asistan (sağ) */}
            <div className="grid grid-cols-2 gap-4">
              {/* AVM Bilgi Butonu */}
              <button
                onClick={() => onFeatureSelect('info')}
                className="bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-h-[180px]"
              >
                <Info size={56} className="text-white mb-3" strokeWidth={2} />
                <h3 className="text-3xl font-bold">AVM Bilgi</h3>
                <p className="text-lg text-white/90 mt-2">
                  {mallInfo?.hours || '10:00 - 22:00'}
                </p>
              </button>

              {/* Asistan Butonu */}
              <button
                onClick={() => onFeatureSelect('assistant')}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-h-[180px]"
              >
                <Sparkles
                  size={56}
                  className="text-white mb-3"
                  strokeWidth={2}
                />
                <h3 className="text-3xl font-bold">Asistan</h3>
                <p className="text-lg text-white/90 mt-2">AI Yardımcı</p>
              </button>
            </div>

            {/* Alt Sıra: Resim Slayt (tam genişlik) */}
            <div className="relative rounded-3xl overflow-hidden min-h-[200px] bg-gradient-to-br from-gray-700 to-gray-800">
              {/* Slayt görselleri */}
              <div className="relative h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.backgroundColor = '#333'; }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-6 py-8">
                      <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg">
                        {slide.title}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slayt göstergeleri */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
