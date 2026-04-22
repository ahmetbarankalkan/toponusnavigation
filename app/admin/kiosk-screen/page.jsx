'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function KioskScreenPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('kiosk-screen');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Veri state'leri
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [allStores, setAllStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auth kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Places yükle
  useEffect(() => {
    if (!user) return;

    const loadPlaces = async () => {
      try {
        const response = await fetch('/api/places');
        const data = await response.json();

        // API object döndürüyor, array'e çevir
        let placesArray = [];
        if (data.success && data.places) {
          placesArray = data.places;
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          // Object ise array'e çevir
          placesArray = Object.values(data);
        }

        setPlaces(placesArray);

        // Ankamall'ı otomatik seç
        const ankamall = placesArray.find(p => p.slug === 'ankamall');
        if (ankamall) {
          setSelectedPlace(ankamall);
        } else if (placesArray.length > 0) {
          setSelectedPlace(placesArray[0]);
        }
      } catch (error) {
        console.error('Places yükleme hatası:', error);
      }
    };

    loadPlaces();
  }, [user]);

  // Mağazaları ve fırsatları yükle
  useEffect(() => {
    if (!selectedPlace) return;

    const loadStoresAndDiscounts = async () => {
      setLoadingStores(true);
      try {
        const token = localStorage.getItem('admin_token');

        // Admin API kullan - tüm katları al
        const response = await fetch(
          `/api/admin/rooms?placeId=${selectedPlace.id}&floor=all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const rooms = await response.json();


        // Rooms array ise direkt kullan
        const roomsArray = Array.isArray(rooms) ? rooms : [];


        // Geçici: Tüm odaları göster (test için)
        // Daha sonra sadece mağazaları filtreleyeceğiz
        const stores = roomsArray;


        if (stores.length > 0) {

        }
        setAllStores(stores);

        // Tüm kampanyaları topla
        const discounts = [];
        roomsArray.forEach(room => {
          if (
            room.content?.discounts &&
            Array.isArray(room.content.discounts)
          ) {
            room.content.discounts.forEach(discount => {
              discounts.push({
                ...discount,
                storeName: room.name,
                storeId: room.room_id,
                floor: room.floor,
              });
            });
          }
        });
        setAllDiscounts(discounts);

        // Kaydedilmiş ayarları yükle
        try {
          const settingsResponse = await fetch(
            `/api/admin/kiosk-content?placeId=${selectedPlace.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const settingsData = await settingsResponse.json();
          if (settingsData.success && settingsData.data) {
            setSelectedStores(settingsData.data.selectedStores || []);
            setSelectedDiscounts(settingsData.data.selectedDiscounts || []);
          }
        } catch (error) {
          console.error('Ayarlar yüklenemedi:', error);
        }
      } catch (error) {
        console.error('Mağazalar yüklenemedi:', error);
      } finally {
        setLoadingStores(false);
      }
    };

    loadStoresAndDiscounts();
  }, [selectedPlace]);

  // Mağaza seçimi toggle (maksimum 8)
  const toggleStore = storeId => {
    setSelectedStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      } else {
        // Maksimum 8 mağaza kontrolü
        if (prev.length >= 8) {
          alert('Maksimum 8 mağaza seçebilirsiniz!');
          return prev;
        }
        return [...prev, storeId];
      }
    });
  };

  // Fırsat seçimi toggle
  const toggleDiscount = discountId => {
    setSelectedDiscounts(prev => {
      if (prev.includes(discountId)) {
        return prev.filter(id => id !== discountId);
      } else {
        return [...prev, discountId];
      }
    });
  };

  // Tümünü seç/kaldır (maksimum 8)
  const selectAllStores = () => {
    if (selectedStores.length > 0) {
      setSelectedStores([]);
    } else {
      // İlk 8 mağazayı seç
      const firstEight = allStores.slice(0, 8).map(s => s.room_id);
      setSelectedStores(firstEight);
      if (allStores.length > 8) {
        alert('Maksimum 8 mağaza seçilebilir. İlk 8 mağaza seçildi.');
      }
    }
  };

  const selectAllDiscounts = () => {
    if (selectedDiscounts.length === allDiscounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(allDiscounts.map(d => d.id));
    }
  };

  // Kaydet
  const handleSave = async () => {
    // Validasyon
    if (selectedStores.length === 0) {
      alert('Lütfen en az 1 mağaza seçin!');
      return;
    }

    if (selectedStores.length > 8) {
      alert('Maksimum 8 mağaza seçebilirsiniz!');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/kiosk-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placeId: selectedPlace.id,
          selectedStores,
          selectedDiscounts,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          `✅ Başarıyla kaydedildi!\n\n` +
            `📍 Birim: ${selectedPlace.name}\n` +
            `🏪 Mağazalar: ${selectedStores.length} adet\n` +
            `🎯 Kampanyalar: ${selectedDiscounts.length} adet`
        );
      } else {
        alert('❌ Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('❌ Kaydetme sırasında hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Başlık ve Birim Seçimi */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Kiosk Ekran Yönetimi</h1>
                <p className="text-gray-600 mt-2">
                  Kiosk ekranlarında gösterilecek mağazaları ve kampanyaları
                  seçin
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>

            {/* Birim Seçim Butonları */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Birim:</span>
              {places.length === 0 ? (
                <div className="text-sm text-gray-500">Yükleniyor...</div>
              ) : (
                <div className="flex gap-2">
                  {places.map(place => (
                    <button
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedPlace?.id === place.id
                          ? 'bg-brand text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {place.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Özet Bilgi */}
            {selectedPlace && (
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Seçili Mağazalar:</span>{' '}
                  <span
                    className={`font-bold text-lg ${
                      selectedStores.length >= 8 ? 'text-red-600' : 'text-brand'
                    }`}
                  >
                    {selectedStores.length} / 8
                  </span>
                </div>
                <div>
                  <span className="font-medium">Seçili Kampanyalar:</span>{' '}
                  <span className="text-brand font-bold text-lg">
                    {selectedDiscounts.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedPlace && (
            <>
              {/* Mağaza Seçimi */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    🏪 Mağazalar
                  </h2>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        selectedStores.length >= 8
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {selectedStores.length} / 8 seçili
                      {selectedStores.length >= 8 && ' (Maksimum)'}
                    </span>
                    <button
                      onClick={selectAllStores}
                      className="text-sm text-brand hover:text-brand-dark font-medium"
                    >
                      {selectedStores.length > 0
                        ? 'Tümünü Kaldır'
                        : "İlk 8'i Seç"}
                    </button>
                  </div>
                </div>

                {loadingStores ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Mağazalar yükleniyor...
                    </p>
                  </div>
                ) : allStores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {allStores.map(store => (
                      <div
                        key={store.room_id}
                        onClick={() => toggleStore(store.room_id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedStores.includes(store.room_id)
                            ? 'border-brand bg-brand-light'
                            : 'border-gray-200 hover:border-brand-light hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-gray-900 text-sm">
                            {store.name}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedStores.includes(store.room_id)}
                            onChange={() => {}}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            Kat {store.floor}
                          </span>
                          {store.content?.brand && (
                            <span className="text-xs text-brand-dark">
                              {store.content.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">Mağaza bulunamadı</p>
                    <p className="text-sm text-gray-400">
                      Seçili birim: {selectedPlace?.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Kampanya Seçimi */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    🎯 Kampanyalar
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {selectedDiscounts.length} / {allDiscounts.length} seçili
                    </span>
                    <button
                      onClick={selectAllDiscounts}
                      className="text-sm text-brand hover:text-brand-dark font-medium"
                    >
                      {selectedDiscounts.length === allDiscounts.length
                        ? 'Tümünü Kaldır'
                        : 'Tümünü Seç'}
                    </button>
                  </div>
                </div>

                {loadingStores ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Fırsatlar yükleniyor...
                    </p>
                  </div>
                ) : allDiscounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allDiscounts.map(discount => (
                      <div
                        key={discount.id}
                        onClick={() => toggleDiscount(discount.id)}
                        className={`border-2 rounded-lg cursor-pointer transition-all overflow-hidden ${
                          selectedDiscounts.includes(discount.id)
                            ? 'border-brand bg-brand-light'
                            : 'border-gray-200 hover:border-brand-light hover:bg-gray-50'
                        }`}
                      >
                        {discount.image && (
                          <div className="relative h-32 bg-gray-200">
                            <img
                              src={discount.image}
                              alt={discount.title}
                              className="w-full h-full object-cover"
                            />
                            {discount.discount && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                %{discount.discount}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm flex-1">
                              {discount.title}
                            </h3>
                            <input
                              type="checkbox"
                              checked={selectedDiscounts.includes(discount.id)}
                              onChange={() => {}}
                              className="mt-1 ml-2"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {discount.description}
                          </p>
                          {discount.oldPrice && discount.newPrice && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-gray-500 line-through text-xs">
                                {discount.oldPrice} TL
                              </span>
                              <span className="text-green-600 font-bold text-sm">
                                {discount.newPrice} TL
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{discount.storeName}</span>
                            <span>Kat {discount.floor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Henüz fırsat eklenmemiş
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
