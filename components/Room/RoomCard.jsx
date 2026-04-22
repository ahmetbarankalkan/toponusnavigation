'use client';

import {
  X,
  Clock,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Star,
  Tag,
  Shield,
  Truck,
  RotateCcw,
  Zap,
  CreditCard,
  Gift,
  Scissors,
  ShoppingBag,
  Share2,
  MessageCircle,
  Camera,
} from 'lucide-react';

export default function RoomCard({
  selectedEndRoom,
  rooms,
  isSelectingStartRoom,
  onClose,
  onGetDirections,
  isMobile = false,
}) {
  const room = rooms.find(r => r.id === selectedEndRoom);

  if (!room) return null;

  return (
    <div className={isMobile ? 'md:hidden relative' : 'hidden md:block'}>
      {/* Ultra Modern Glass Card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl z-20 group"
        >
          <X
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        {/* Hero Header Section */}
        <div className="relative p-8 pb-6">
          <div className="flex items-start gap-6 pr-16">
            {room.logo && (
              <div className="flex-shrink-0 relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <img
                    src={room.logo}
                    alt={room.name}
                    className="relative h-24 w-24 object-contain rounded-3xl bg-white p-4 shadow-xl border-2 border-white/50"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-brand to-brand-dark text-white text-sm px-3 py-1.5 rounded-2xl font-bold shadow-lg">
                    Kat {room.floor ?? '?'}
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0 pt-2">
              <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                {room.name}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-1.5 shadow-sm">
                  <MapPin size={16} className="text-brand" />
                  <span className="font-semibold text-gray-700">Zemin Kat</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-3 py-1.5 shadow-sm">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="font-bold text-yellow-700">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div
          className={`relative px-8 pb-8 ${
            isMobile ? 'max-h-80 overflow-y-auto' : 'max-h-96 overflow-y-auto'
          }`}
        >
          {/* Social Media Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg">
                <Share2 size={20} className="text-white" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Sosyal Medya</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Instagram */}
              <a
                href={room.instagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-pink-300/40 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-pink-900">
                    Instagram
                  </span>
                </div>
              </a>

              {/* Facebook */}
              <a
                href={room.facebook || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-300/40 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Share2 size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-900">
                    Facebook
                  </span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={
                  room.whatsapp ||
                  `https://wa.me/${room.phone?.replace(/\D/g, '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-green-300/40 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-green-900">
                    WhatsApp
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Interactive Info Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {/* Hours Card */}
            {room.hours && (
              <div className="group bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-5 border border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <span className="font-bold text-blue-900">
                    Çalışma Saatleri
                  </span>
                </div>
                <p className="text-blue-800 font-semibold ml-11">
                  {room.hours}
                </p>
              </div>
            )}

            {/* Phone Card */}
            {room.phone && (
              <a
                href={`tel:${room.phone}`}
                className="group bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-5 border border-green-200/50 hover:border-green-300/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <span className="font-bold text-green-900">Telefon Ara</span>
                </div>
                <p className="text-green-800 font-semibold ml-11">
                  {room.phone}
                </p>
              </a>
            )}

            {/* Website Card */}
            {room.website && (
              <a
                href={room.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                      <Globe size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-900">Web Sitesi</p>
                      <p className="text-xs text-purple-700">
                        Resmi web sitesini ziyaret et
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    size={18}
                    className="text-purple-600 group-hover:scale-110 transition-transform"
                  />
                </div>
              </a>
            )}
          </div>

          {/* Promotion Banner */}
          {room.promotion && (
            <div className="mb-8 bg-gradient-to-r from-orange-400/20 to-red-400/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-300/50 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/30 rounded-xl">
                  <Tag size={20} className="text-orange-600" />
                </div>
                <span className="font-black text-orange-900 text-lg">
                  Özel Kampanya!
                </span>
              </div>
              <p className="text-orange-800 font-semibold leading-relaxed">
                {room.promotion}
              </p>
            </div>
          )}

          {/* Services Section */}
          {room.services && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-xl">
                  <ShoppingBag
                    size={24}
                    className="text-white drop-shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text">
                    Hizmetler & Avantajlar
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    Premium müşteri deneyimi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {room.services.split(',').map((service, idx) => {
                  // Service icon mapping
                  const getServiceIcon = serviceName => {
                    const name = serviceName.toLowerCase();
                    if (name.includes('iade') || name.includes('değişim'))
                      return RotateCcw;
                    if (name.includes('teslimat') || name.includes('kargo'))
                      return Truck;
                    if (name.includes('tadilat') || name.includes('tamir'))
                      return Scissors;
                    if (name.includes('hızlı') || name.includes('now'))
                      return Zap;
                    if (name.includes('öde') || name.includes('ödeme'))
                      return CreditCard;
                    if (name.includes('avantaj') || name.includes('paraf'))
                      return Gift;
                    return Shield;
                  };

                  const IconComponent = getServiceIcon(service);

                  // Modern vibrant color schemes for different services
                  const colorSchemes = [
                    'from-emerald-400/25 via-teal-400/20 to-cyan-400/25 border-emerald-400/50 text-emerald-900',
                    'from-blue-400/25 via-indigo-400/20 to-purple-400/25 border-blue-400/50 text-blue-900',
                    'from-violet-400/25 via-purple-400/20 to-fuchsia-400/25 border-violet-400/50 text-violet-900',
                    'from-orange-400/25 via-amber-400/20 to-yellow-400/25 border-orange-400/50 text-orange-900',
                    'from-rose-400/25 via-pink-400/20 to-red-400/25 border-rose-400/50 text-rose-900',
                    'from-lime-400/25 via-green-400/20 to-emerald-400/25 border-lime-400/50 text-lime-900',
                    'from-sky-400/25 via-cyan-400/20 to-teal-400/25 border-sky-400/50 text-sky-900',
                    'from-indigo-400/25 via-blue-400/20 to-cyan-400/25 border-indigo-400/50 text-indigo-900',
                  ];

                  const colorScheme = colorSchemes[idx % colorSchemes.length];

                  return (
                    <div
                      key={idx}
                      className={`group bg-gradient-to-r ${colorScheme} backdrop-blur-sm rounded-2xl p-4 border hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/60">
                          <IconComponent
                            size={22}
                            className="text-current drop-shadow-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm leading-relaxed">
                            {service.trim()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Services Summary */}
              <div className="mt-6 bg-gradient-to-r from-violet-50/90 via-purple-50/80 to-fuchsia-50/90 backdrop-blur-sm rounded-2xl p-5 border border-violet-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-sm">
                      <Star size={16} className="text-white fill-current" />
                    </div>
                    <span className="text-sm font-bold text-violet-900">
                      {room.services.split(',').length} farklı hizmet
                    </span>
                  </div>
                  <div className="text-xs text-violet-700 font-semibold bg-white/60 px-3 py-1.5 rounded-full">
                    Premium deneyim
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onGetDirections}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand via-purple-600 to-brand-dark text-white font-black text-lg hover:from-brand-dark hover:via-purple-700 hover:to-brand-darkest transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative">
              {isSelectingStartRoom ? 'Konumunuzu Seçin' : 'Yol Tarifi Al'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
