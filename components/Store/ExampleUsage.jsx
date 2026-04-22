'use client';
import React, { useState } from 'react';
import { FloorSelector, StoreNavbar, StoreInfoPanel } from '@/components/Store';

/**
 * Store bileşenlerinin örnek kullanımı
 * Bu dosya, tüm bileşenlerin nasıl kullanılacağını gösterir
 */
export default function ExampleUsage() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isFloorMenuOpen, setIsFloorMenuOpen] = useState(false);

  // Örnek mağaza verisi
  const exampleStore = {
    id: 'room-101',
    name: '5M Migros',
    floor: 0,
    logo: '/migros-logo.png',
    hours: '08.00-22.00',
    phone: '0850 200 40 00',
    website: 'migros.com',
    services: [
      'Tıkla Gel Al (Online siparişi mağazadan teslim alma)',
      'iade/değişim kabul',
      'Money Kart/Money Pay işlemleri',
      'ürün teslimatı (Sanal Market üzerinden)',
    ],
  };

  const handleVoiceSearch = () => {
    console.log('Sesli arama başlatıldı');
    // Sesli arama fonksiyonunu buraya ekleyin
  };

  const handleNavigate = store => {
    console.log('Yol tarifi alınıyor:', store);
    // Navigasyon fonksiyonunu buraya ekleyin
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <StoreNavbar
          logoSrc="/ankamall-logo.png"
          logoAlt="Ankamall Logo"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onVoiceSearch={handleVoiceSearch}
          searchPlaceholder="Mağaza ara..."
        />
      </header>

      {/* Ana İçerik */}
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Store Bileşenleri Demo</h1>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedStore(exampleStore)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Mağaza Detayını Göster
            </button>

            <div className="text-sm text-gray-600">
              <p>Arama değeri: {searchValue || '(boş)'}</p>
              <p>Aktif kat: {currentFloor}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Kat Seçici - Sağ üstte sabit */}
      <div className="fixed right-4 top-20 z-50">
        <FloorSelector
          currentFloor={currentFloor}
          floors={[-1, 0, 1, 2]}
          onFloorChange={setCurrentFloor}
          isOpen={isFloorMenuOpen}
          onToggle={() => setIsFloorMenuOpen(!isFloorMenuOpen)}
        />
      </div>

      {/* Mağaza Detay Paneli */}
      <StoreInfoPanel
        store={selectedStore}
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        onNavigate={handleNavigate}
        user={null}
        isAuthenticated={false}
      />
    </div>
  );
}
