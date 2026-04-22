'use client';
import React from 'react';
import { Heart, Share2 } from 'lucide-react';

const StoreActionButtons = ({
  isFavorite,
  onFavoriteToggle,
  onShare,
  favoriteLoading = false,
}) => {
  return (
    <div className="flex space-x-3">
      {/* Favori Butonu */}
      <button
        onClick={onFavoriteToggle}
        disabled={favoriteLoading}
        className={`flex-1 p-4 rounded-2xl transition-all group ${
          isFavorite
            ? 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-400'
            : 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200'
        } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heart
          className={`w-5 h-5 mx-auto group-hover:scale-110 transition-transform ${
            isFavorite ? 'text-red-500 fill-red-500' : 'text-red-500'
          }`}
        />
      </button>

      {/* Paylaş Butonu */}
      <button
        onClick={onShare}
        className="flex-1 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-2xl transition-all group"
      >
        <Share2 className="w-5 h-5 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default StoreActionButtons;
