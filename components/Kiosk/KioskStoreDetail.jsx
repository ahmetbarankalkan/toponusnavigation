'use client';
import {
  X,
  MapPin,
  Star,
  Navigation,
  Clock,
  Phone,
  Globe,
  Sparkles,
  ShoppingBag,
  Share2,
  Gift,
  TrendingUp,
} from 'lucide-react';

export default function KioskStoreDetail({
  store,
  isOpen,
  onClose,
  onNavigate,
  onShowQR,
}) {
  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-12 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-10 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="w-7 h-7 text-white" />
          </button>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center p-4 shadow-xl">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <ShoppingBag className="w-16 h-16 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-5xl font-black text-white mb-3">
                {store.name}
              </h2>
              <div className="flex items-center gap-6 text-white/90 text-xl">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Kat {store.floor === 0 ? 'Zemin' : store.floor}
                </div>
                {store.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-white" />
                    {store.rating}
                  </div>
                )}
                {store.category && (
                  <span className="bg-white/20 px-4 py-2 rounded-full text-lg font-bold">
                    {store.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Kampanya Banner */}
          {store.hasPromotion && (
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-2">Özel Kampanya!</h3>
                  <p className="text-xl text-white/90">
                    {store.promotion || 'Tüm ürünlerde %20 indirim'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bilgi Kartları */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Çalışma Saatleri
                </h3>
              </div>
              <p className="text-lg text-gray-700 font-medium">
                {store.hours || '10:00 - 22:00'}
              </p>
            </div>

            {store.phone && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Telefon</h3>
                </div>
                <p className="text-lg text-gray-700 font-medium">
                  {store.phone}
                </p>
              </div>
            )}

            {store.website && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Web Sitesi
                  </h3>
                </div>
                <p className="text-lg text-purple-700 font-medium truncate">
                  {store.website}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Popülerlik</h3>
              </div>
              <p className="text-lg text-gray-700 font-medium">
                Çok Ziyaret Ediliyor
              </p>
            </div>
          </div>

          {/* Hizmetler */}
          {store.services && (
            <div className="bg-gray-50 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-blue-500" />
                Hizmetler & Özellikler
              </h3>
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(store.services)
                  ? store.services
                  : store.services.split(',').map(s => s.trim())
                ).map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center text-base bg-white text-gray-900 px-5 py-3 rounded-2xl font-bold shadow-sm border-2 border-gray-200"
                  >
                    ✓ {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => onNavigate(store)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-7 px-8 rounded-3xl font-black text-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-4 active:scale-95"
            >
              <Navigation className="w-8 h-8" />
              Yol Tarifi Al
            </button>

            <button
              onClick={onShowQR}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-7 px-8 rounded-3xl font-black text-2xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-4 active:scale-95"
            >
              <Share2 className="w-8 h-8" />
              Telefona Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
