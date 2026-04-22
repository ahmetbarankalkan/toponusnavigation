'use client';
import React, { useState, useEffect } from 'react';
import {
  Star,
  Edit,
  Trash2,
  Search,
  Filter,
  MessageCircle,
  User,
  Calendar,
  TrendingUp,
  Award,
  AlertCircle,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

const AdminReviewsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [storeNames, setStoreNames] = useState({});
  const [filterStatus, setFilterStatus] = useState(''); // all, pending, approved, inactive
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    ratingDistribution: {},
    pendingReviews: 0,
    approvedReviews: 0,
    inactiveReviews: 0,
  });

  useEffect(() => {
    loadReviews();
    loadStats();
    loadStoreNames();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
      } else {
        console.error('Yorumlar yüklenemedi:', data.error);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const loadStoreNames = async () => {
    try {
      const response = await fetch('/api/admin/stores');
      const data = await response.json();

      if (response.ok && data.stores) {
        const nameMapping = {};
        data.stores.forEach(store => {
          nameMapping[store.id] = store.name;
        });
        setStoreNames(nameMapping);
      }
    } catch (error) {
      console.error('Mağaza isimleri yüklenirken hata:', error);
      // API hatası durumunda boş obje ile devam et, fallback fonksiyon çalışacak
      setStoreNames({});
    }
  };

  const getStoreName = storeId => {
    // Önce API'den gelen isimleri kontrol et
    if (storeNames[storeId]) {
      return storeNames[storeId];
    }

    // API'den gelmemişse fallback fonksiyonunu kullan
    return generateStoreName(storeId);
  };

  // ID'den mağaza ismi üretme fonksiyonu (fallback)
  const generateStoreName = storeId => {
    // Yaygın mağaza isimlerini tanı
    const storeMapping = {
      boyner: 'Boyner',
      lcw: 'LC Waikiki',
      lcwaikiki: 'LC Waikiki',
      migros: 'Migros',
      '5m': '5M Migros',
      zara: 'Zara',
      hm: 'H&M',
      nike: 'Nike',
      adidas: 'Adidas',
      mango: 'Mango',
      koton: 'Koton',
      defacto: 'DeFacto',
      teknosa: 'Teknosa',
      mediamarkt: 'Media Markt',
      starbucks: 'Starbucks',
      burger: 'Burger King',
      mcdonalds: "McDonald's",
      kfc: 'KFC',
      pizza: 'Pizza Hut',
      cinema: 'Sinema',
      sinema: 'Sinema',
      pharmacy: 'Eczane',
      eczane: 'Eczane',
      bank: 'Banka',
      atm: 'ATM',
      wc: 'WC',
      toilet: 'Tuvalet',
      cafe: 'Cafe',
      restaurant: 'Restoran',
    };

    const lowerStoreId = storeId.toLowerCase();

    // Önce bilinen mağaza isimlerini ara
    for (const [key, value] of Object.entries(storeMapping)) {
      if (lowerStoreId.includes(key)) {
        return value;
      }
    }

    // Özel durumlar için kontrol
    if (lowerStoreId.includes('room')) {
      // f0-room-157 -> "Mağaza 157" veya "Birim 157"
      const roomNumber = storeId.match(/\d+/);
      if (roomNumber) {
        return `Mağaza ${roomNumber[0]}`;
      }
      return 'Mağaza';
    }

    // Test store ID'leri için
    if (lowerStoreId.includes('test-store')) {
      return 'Test Mağazası';
    }

    // Genel temizleme
    let cleanName = storeId
      .replace(/^f\d+-/, '') // f0-, f1- gibi prefixleri kaldır
      .replace(/^room-?/, '') // room- prefixini kaldır
      .replace(/^store-?/, '') // store- prefixini kaldır
      .replace(/-/g, ' ') // tire işaretlerini boşlukla değiştir
      .replace(/_/g, ' ') // alt çizgileri boşlukla değiştir
      .trim();

    // Sadece sayı kalmışsa
    if (/^\d+$/.test(cleanName)) {
      return `Mağaza ${cleanName}`;
    }

    // Her kelimenin ilk harfini büyük yap
    return (
      cleanName.replace(/\b\w/g, l => l.toUpperCase()) || 'Bilinmeyen Mağaza'
    );
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleEditReview = async reviewId => {
    if (!editComment.trim()) {
      showNotification('Yorum boş olamaz', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          comment: editComment.trim(),
        }),
      });

      if (response.ok) {
        setEditingReview(null);
        setEditComment('');
        loadReviews();
        showNotification('Yorum başarıyla güncellendi');
      } else {
        const errorData = await response.json();
        showNotification(
          'Güncelleme hatası: ' + (errorData.error || 'Bilinmeyen hata'),
          'error'
        );
      }
    } catch (error) {
      console.error('Yorum güncelleme hatası:', error);
      showNotification('Güncelleme sırasında hata oluştu', 'error');
    }
  };

  const handleApproveReview = async (reviewId, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          approved: newStatus,
        }),
      });

      if (response.ok) {
        loadReviews();
        loadStats();
        showNotification(
          newStatus
            ? 'Yorum onaylandı ve yayımlandı!'
            : 'Yorum onayı kaldırıldı'
        );
      } else {
        const errorData = await response.json();
        showNotification(
          'İşlem hatası: ' + (errorData.error || 'Bilinmeyen hata'),
          'error'
        );
      }
    } catch (error) {
      console.error('Yorum onaylama hatası:', error);
      showNotification('İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleToggleActive = async (reviewId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'aktif' : 'pasif';

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isActive: newStatus,
        }),
      });

      if (response.ok) {
        loadReviews();
        loadStats();
        showNotification(`Yorum ${action} hale getirildi`);
      } else {
        const errorData = await response.json();
        showNotification(
          'İşlem hatası: ' + (errorData.error || 'Bilinmeyen hata'),
          'error'
        );
      }
    } catch (error) {
      console.error('Yorum durum değiştirme hatası:', error);
      showNotification('İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDeleteReview = async reviewId => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        loadReviews();
        loadStats();
        showNotification('Yorum başarıyla silindi');
      } else {
        const errorData = await response.json();
        showNotification(
          'Silme hatası: ' + (errorData.error || 'Bilinmeyen hata'),
          'error'
        );
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      showNotification('Silme sırasında hata oluştu', 'error');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const storeName = getStoreName(review.storeId);
    const matchesSearch =
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === '' || review.rating.toString() === filterRating;

    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'pending' && !review.approved) ||
      (filterStatus === 'approved' &&
        review.approved &&
        review.isActive !== false) ||
      (filterStatus === 'inactive' && review.isActive === false);

    return matchesSearch && matchesRating && matchesStatus;
  });

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = rating => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
        />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Bildirim */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center justify-between shadow-lg ${
                notification.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <span className="flex items-center font-medium">
                {notification.type === 'success' ? '✓' : '✕'}{' '}
                {notification.message}
              </span>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700 ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <MessageCircle className="mr-3 text-blue-600" size={32} />
                  Yorum Yönetimi
                </h1>
                <p className="text-gray-600">
                  Mağaza yorumlarını ve puanlarını yönetin, analiz edin ve
                  düzenleyin
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Son Güncelleme</div>
                <div className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Toplam Yorum
                  </p>
                  <p className="text-3xl font-bold">{stats.totalReviews}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {stats.recentReviews || 0} yeni (7 gün)
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <MessageCircle className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Onay Bekleyen
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.pendingReviews || 0}
                  </p>
                  <p className="text-orange-100 text-xs mt-1">
                    İnceleme gerekli
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">
                    Ortalama Puan
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}
                  </p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(stats.avgRating || 0))}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Award className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Mükemmel (5⭐)
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.ratingDistribution?.[5] || 0}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    %
                    {stats.totalReviews > 0
                      ? Math.round(
                          ((stats.ratingDistribution?.[5] || 0) /
                            stats.totalReviews) *
                            100
                        )
                      : 0}{' '}
                    oranında
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Kötü (1⭐)</p>
                  <p className="text-3xl font-bold">
                    {stats.ratingDistribution?.[1] || 0}
                  </p>
                  <p className="text-red-100 text-xs mt-1">
                    %
                    {stats.totalReviews > 0
                      ? Math.round(
                          ((stats.ratingDistribution?.[1] || 0) /
                            stats.totalReviews) *
                            100
                        )
                      : 0}{' '}
                    oranında
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <AlertCircle className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="mr-2 text-blue-600" size={20} />
                Puan Dağılımı
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution?.[rating] || 0;
                  const percentage =
                    stats.totalReviews > 0
                      ? (count / stats.totalReviews) * 100
                      : 0;
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center w-16">
                        <span className="text-sm font-medium text-gray-700">
                          {rating}
                        </span>
                        <Star
                          size={14}
                          className="ml-1 fill-yellow-400 text-yellow-400"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              rating === 5
                                ? 'bg-green-500'
                                : rating === 4
                                ? 'bg-blue-500'
                                : rating === 3
                                ? 'bg-yellow-500'
                                : rating === 2
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                En Aktif Kullanıcılar
              </h3>
              <div className="space-y-3">
                {(stats.topUsers || []).slice(0, 5).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-orange-600'
                            : 'bg-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {user._id}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {user.count} yorum
                    </span>
                  </div>
                ))}
                {(!stats.topUsers || stats.topUsers.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Henüz veri yok
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı, yorum içeriği veya mağaza ID'si ile ara..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puan Filtresi
                </label>
                <div className="relative">
                  <Filter
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={filterRating}
                    onChange={e => setFilterRating(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                  >
                    <option value="">Tüm Puanlar</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 Yıldız)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Yıldız)</option>
                    <option value="3">⭐⭐⭐ (3 Yıldız)</option>
                    <option value="2">⭐⭐ (2 Yıldız)</option>
                    <option value="1">⭐ (1 Yıldız)</option>
                  </select>
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum Filtresi
                </label>
                <div className="relative">
                  <Filter
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="pending">⏳ Onay Bekleyen</option>
                    <option value="approved">✅ Onaylanmış</option>
                    <option value="inactive">🚫 Pasif</option>
                  </select>
                </div>
              </div>

              <div className="lg:w-32 flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRating('');
                    setFilterStatus('');
                  }}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="mr-2 text-blue-600" size={24} />
                  Yorumlar ({filteredReviews.length})
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Toplam {reviews.length} yorum</span>
                  {searchTerm || filterRating ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Filtrelenmiş
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterRating
                      ? 'Arama sonucu bulunamadı'
                      : 'Henüz yorum yok'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterRating
                      ? 'Farklı arama kriterleri deneyin'
                      : 'Kullanıcılar yorum yapmaya başladığında burada görünecek'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((review, index) => (
                  <div
                    key={review._id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      editingReview === review._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 text-lg">
                                {review.userName}
                              </span>
                              <div className="flex items-center space-x-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm font-medium text-gray-600">
                                  ({review.rating}/5)
                                </span>
                                {!review.approved && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    Onay Bekliyor
                                  </span>
                                )}
                                {review.approved && review.isActive !== false && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                                    <CheckCircle size={12} className="mr-1" />
                                    Yayında
                                  </span>
                                )}
                                {review.isActive === false && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center">
                                    <EyeOff size={12} className="mr-1" />
                                    Pasif
                                  </span>
                                )}
                                {review.editedByAdmin && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Admin düzenlemesi
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-500 ml-auto">
                            <Calendar size={14} />
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 rounded-full">
                            <span className="text-sm text-blue-700 font-medium">
                              🏪 Mağaza:
                            </span>
                            <span className="text-sm font-semibold text-blue-900">
                              {getStoreName(review.storeId)}
                            </span>
                            {getStoreName(review.storeId) !==
                              review.storeId && (
                              <span className="text-xs text-blue-500 font-mono bg-blue-100 px-2 py-1 rounded">
                                ID: {review.storeId}
                              </span>
                            )}
                          </div>
                        </div>

                        {editingReview === review._id ? (
                          <div className="space-y-4 bg-white p-4 rounded-lg border-2 border-blue-200">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yorumu Düzenle
                              </label>
                              <textarea
                                value={editComment}
                                onChange={e => setEditComment(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                                maxLength={500}
                                placeholder="Yorum içeriğini düzenleyin..."
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {editComment.length}/500 karakter
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEditReview(review._id)}
                                disabled={!editComment.trim()}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReview(null);
                                  setEditComment('');
                                }}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-800 leading-relaxed text-base">
                              "{review.comment}"
                            </p>
                          </div>
                        )}
                      </div>

                      {editingReview !== review._id && (
                        <div className="flex flex-col space-y-2 ml-6">
                          <button
                            onClick={() =>
                              handleApproveReview(review._id, review.approved)
                            }
                            className={`p-3 rounded-lg transition-colors group ${
                              review.approved
                                ? 'text-orange-600 hover:bg-orange-100'
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={
                              review.approved
                                ? 'Onayı Kaldır'
                                : 'Onayla ve Yayımla'
                            }
                          >
                            {review.approved ? (
                              <XCircle
                                size={18}
                                className="group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <CheckCircle
                                size={18}
                                className="group-hover:scale-110 transition-transform"
                              />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActive(
                                review._id,
                                review.isActive !== false
                              )
                            }
                            className={`p-3 rounded-lg transition-colors group ${
                              review.isActive === false
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={
                              review.isActive === false
                                ? 'Aktif Yap'
                                : 'Pasif Yap'
                            }
                          >
                            {review.isActive === false ? (
                              <Eye
                                size={18}
                                className="group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <EyeOff
                                size={18}
                                className="group-hover:scale-110 transition-transform"
                              />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReview(review._id);
                              setEditComment(review.comment);
                            }}
                            className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors group"
                            title="Yorumu Düzenle"
                          >
                            <Edit
                              size={18}
                              className="group-hover:scale-110 transition-transform"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors group"
                            title="Yorumu Sil"
                          >
                            <Trash2
                              size={18}
                              className="group-hover:scale-110 transition-transform"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
