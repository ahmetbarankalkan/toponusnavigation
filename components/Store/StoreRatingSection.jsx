'use client';
import React from 'react';
import { Star } from 'lucide-react';
import StarRating from '../Rating/StarRating';

const StoreRatingSection = ({
  storeId,
  userId,
  userName,
  showReviews = true,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-500" />
        Değerlendirme & Yorumlar
      </h3>

      <StarRating
        storeId={storeId}
        userId={userId}
        userName={userName}
        showReviews={showReviews}
      />
    </div>
  );
};

export default StoreRatingSection;
