'use client';
import React from 'react';
import {
  MapPin,
  Star,
  Heart,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function KioskStoreCard({ store, onClick, featured = false }) {
  if (featured) {
    // Küçük kart - Popüler yerler için
    return (
      <button
        onClick={() => onClick(store)}
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 hover:from-blue-50 hover:to-blue-100 transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500 group"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-lg transition-shadow">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <ShoppingBag className="w-8 h-8 text-gray-600" />
            )}
          </div>
          {store.hasPromotion && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="text-base font-bold text-gray-900 truncate">
          {store.name}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Kat {store.floor === 0 ? 'Z' : store.floor}
        </div>
        {store.rating && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {store.rating}
            </span>
          </div>
        )}
      </button>
    );
  }

  // Büyük kart - Liste için
  return (
    <button
      onClick={() => onClick(store)}
      className="w-full bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-blue-500 group"
    >
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center p-3 group-hover:scale-110 transition-transform">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            )}
          </div>
          {store.hasPromotion && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{store.name}</h3>
            {store.isFavorite && (
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span className="text-base font-medium">
                Kat {store.floor === 0 ? 'Zemin' : store.floor}
              </span>
            </div>
            {store.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-base font-medium">{store.rating}</span>
              </div>
            )}
            {store.category && (
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {store.category}
              </span>
            )}
          </div>
          {store.hasPromotion && (
            <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-bold">
              <Sparkles className="w-3 h-3" />
              Kampanya Var!
            </div>
          )}
        </div>

        <ChevronRight className="w-8 h-8 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}
