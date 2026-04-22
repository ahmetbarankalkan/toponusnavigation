'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function KioskDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('kiosk-detail');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Birim ve store state'leri
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingStores, setLoadingStores] = useState(false);

  // Form state'leri
  const [activeForm, setActiveForm] = useState(null); // 'product', 'event', 'discount'
  const [editingItem, setEditingItem] = useState(null); // Düzenlenen item
  const [showStoreModal, setShowStoreModal] = useState(false); // Modal state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
    discount: '',
    oldPrice: '',
    newPrice: '',
    startDate: '',
    endDate: '',
  });

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

  // Birimleri yükle
  useEffect(() => {
    if (!user) return;

    const loadPlaces = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/admin/places', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setPlaces(data.places);
        }
      } catch (error) {
        console.error('Birimler yüklenemedi:', error);
      }
    };

    loadPlaces();
  }, [user]);

  // Seçilen birime göre katları yükle
  useEffect(() => {
    if (!selectedPlace) {
      setAvailableFloors([]);
      setSelectedFloor(null);
      setStores([]);
      setSelectedStore(null);
      return;
    }

    const loadFloors = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `/api/admin/rooms?placeId=${selectedPlace.id}&floor=all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const roomsData = Array.isArray(data) ? data : data.rooms || [];

        // Benzersiz katları bul ve sırala
        const floors = [...new Set(roomsData.map(room => room.floor))].sort(
          (a, b) => a - b
        );
        setAvailableFloors(floors);
      } catch (error) {
        console.error('Katlar yüklenemedi:', error);
        setAvailableFloors([]);
      }
    };

    loadFloors();
  }, [selectedPlace]);

  // Seçilen kata göre birimleri yükle
  useEffect(() => {
    if (!selectedPlace || selectedFloor === null) {
      setStores([]);
      setSelectedStore(null);
      return;
    }

    const loadStores = async () => {
      setLoadingStores(true);
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `/api/admin/rooms?placeId=${selectedPlace.id}&floor=${selectedFloor}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const roomsData = Array.isArray(data) ? data : data.rooms || [];



        setStores(roomsData);
      } catch (error) {
        console.error('Birimler yüklenemedi:', error);
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, [selectedPlace, selectedFloor]);

  // Mağaza seçme ve modal açma
  const handleStoreClick = store => {

    setSelectedStore(store);
    setShowStoreModal(true);
  };

  // Modal'ı kapat
  const handleCloseModal = () => {
    setShowStoreModal(false);
    setActiveForm(null);
    setEditingItem(null);
  };

  // Form açma fonksiyonu
  const handleOpenForm = formType => {
    setActiveForm(formType);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      price: '',
      discount: '',
      oldPrice: '',
      newPrice: '',
      startDate: '',
      endDate: '',
    });
  };

  // Düzenleme için form açma
  const handleEditItem = (formType, item) => {
    setActiveForm(formType);
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      image: item.image || '',
      price: item.price || '',
      discount: item.discount || '',
      oldPrice: item.oldPrice || '',
      newPrice: item.newPrice || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    });
  };

  // Silme fonksiyonu
  const handleDeleteItem = async (formType, itemId) => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
      return;
    }



    try {
      const token = localStorage.getItem('admin_token');

      // Yeni API'yi kullan
      const response = await fetch('/api/admin/store-content', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedStore.room_id,
          contentType: formType,
          itemId: itemId,
        }),
      });

      const result = await response.json();


      if (result.success && result.room) {
        // State'i güncelle
        const updatedStore = {
          ...selectedStore,
          content: result.room.content,
        };

        setSelectedStore(updatedStore);
        setStores(prevStores =>
          prevStores.map(s =>
            s.room_id === selectedStore.room_id ? updatedStore : s
          )
        );

        alert('✅ Başarıyla silindi!');
      } else {
        console.error('❌ Silme hatası:', result.error);
        alert('❌ Hata: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ Silme hatası:', error);
      alert('❌ Silme sırasında hata oluştu: ' + error.message);
    }
  };

  // Form input değişikliği
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Form kaydetme - YENİ BASIT YAKLAŞIM
  const handleSaveForm = async () => {


    try {
      const token = localStorage.getItem('admin_token');

      // Yeni item oluştur veya mevcut item'i güncelle
      const item = editingItem
        ? {
            ...editingItem,
            title: formData.title,
            description: formData.description,
            image: formData.image || '',
            price: formData.price || '',
            discount: formData.discount || '',
            oldPrice: formData.oldPrice || '',
            newPrice: formData.newPrice || '',
            startDate: formData.startDate || '',
            endDate: formData.endDate || '',
            updatedAt: new Date().toISOString(),
          }
        : {
            id: `${activeForm}_${Date.now()}`,
            title: formData.title,
            description: formData.description,
            image: formData.image || '',
            price: formData.price || '',
            discount: formData.discount || '',
            oldPrice: formData.oldPrice || '',
            newPrice: formData.newPrice || '',
            startDate: formData.startDate || '',
            endDate: formData.endDate || '',
            createdAt: new Date().toISOString(),
            isActive: true,
          };



      // Yeni API'yi kullan
      const response = await fetch('/api/admin/store-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedStore.room_id,
          contentType: activeForm,
          item: item,
        }),
      });

      const result = await response.json();


      if (result.success && result.room) {
        // State'i güncelle - YENİ OBJE OLUŞTUR
        const updatedStore = {
          ...selectedStore,
          content: {
            ...selectedStore.content,
            ...result.room.content,
          },
          _updateKey: Date.now(), // Force re-render
        };



        // State'i güncelle
        setSelectedStore(updatedStore);

        // Store listesini de güncelle
        setStores(prevStores =>
          prevStores.map(s =>
            s.room_id === selectedStore.room_id ? updatedStore : s
          )
        );

        // Formu kapat
        setActiveForm(null);
        setEditingItem(null);

        // Başarı mesajı
        setTimeout(() => {
          alert('✅ Başarıyla kaydedildi!');
        }, 100);
      } else {
        console.error('❌ API Error:', result.error);
        alert('❌ Hata: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error);
      alert('❌ Kaydetme sırasında hata oluştu: ' + error.message);
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
          <h1 className="text-3xl font-bold mb-6">Kiosk Detay</h1>

          {/* Birim Seçimi */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Birim Seçin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map(place => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlace?.id === place.id
                      ? 'border-brand bg-brand-light'
                      : 'border-gray-200 hover:border-brand-light hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {place.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{place.slug}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kat Seçimi */}
          {selectedPlace && availableFloors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Kat Seçin
              </h2>
              <div className="flex flex-wrap gap-3">
                {availableFloors.map(floor => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedFloor === floor
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Kat {floor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mağaza Listesi */}
          {selectedPlace && selectedFloor !== null && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedPlace.name} - Kat {selectedFloor} Birimleri
                </h2>
                <div className="text-sm text-gray-600">
                  {stores.length} birim
                </div>
              </div>

              {loadingStores ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark mx-auto"></div>
                  <p className="mt-4 text-gray-600">Birimler yükleniyor...</p>
                </div>
              ) : stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stores.map(store => (
                    <div
                      key={store.id}
                      onClick={() => handleStoreClick(store)}
                      className="p-4 border rounded-lg cursor-pointer transition-all border-gray-200 hover:border-brand hover:bg-brand-light hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {store.name}
                        </div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          Kat {store.floor}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        ID: {store.room_id}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {store.content?.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {store.content.category === 'store' && 'Mağaza'}
                            {store.content.category === 'restaurant' &&
                              'Restoran'}
                            {store.content.category === 'cafe' && 'Kafe'}
                            {!['store', 'restaurant', 'cafe'].includes(
                              store.content.category
                            ) && store.content.category}
                          </span>
                        )}
                        {store.content?.brand && (
                          <div className="text-sm text-brand-dark">
                            {store.content.brand}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Bu birimde kayıt bulunamadı
                </div>
              )}
            </div>
          )}

          {/* MODAL */}
          {showStoreModal && selectedStore && (
            <div
              key={`modal-${selectedStore.room_id}-${selectedStore.content
                ?.products?.length || 0}-${selectedStore.content?.events
                ?.length || 0}-${selectedStore.content?.discounts?.length ||
                0}`}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedStore.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPlace?.name} - Kat {selectedStore.floor} - ID:{' '}
                      {selectedStore.room_id}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {(() => {

                    return null;
                  })()}
                  {!activeForm ? (
                    <>
                      {/* Aksiyon Butonları */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button
                          onClick={() => handleOpenForm('product')}
                          className="p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand hover:bg-brand-light transition-all text-center group"
                        >
                          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                            🛍️
                          </div>
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            Ürün Ekle
                          </div>
                          <div className="text-sm text-gray-500">
                            Yeni ürün ekleyin
                          </div>
                        </button>

                        <button
                          onClick={() => handleOpenForm('event')}
                          className="p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand hover:bg-brand-light transition-all text-center group"
                        >
                          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                            🎉
                          </div>
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            Etkinlik Ekle
                          </div>
                          <div className="text-sm text-gray-500">
                            Yeni etkinlik oluşturun
                          </div>
                        </button>

                        <button
                          onClick={() => handleOpenForm('discount')}
                          className="p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand hover:bg-brand-light transition-all text-center group"
                        >
                          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                            💰
                          </div>
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            Fırsat Ekle
                          </div>
                          <div className="text-sm text-gray-500">
                            Yeni fırsat tanımlayın
                          </div>
                        </button>
                      </div>

                      {/* Kayıtlı İçerikler */}
                      {/* Mevcut Ürünler */}
                      {selectedStore.content?.products &&
                        selectedStore.content.products.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              🛍️ Kayıtlı Ürünler (
                              {selectedStore.content.products.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedStore.content.products.map(product => (
                                <div
                                  key={product.id}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                                >
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        handleEditItem('product', product)
                                      }
                                      className="bg-brand text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteItem('product', product.id)
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                  {product.image && (
                                    <img
                                      src={product.image}
                                      alt={product.title}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                  )}
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {product.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {product.description}
                                  </p>
                                  {product.price && (
                                    <div className="text-brand font-bold">
                                      {product.price} TL
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Mevcut Etkinlikler */}
                      {selectedStore.content?.events &&
                        selectedStore.content.events.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              🎉 Kayıtlı Etkinlikler (
                              {selectedStore.content.events.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedStore.content.events.map(event => (
                                <div
                                  key={event.id}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                                >
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        handleEditItem('event', event)
                                      }
                                      className="bg-brand text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteItem('event', event.id)
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                  {event.image && (
                                    <img
                                      src={event.image}
                                      alt={event.title}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                  )}
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {event.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {event.description}
                                  </p>
                                  {(event.startDate || event.endDate) && (
                                    <div className="text-xs text-gray-500">
                                      {event.startDate && (
                                        <div>Başlangıç: {event.startDate}</div>
                                      )}
                                      {event.endDate && (
                                        <div>Bitiş: {event.endDate}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Mevcut Fırsatlar */}
                      {selectedStore.content?.discounts &&
                        selectedStore.content.discounts.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              💰 Kayıtlı Fırsatlar (
                              {selectedStore.content.discounts.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedStore.content.discounts.map(discount => (
                                <div
                                  key={discount.id}
                                  className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                                >
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        handleEditItem('discount', discount)
                                      }
                                      className="bg-brand text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteItem(
                                          'discount',
                                          discount.id
                                        )
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                  {discount.image && (
                                    <img
                                      src={discount.image}
                                      alt={discount.title}
                                      className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                  )}
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {discount.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {discount.description}
                                  </p>
                                  <div className="space-y-1">
                                    {discount.discount && (
                                      <div className="text-red-600 font-bold">
                                        %{discount.discount} İndirim
                                      </div>
                                    )}
                                    {discount.oldPrice && discount.newPrice && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 line-through text-sm">
                                          {discount.oldPrice} TL
                                        </span>
                                        <span className="text-green-600 font-bold">
                                          {discount.newPrice} TL
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    /* Form Alanları */
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activeForm === 'product' &&
                            (editingItem ? '🛍️ Ürün Düzenle' : '🛍️ Ürün Ekle')}
                          {activeForm === 'event' &&
                            (editingItem
                              ? '🎉 Etkinlik Düzenle'
                              : '🎉 Etkinlik Ekle')}
                          {activeForm === 'discount' &&
                            (editingItem
                              ? '💰 Fırsat Düzenle'
                              : '💰 Fırsat Ekle')}
                        </h3>
                        <button
                          onClick={() => setActiveForm(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Başlık */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Başlık *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={e =>
                              handleFormChange('title', e.target.value)
                            }
                            placeholder="Başlık giriniz"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>

                        {/* Açıklama */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Açıklama *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={e =>
                              handleFormChange('description', e.target.value)
                            }
                            placeholder="Açıklama giriniz"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                        </div>

                        {/* Görsel Yükleme */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Görsel
                          </label>
                          {formData.image && (
                            <div className="mb-3">
                              <img
                                src={
                                  typeof formData.image === 'string' &&
                                  formData.image.startsWith('data:image/')
                                    ? formData.image
                                    : formData.image
                                }
                                alt="Önizleme"
                                className="w-full h-48 object-cover rounded-lg border-2 border-brand"
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            onChange={e => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                handleFormChange('image', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF veya WEBP formatında görsel
                            yükleyebilirsiniz
                          </p>
                        </div>

                        {/* Ürün için Fiyat */}
                        {activeForm === 'product' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fiyat (TL)
                            </label>
                            <input
                              type="number"
                              value={formData.price}
                              onChange={e =>
                                handleFormChange('price', e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                          </div>
                        )}

                        {/* Fırsat için İndirim ve Fiyatlar */}
                        {activeForm === 'discount' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                İndirim Oranı (%)
                              </label>
                              <input
                                type="number"
                                value={formData.discount}
                                onChange={e =>
                                  handleFormChange('discount', e.target.value)
                                }
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Önceki Fiyat (TL)
                                </label>
                                <input
                                  type="number"
                                  value={formData.oldPrice}
                                  onChange={e =>
                                    handleFormChange('oldPrice', e.target.value)
                                  }
                                  placeholder="0.00"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Şimdiki Fiyat (TL)
                                </label>
                                <input
                                  type="number"
                                  value={formData.newPrice}
                                  onChange={e =>
                                    handleFormChange('newPrice', e.target.value)
                                  }
                                  placeholder="0.00"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Etkinlik için Tarihler */}
                        {activeForm === 'event' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Başlangıç Tarihi
                              </label>
                              <input
                                type="date"
                                value={formData.startDate}
                                onChange={e =>
                                  handleFormChange('startDate', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bitiş Tarihi
                              </label>
                              <input
                                type="date"
                                value={formData.endDate}
                                onChange={e =>
                                  handleFormChange('endDate', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>
                          </div>
                        )}

                        {/* Kaydet Butonu */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleSaveForm}
                            className="flex-1 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => setActiveForm(null)}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
