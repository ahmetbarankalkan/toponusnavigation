'use client';

import { useState, useEffect } from 'react';
import SuccessNotification from '../SuccessNotification';
import ErrorNotification from '../ErrorNotification';

export default function FreeCampaign({ room, placeId, onCampaignUpdate }) {
  const [loading, setLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(null);
  const [campaignType, setCampaignType] = useState('popular'); // 'popular', 'store', 'product'

  useEffect(() => {
    if (room?.free_campaign) {
      setActiveCampaign(room.free_campaign);
    }
  }, [room]);

  // Kalan süreyi hesapla
  useEffect(() => {
    if (!activeCampaign) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(activeCampaign.end_time);
      const diff = endTime - now;

      if (diff <= 0) {
        setRemainingTime('Süresi doldu');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCampaign]);

  const handleActivate = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 10);

      const response = await fetch('/api/admin/campaigns/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room.room_id,
          placeId: placeId,
          endTime: endTime.toISOString(),
          campaignType: campaignType, // Seçilen kampanya tipini gönder
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage((result.message || '10 dakikalık ücretsiz kampanya başladı!') + ' 🎉 Keşfet\'te görmek için sayfayı yenileyin (F5)');
        setShowSuccess(true);
        if (onCampaignUpdate) {
          await onCampaignUpdate();
        }
      } else {
        setErrorMessage(result.error || 'Bir hata oluştu');
        setShowError(true);
      }
    } catch (error) {
      console.error('Kampanya aktivasyon hatası:', error);
      setErrorMessage('Kampanya başlatılamadı!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/campaigns/free', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room.room_id,
          placeId: placeId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Ücretsiz kampanya iptal edildi');
        setShowSuccess(true);
        if (onCampaignUpdate) {
          await onCampaignUpdate();
        }
      } else {
        setErrorMessage(result.error || 'Bir hata oluştu');
        setShowError(true);
      }
    } catch (error) {
      console.error('Kampanya iptal hatası:', error);
      setErrorMessage('Kampanya iptal edilemedi!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⚡</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ücretsiz 10 Dakika Kampanya</h3>
            <p className="text-sm text-gray-600 mb-4">
              Mağazanızı 10 dakika boyunca Popüler Yerler bölümünde ücretsiz olarak öne çıkarın. Bu kampanya hemen başlar ve 10 dakika sonra otomatik olarak sona erer.
            </p>

            {activeCampaign ? (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {remainingTime || '10:00'}
                  </div>
                  <p className="text-sm text-green-700 font-semibold">Kalan Süre</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Başlangıç:</span>
                    <span className="font-semibold">{new Date(activeCampaign.start_time).toLocaleTimeString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Bitiş:</span>
                    <span className="font-semibold">{new Date(activeCampaign.end_time).toLocaleTimeString('tr-TR')}</span>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 text-center">
                    🎯 Mağazanız şu anda Popüler Yerler bölümünde görünüyor!
                  </p>
                </div>

                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'İptal Ediliyor...' : 'Kampanyayı İptal Et'}
                </button>
              </div>
            ) : (
              <div className="bg-white border-2 border-yellow-300 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">⏱️</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">10 Dakika Ücretsiz!</h4>
                  <p className="text-sm text-gray-600">
                    Hemen başlat ve mağazanı binlerce kullanıcıya göster
                  </p>
                </div>

                {/* Kampanya Tipi Seçimi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bu hangi kampanya türü olsun? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="popular">🔥 Popüler Yerler Kampanyası</option>
                    <option value="store">🏪 Mağaza Kampanyası</option>
                    <option value="product">🎁 Ürün Kampanyası</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Seçtiğiniz bölümde gösterilecek
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Anında başlar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>10 dakika boyunca {
                        campaignType === 'popular' ? 'Popüler Yerler' : 
                        campaignType === 'store' ? 'Mağaza Kampanyaları' :
                        'Ürün Kampanyaları'
                      }'nde</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Tamamen ücretsiz</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Otomatik bitiş</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-green-500 text-white font-bold text-lg rounded-lg hover:from-yellow-500 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {loading ? 'Başlatılıyor...' : '⚡ Hemen Başlat!'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <ErrorNotification
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
    </div>
  );
}
