/**
 * Admin Dashboard Komponenti
 * Admin paneli ana dashboard'u
 */

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mapServiceStatus, setMapServiceStatus] = useState({
    status: 'Kontrol ediliyor...',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
  });

  // Harita servis durumunu çek
  const fetchMapServiceStatus = async () => {
    try {
      const response = await fetch('/api/system/map-status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMapServiceStatus(data);
    } catch (error) {
      console.error('Map service status fetch error:', error);
      setMapServiceStatus({
        status: 'Hizmet Dışı',
        color: 'bg-red-500',
        textColor: 'text-red-600',
      });
    }
  };

  // Dashboard verilerini çek
  const fetchDashboardData = async () => {
    try {
      // Not resetting loading to true here to avoid full page flicker on auto-refresh
      setError(null);
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Veri alınamadı');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Bağlantı hatası');
    } finally {
      // Only set loading to false on the initial load
      if (loading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();
    fetchMapServiceStatus();

    // Set up intervals for auto-refresh
    const dataInterval = setInterval(fetchDashboardData, 5 * 60 * 1000); // every 5 minutes
    const statusInterval = setInterval(fetchMapServiceStatus, 60 * 1000); // every 1 minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // every second

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(dataInterval);
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Combined refresh handler
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchDashboardData(), fetchMapServiceStatus()]).finally(() => {
      setLoading(false);
    });
  };

  // Loading state
  if (loading && !dashboardData) {
    // Show initial loading skeleton only
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-medium">Veri Yükleme Hatası</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Toplam Kullanıcı',
      value: dashboardData?.stats?.totalUsers?.toLocaleString() || '0',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      label: 'Aktif Navigasyon',
      value: dashboardData?.stats?.activeNavigations?.toString() || '0',
      icon: '🗺️',
      color: 'bg-green-500',
    },
    {
      label: 'Toplam Lokasyon',
      value: dashboardData?.stats?.totalLocations?.toString() || '0',
      icon: '📍',
      color: 'bg-purple-500',
    },
    {
      label: 'Bugünkü Ziyaret',
      value: 'Yakında',
      icon: '📊',
      color: 'bg-gray-400',
      note: 'Proje canlıya alındığında aktif olacak',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Sistem genel durumu ve istatistikler</p>
          <p className="text-sm text-gray-500 mt-1">
            {currentTime.toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            - {currentTime.toLocaleTimeString('tr-TR')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Son Güncelleme</div>
            <div className="text-sm font-medium text-gray-700">
              {dashboardData
                ? new Date().toLocaleTimeString('tr-TR')
                : '--:--:--'}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>🔄</span>
            {loading ? 'Yenileniyor...' : 'Yenile'}
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 ${
              stat.note ? 'relative' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    stat.note ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
                {stat.note && (
                  <p className="text-xs text-gray-400 mt-1">{stat.note}</p>
                )}
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
            </div>
            {stat.note && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  🚧 Geliştiriliyor
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Hızlı İşlemler
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/places"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-left block group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                🏢
              </div>
              <h4 className="font-medium text-gray-900">Mekan Yönetimi</h4>
              <p className="text-sm text-gray-600">
                Lokasyon ve mekan bilgileri
              </p>
            </a>
            <a
              href="/admin/rooms"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all text-left block group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                🏠
              </div>
              <h4 className="font-medium text-gray-900">Birim Yönetimi</h4>
              <p className="text-sm text-gray-600">Oda ve birim bilgileri</p>
            </a>
            <a
              href="/admin/sport-stores"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all text-left block group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                🏃
              </div>
              <h4 className="font-medium text-gray-900">Spor Mağazaları</h4>
              <p className="text-sm text-gray-600">
                Spor rotası mağaza yönetimi
              </p>
            </a>
            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all text-left block group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h4 className="font-medium text-gray-900">Analitik</h4>
              <p className="text-sm text-gray-600">Kullanım istatistikleri</p>
            </a>
            <a
              href="/admin/reviews"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-all text-left block group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h4 className="font-medium text-gray-900">Yorum Yönetimi</h4>
              <p className="text-sm text-gray-600">
                Mağaza yorumları ve puanları
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Haftalık Kullanım
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { day: 'Pazartesi', usage: 85 },
                { day: 'Salı', usage: 92 },
                { day: 'Çarşamba', usage: 78 },
                { day: 'Perşembe', usage: 88 },
                { day: 'Cuma', usage: 95 },
                { day: 'Cumartesi', usage: 100 },
                { day: 'Pazar', usage: 65 },
              ].map(item => (
                <div
                  key={item.day}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 w-20">{item.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.usage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.usage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Sistem Durumu
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-gray-700">Veritabanı</span>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-gray-700">API Servisleri</span>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 ${mapServiceStatus.color} rounded-full mr-3 animate-pulse`}
                  ></div>
                  <span className="text-sm text-gray-700">Harita Servisi</span>
                </div>
                <span
                  className={`text-sm ${mapServiceStatus.textColor} font-medium`}
                >
                  {mapServiceStatus.status}
                </span>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Son Kontrol</span>
                  <span>{new Date().toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detaylı İstatistikler
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.stats?.totalRooms || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Birim</div>
              <div className="text-xs text-gray-500 mt-1">
                Tüm lokasyonlardaki birimler
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData?.stats?.totalSportStores || 0}
              </div>
              <div className="text-sm text-gray-600">Spor Mağazası</div>
              <div className="text-xs text-gray-500 mt-1">
                Spor rotası için kayıtlı mağazalar
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  ((dashboardData?.stats?.activeNavigations || 0) /
                    (dashboardData?.stats?.totalUsers || 1)) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Aktiflik Oranı</div>
              <div className="text-xs text-gray-500 mt-1">
                Aktif navigasyon / Toplam kullanıcı
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardData?.stats?.totalReviews || 0}
              </div>
              <div className="text-sm text-gray-600">Toplam Yorum</div>
              <div className="text-xs text-gray-500 mt-1">
                Mağaza yorumları ve değerlendirmeler
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData?.stats?.avgRating
                  ? dashboardData.stats.avgRating.toFixed(1)
                  : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Ortalama Puan</div>
              <div className="text-xs text-gray-500 mt-1">
                Tüm mağazaların ortalama puanı
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
