/**
 * Spor Mağazaları Yönetimi Komponenti
 * Admin panelinde spor rotası için mağaza seçimi
 */

'use client';

import { useState, useEffect } from 'react';

export default function SportStoreManager({ selectedPlace, onUpdate }) {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [sportStores, setSportStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seçili yer değiştiğinde ilk katı seç
  useEffect(() => {
    if (selectedPlace && selectedPlace.floors) {
      const floors = Object.keys(selectedPlace.floors)
        .map(Number)
        .sort((a, b) => a - b);
      if (floors.length > 0) {
        setSelectedFloor(floors[0]);
      }
    }
  }, [selectedPlace]);

  // Seçili kata göre odaları yükle
  useEffect(() => {
    if (selectedPlace && selectedFloor !== null) {
      loadRooms(selectedFloor);
      loadSportStores(selectedFloor);
    }
  }, [selectedFloor, selectedPlace]);

  const loadRooms = async floor => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/rooms?placeId=${selectedPlace.id}&floor=${floor}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      const roomsData = Array.isArray(data) ? data : data.rooms || [];
      setRooms(roomsData);
    } catch (error) {
      console.error('Odalar yüklenemedi:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSportStores = async floor => {
    try {
      const response = await fetch(
        `/api/admin/sport-stores/${selectedPlace.id}?floor=${floor}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSportStores(data.stores || []);
      }
    } catch (error) {
      console.error('Yönlendirme mağazaları yüklenemedi:', error);
    }
  };

  const toggleSportStore = async roomId => {
    setSaving(true);
    try {
      const isCurrentlySport = sportStores.some(
        store => store.room_id === roomId
      );
      const method = isCurrentlySport ? 'DELETE' : 'POST';

      const response = await fetch(
        `/api/admin/sport-stores/${selectedPlace.id}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
          body: JSON.stringify({
            room_id: roomId,
            floor: selectedFloor,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Listeyi yenile
        await loadSportStores(selectedFloor);
        onUpdate?.();
      } else {
        alert('İşlem başarısız: ' + data.error);
      }
    } catch (error) {
      console.error('Yönlendirme mağazası güncellenemedi:', error);
      alert('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const isSportStore = roomId => {
    return sportStores.some(store => store.room_id === roomId);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Yönlendirme Mağazaları Yönetimi
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Yönlendirme rotası için mağazaları seçin. Bu mağazalar spor modunda
          rotanın önünden geçirilir.
        </p>
      </div>

      {/* Kat Seçimi */}
      {selectedPlace && selectedPlace.floors && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kat Seçin
          </label>
          <select
            value={selectedFloor}
            onChange={e => setSelectedFloor(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
          >
            {Object.keys(selectedPlace.floors)
              .map(Number)
              .sort((a, b) => a - b)
              .map(floor => (
                <option key={floor} value={floor}>
                  {floor === 0 ? 'Zemin Kat' : `${floor}. Kat`}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Mağaza Listesi */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedFloor === 0 ? 'Zemin Kat' : `${selectedFloor}. Kat`}{' '}
            Mağazaları
          </h3>
          <p className="text-sm text-gray-500">
            {sportStores.length} Yönlendirme mağazası seçili
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
              <p className="text-gray-500 mt-2">Yükleniyor...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏪</div>
              <p>Bu katta mağaza bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isSportStore(room.room_id)
                      ? 'border-brand bg-brand-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{room.name}</h4>
                      <p className="text-sm text-gray-500">
                        Kategori: {room.category || 'Genel'} • ID:{' '}
                        {room.originalId || room.room_id}
                      </p>
                      {room.subtype && (
                        <p className="text-xs text-gray-400 mt-1">
                          Alt tip: {room.subtype}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleSportStore(room.room_id)}
                      disabled={saving}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isSportStore(room.room_id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-brand text-white hover:bg-brand-dark'
                      } disabled:opacity-50`}
                    >
                      {saving
                        ? '...'
                        : isSportStore(room.room_id)
                        ? '🏃 Yönlendirme Mağazası ✓'
                        : '+ Yönlendirme Mağazası Yap'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      {sportStores.length > 0 && (
        <div className="bg-brand-light border border-brand rounded-lg p-4">
          <h4 className="font-medium text-brand-dark mb-2">
            📊 Yönlendirme Mağazası İstatistikleri
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                Toplam Yönlendirme Mağazası:
              </span>
              <span className="font-medium ml-2">{sportStores.length}</span>
            </div>
            <div>
              <span className="text-gray-600">
                Bu Kattaki Yönlendirme Mağazası:
              </span>
              <span className="font-medium ml-2">
                {
                  sportStores.filter(store => store.floor === selectedFloor)
                    .length
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
