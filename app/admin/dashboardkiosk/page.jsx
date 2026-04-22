'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardKioskPage() {
  const [activeTab, setActiveTab] = useState('dashboardkiosk');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalKiosks: 0,
    activeKiosks: 0,
    totalInteractions: 0,
    avgUptime: 0,
  });
  const [kioskDetails, setKioskDetails] = useState([]);
  const [kioskScreens, setKioskScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Şimdilik mock data
      setStats({
        totalKiosks: 3,
        activeKiosks: 2,
        totalInteractions: 2221,
        avgUptime: 99.1,
      });

      setKioskDetails([
        {
          id: 1,
          screenName: 'Kiosk 1 - Giriş',
          deviceId: 'KIOSK-001',
          lastActive: '2 dakika önce',
          uptime: '99.8%',
          interactions: 1234,
        },
        {
          id: 2,
          screenName: 'Kiosk 2 - Kat 1',
          deviceId: 'KIOSK-002',
          lastActive: '5 dakika önce',
          uptime: '98.5%',
          interactions: 987,
        },
      ]);

      setKioskScreens([
        {
          id: 1,
          name: 'Kiosk 1 - Giriş',
          location: 'Ana Giriş',
          status: 'active',
        },
        {
          id: 2,
          name: 'Kiosk 2 - Kat 1',
          location: '1. Kat',
          status: 'active',
        },
        {
          id: 3,
          name: 'Kiosk 3 - Kat 2',
          location: '2. Kat',
          status: 'inactive',
        },
      ]);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Kiosk Dashboard</h1>

          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : (
            <>
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Toplam Kiosk</p>
                      <p className="text-3xl font-bold">{stats.totalKiosks}</p>
                    </div>
                    <div className="text-4xl">🖥️</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Aktif Kiosk</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.activeKiosks}
                      </p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Toplam Etkileşim
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.totalInteractions}
                      </p>
                    </div>
                    <div className="text-4xl">👆</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Ortalama Uptime
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.avgUptime}%
                      </p>
                    </div>
                    <div className="text-4xl">⏱️</div>
                  </div>
                </div>
              </div>

              {/* Kiosk Detay Yönetimi */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Kiosk Detay Yönetimi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kioskDetails.map(detail => (
                    <div
                      key={detail.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">
                          {detail.screenName}
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Aktif
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Cihaz ID</p>
                          <p className="font-medium">{detail.deviceId}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Son Aktivite</p>
                          <p className="font-medium">{detail.lastActive}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Çalışma Süresi
                          </p>
                          <p className="font-medium">{detail.uptime}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Toplam Etkileşim
                          </p>
                          <p className="font-medium">{detail.interactions}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                          Detaylar
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300">
                          Ayarlar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kiosk Ekran Yönetimi */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Kiosk Ekran Yönetimi</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Yeni Kiosk Ekranı
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ekran Adı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Konum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {kioskScreens.map(screen => (
                        <tr key={screen.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {screen.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {screen.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {screen.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                screen.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {screen.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              Düzenle
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
