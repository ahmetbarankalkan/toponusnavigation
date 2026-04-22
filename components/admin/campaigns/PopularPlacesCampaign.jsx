'use client';

import { useState, useEffect } from 'react';
import SuccessNotification from '../SuccessNotification';
import ErrorNotification from '../ErrorNotification';

export default function PopularPlacesCampaign({
  room,
  placeId,
  onCampaignUpdate,
}) {
  const [duration, setDuration] = useState('7'); // Gün cinsinden
  const [loading, setLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [extendDuration, setExtendDuration] = useState('7');

  // Aktif kampanyayı yükle ve süresini kontrol et
  useEffect(() => {
    const campaign = room?.popular_campaign || room?.content?.popular_campaign;
    if (campaign) {
      // Kampanya süresi dolmuş mu kontrol et
      let isExpired = false;
      if (campaign.is_active && campaign.end_date) {
        const endDate = new Date(campaign.end_date);
        // Geçerli tarih kontrolü
        if (!isNaN(endDate.getTime())) {
          isExpired = endDate <= new Date();
        } else {
          console.warn('Geçersiz end_date formatı:', campaign.end_date);
        }
      }

      if (isExpired) {
        // Süresi dolmuş kampanyayı göster ama uyarı ver
        setActiveCampaign({ ...campaign, expired: true });
      } else {
        setActiveCampaign(campaign);
      }
    } else {
      setActiveCampaign(null);
    }
  }, [room]);

  const handleActivate = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(duration));

      const response = await fetch('/api/admin/campaigns/popular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room.room_id,
          placeId: placeId,
          duration: parseInt(duration),
          endDate: endDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(
          `Popüler Yerler kampanyası ${duration} gün için aktif edildi! Keşfet'te görmek için sayfayı yenileyin (F5)`
        );
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
      setErrorMessage('Kampanya aktif edilemedi!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');

      // Tarih kontrolü ve düzeltmesi
      let currentEndDate;
      if (activeCampaign.end_date) {
        currentEndDate = new Date(activeCampaign.end_date);
        // Geçersiz tarih kontrolü
        if (isNaN(currentEndDate.getTime())) {
          console.warn(
            'Geçersiz end_date, bugünün tarihini kullanıyorum:',
            activeCampaign.end_date
          );
          currentEndDate = new Date();
        }
      } else {
        console.warn('end_date bulunamadı, bugünün tarihini kullanıyorum');
        currentEndDate = new Date();
      }

      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(extendDuration));

      const response = await fetch('/api/admin/campaigns/popular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room.room_id,
          placeId: placeId,
          duration: parseInt(extendDuration),
          endDate: newEndDate.toISOString(),
          extend: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`Kampanya süresi ${extendDuration} gün uzatıldı!`);
        setShowSuccess(true);
        setShowExtendForm(false);
        if (onCampaignUpdate) {
          await onCampaignUpdate();
        }
      } else {
        setErrorMessage(result.error || 'Bir hata oluştu');
        setShowError(true);
      }
    } catch (error) {
      console.error('Kampanya uzatma hatası:', error);
      setErrorMessage('Kampanya uzatılamadı!');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/campaigns/popular', {
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
        setSuccessMessage('Popüler Yerler kampanyası iptal edildi');
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
      <div className="bg-gradient-to-r from-brand-light to-brand-light border-2 border-teal-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔥</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Popüler Yerler Kampanyası
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Mağazanızı Keşfet sayfasındaki Popüler Yerler bölümünde öne
              çıkarın. Kampanya süresini seçin ve aktif edin.
            </p>

            {activeCampaign ? (
              <div
                className={`border rounded-lg p-4 ${
                  activeCampaign.expired
                    ? 'bg-red-100 border-red-300'
                    : 'bg-green-100 border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-semibold ${
                        activeCampaign.expired
                          ? 'text-red-800'
                          : 'text-green-800'
                      }`}
                    >
                      {activeCampaign.expired
                        ? '⚠️ Kampanya Süresi Dolmuş'
                        : '✓ Kampanya Aktif'}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        activeCampaign.expired
                          ? 'text-red-700'
                          : 'text-green-700'
                      }`}
                    >
                      Bitiş Tarihi:{' '}
                      {(() => {
                        const endDate = new Date(activeCampaign.end_date);
                        if (isNaN(endDate.getTime())) {
                          return 'Geçersiz tarih';
                        }
                        return endDate.toLocaleDateString('tr-TR');
                      })()}
                    </p>
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <p className="text-sm font-semibold text-yellow-800">
                        ⏰ Kalan Süre:{' '}
                        {(() => {
                          const now = new Date();
                          const endDate = new Date(activeCampaign.end_date);

                          // Geçersiz tarih kontrolü
                          if (isNaN(endDate.getTime())) {
                            return 'Geçersiz tarih';
                          }

                          const diffMs = endDate - now;
                          const diffDays = Math.floor(
                            diffMs / (1000 * 60 * 60 * 24)
                          );
                          const diffHours = Math.floor(
                            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                          );
                          const diffMinutes = Math.floor(
                            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                          );

                          if (diffDays > 0) {
                            return `${diffDays} gün, ${diffHours} saat`;
                          } else if (diffHours > 0) {
                            return `${diffHours} saat, ${diffMinutes} dakika`;
                          } else if (diffMinutes > 0) {
                            return `${diffMinutes} dakika`;
                          } else {
                            return 'Süresi dolmuş';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!activeCampaign.expired && (
                      <button
                        onClick={() => setShowExtendForm(true)}
                        disabled={loading}
                        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:bg-gray-400 transition-colors"
                      >
                        Süre Uzat
                      </button>
                    )}
                    <button
                      onClick={handleDeactivate}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      {loading
                        ? 'İptal Ediliyor...'
                        : activeCampaign.expired
                        ? 'Temizle'
                        : 'İptal Et'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kampanya Süresi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="7">7 Gün</option>
                    <option value="14">14 Gün</option>
                    <option value="30">30 Gün</option>
                    <option value="60">60 Gün</option>
                    <option value="90">90 Gün</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-brand-light0 to-brand text-white font-bold rounded-lg hover:from-brand-dark hover:to-brand-dark disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Aktif Ediliyor...' : '🔥 Popüler Yerlerde Göster'}
                </button>
              </form>
            )}

            {/* Süre Uzatma Formu */}
            {showExtendForm && (
              <div className="mt-4 bg-brand-light border border-brand-light rounded-lg p-4">
                <h4 className="font-semibold text-brand-darkest mb-3">
                  Kampanya Süresini Uzat
                </h4>
                <form onSubmit={handleExtend} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-brand-darkest mb-1">
                      Uzatılacak Süre
                    </label>
                    <select
                      value={extendDuration}
                      onChange={e => setExtendDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light0"
                    >
                      <option value="7">7 Gün</option>
                      <option value="14">14 Gün</option>
                      <option value="30">30 Gün</option>
                      <option value="60">60 Gün</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:bg-gray-400 transition-colors"
                    >
                      {loading ? 'Uzatılıyor...' : 'Süreyi Uzat'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExtendForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
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
