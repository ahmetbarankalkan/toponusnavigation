'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Master admin kontrolü - sadece "admin" kullanıcısı her şeye erişebilir
  const isMasterAdmin = user?.username === 'admin';

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
        console.error('Auth check error:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          activeTab="accounting"
          setActiveTab={() => {}}
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">💰</span>
              Muhasebe
            </h1>
            <p className="text-gray-600 mt-2">
              Abonelikler, kampanyalar ve faturalar
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {/* Satın Alım - Tüm adminler erişebilir */}
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'purchases'
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">🛒</span>
                Satın Alım
              </button>

              {/* Sadece Master Admin erişebilir */}
              {isMasterAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'subscriptions'
                        ? 'text-brand border-b-2 border-brand'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">📋</span>
                    Abonelikler
                  </button>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'campaigns'
                        ? 'text-brand border-b-2 border-brand'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">🎁</span>
                    Kampanya Abonelikleri
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'invoices'
                        ? 'text-brand border-b-2 border-brand'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">🧾</span>
                    Faturalar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'purchases' && <PurchasesTab />}
            {activeTab === 'subscriptions' && isMasterAdmin && (
              <SubscriptionsTab />
            )}
            {activeTab === 'campaigns' && isMasterAdmin && <CampaignsTab />}
            {activeTab === 'invoices' && isMasterAdmin && <InvoicesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Satın Alım Tab
function PurchasesTab() {
  const purchases = [
    {
      id: 1,
      store: 'Starbucks',
      product: 'Caramel Macchiato',
      quantity: 2,
      unitPrice: '45.00 TL',
      totalPrice: '90.00 TL',
      date: '28.10.2024',
      status: 'Tamamlandı',
      paymentMethod: 'Kredi Kartı',
    },
    {
      id: 2,
      store: 'H&M',
      product: 'Basic T-Shirt',
      quantity: 3,
      unitPrice: '129.90 TL',
      totalPrice: '389.70 TL',
      date: '27.10.2024',
      status: 'Tamamlandı',
      paymentMethod: 'Nakit',
    },
    {
      id: 3,
      store: 'Burger King',
      product: 'Whopper Menü',
      quantity: 1,
      unitPrice: '85.00 TL',
      totalPrice: '85.00 TL',
      date: '26.10.2024',
      status: 'İptal Edildi',
      paymentMethod: 'Kredi Kartı',
    },
  ];

  const totalRevenue = purchases
    .filter(p => p.status === 'Tamamlandı')
    .reduce(
      (sum, p) =>
        sum + parseFloat(p.totalPrice.replace(' TL', '').replace(',', '.')),
      0
    );

  const completedCount = purchases.filter(p => p.status === 'Tamamlandı')
    .length;
  const cancelledCount = purchases.filter(p => p.status === 'İptal Edildi')
    .length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Satın Alım İşlemleri
        </h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            📊 Rapor Al
          </button>
          <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
            + Yeni Satın Alım
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} TL</div>
          <div className="text-sm opacity-90">Toplam Gelir</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-sm opacity-90">Tamamlanan</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">❌</div>
          <div className="text-2xl font-bold">{cancelledCount}</div>
          <div className="text-sm opacity-90">İptal Edilen</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">🛒</div>
          <div className="text-2xl font-bold">{purchases.length}</div>
          <div className="text-sm opacity-90">Toplam İşlem</div>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mağaza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ürün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Adet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Birim Fiyat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Toplam
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ödeme
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
            {purchases.map(purchase => (
              <tr key={purchase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {purchase.store}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {purchase.product}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {purchase.quantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {purchase.unitPrice}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {purchase.totalPrice}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {purchase.date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {purchase.paymentMethod}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'Tamamlandı'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-brand hover:text-brand-dark mr-3">
                    Detay
                  </button>
                  {purchase.status === 'Tamamlandı' && (
                    <button className="text-gray-600 hover:text-gray-900">
                      Fatura
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Abonelikler Tab
function SubscriptionsTab() {
  const subscriptions = [
    {
      id: 1,
      user: 'Ahmet Yılmaz',
      plan: 'Premium',
      price: '99.90 TL',
      status: 'Aktif',
      startDate: '01.01.2024',
      endDate: '01.01.2025',
    },
    {
      id: 2,
      user: 'Fatma Demir',
      plan: 'Basic',
      price: '49.90 TL',
      status: 'Aktif',
      startDate: '15.02.2024',
      endDate: '15.02.2025',
    },
    {
      id: 3,
      user: 'Mehmet Kaya',
      plan: 'Premium',
      price: '99.90 TL',
      status: 'Süresi Doldu',
      startDate: '01.06.2023',
      endDate: '01.06.2024',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Kullanıcı Abonelikleri
        </h2>
        <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
          + Yeni Abonelik
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ücret
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Başlangıç
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bitiş
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.map(sub => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{sub.user}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-brand/10 text-brand rounded-full text-xs font-medium">
                    {sub.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {sub.price}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'Aktif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {sub.startDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {sub.endDate}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-brand hover:text-brand-dark mr-3">
                    Düzenle
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    İptal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Kampanya Abonelikleri Tab
function CampaignsTab() {
  const campaigns = [
    {
      id: 1,
      store: 'Starbucks',
      campaign: 'Popüler Mekan Kampanyası',
      price: '299.90 TL/ay',
      status: 'Aktif',
      startDate: '01.03.2024',
      views: '1,234',
    },
    {
      id: 2,
      store: 'H&M',
      campaign: 'Ürün Kampanyası',
      price: '199.90 TL/ay',
      status: 'Aktif',
      startDate: '15.03.2024',
      views: '856',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Mağaza Kampanya Abonelikleri
        </h2>
        <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
          + Yeni Kampanya Aboneliği
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold">12,450 TL</div>
          <div className="text-sm opacity-90">Toplam Aylık Gelir</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-2xl font-bold">8</div>
          <div className="text-sm opacity-90">Aktif Kampanya</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="text-3xl mb-2">👁️</div>
          <div className="text-2xl font-bold">45,678</div>
          <div className="text-sm opacity-90">Toplam Görüntülenme</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mağaza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kampanya Tipi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ücret
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Başlangıç
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Görüntülenme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map(campaign => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {campaign.store}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.campaign}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {campaign.price}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.startDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.views}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-brand hover:text-brand-dark mr-3">
                    Detay
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    İptal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Faturalar Tab
function InvoicesTab() {
  const invoices = [
    {
      id: 'INV-2024-001',
      customer: 'Starbucks',
      type: 'Kampanya Aboneliği',
      amount: '299.90 TL',
      date: '01.03.2024',
      status: 'Ödendi',
    },
    {
      id: 'INV-2024-002',
      customer: 'Ahmet Yılmaz',
      type: 'Premium Abonelik',
      amount: '99.90 TL',
      date: '01.03.2024',
      status: 'Ödendi',
    },
    {
      id: 'INV-2024-003',
      customer: 'H&M',
      type: 'Ürün Kampanyası',
      amount: '199.90 TL',
      date: '15.03.2024',
      status: 'Beklemede',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Faturalar</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            📥 Dışa Aktar
          </button>
          <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
            + Yeni Fatura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Toplam Gelir</div>
          <div className="text-2xl font-bold text-gray-900">24,890 TL</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Ödenen</div>
          <div className="text-2xl font-bold text-green-600">18,450 TL</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Bekleyen</div>
          <div className="text-2xl font-bold text-orange-600">6,440 TL</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Toplam Fatura</div>
          <div className="text-2xl font-bold text-gray-900">156</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fatura No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tutar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tarih
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
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {invoice.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {invoice.customer}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {invoice.type}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {invoice.amount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {invoice.date}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'Ödendi'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-brand hover:text-brand-dark mr-3">
                    Görüntüle
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    İndir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
