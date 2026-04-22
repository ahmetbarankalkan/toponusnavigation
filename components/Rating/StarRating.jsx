'use client';
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import StoreReviews from './StoreReviews';

const StarRating = ({
  storeId,
  userId,
  userName,
  onRatingChange,
  showReviews = true,
}) => {
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewsSection, setShowReviewsSection] = useState(false);

  // Mağazanın ortalama puanını ve kullanıcının puanını yükle
  useEffect(() => {
    if (!storeId) return;

    const loadRatings = async () => {
      try {
        // Ortalama puan
        const avgResponse = await fetch(`/api/ratings?storeId=${storeId}`);
        const avgData = await avgResponse.json();
        setAvgRating(avgData.avgRating || 0);
        setRatingCount(avgData.count || 0);

        // Kullanıcının puanı (eğer giriş yapmışsa)
        if (userId) {
          const userResponse = await fetch(
            `/api/ratings?storeId=${storeId}&userId=${userId}`
          );
          const userData = await userResponse.json();
          setUserRating(userData.rating || 0);
          setRating(userData.rating || 0);
        }
      } catch (error) {
        console.error('Rating yükleme hatası:', error);
        // Hata durumunda varsayılan değerleri set et
        setAvgRating(0);
        setRatingCount(0);
        setUserRating(0);
        setRating(0);
      }
    };

    loadRatings();
  }, [storeId, userId]);

  const handleStarClick = async starValue => {
    console.log('🌟 Star clicked:', { starValue, userId, storeId });

    if (!userId) {
      console.log('❌ No userId, showing alert');
      alert('Puan vermek için giriş yapmalısınız');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📤 Sending rating request:', {
        storeId,
        userId,
        rating: starValue,
      });

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          userId,
          rating: starValue,
        }),
      });

      console.log('📥 Rating response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Rating success:', result);

        setRating(starValue);
        setUserRating(starValue);

        // Ortalama puanı yeniden yükle
        const avgResponse = await fetch(`/api/ratings?storeId=${storeId}`);
        const avgData = await avgResponse.json();
        console.log('📊 Updated avg data:', avgData);

        setAvgRating(avgData.avgRating || 0);
        setRatingCount(avgData.count || 0);

        if (onRatingChange) {
          onRatingChange(starValue, avgData.avgRating, avgData.count);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Rating error response:', errorData);
        alert('Puan verme hatası: ' + (errorData.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ Puan verme hatası:', error);
      alert('Puan verme hatası: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayRating = hoveredStar || rating;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-2">
        {/* Yıldızlar */}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              disabled={isLoading || !userId}
              className={`transition-all duration-200 ${
                !userId
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                size={20}
                className={`${
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                } transition-colors duration-200`}
              />
            </button>
          ))}
        </div>

        {/* Puan bilgisi */}
        <div className="text-center">
          {avgRating > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="mx-1">•</span>
              <span>{ratingCount} değerlendirme</span>
            </div>
          )}

          {userRating > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              Puanınız: {userRating} yıldız
            </div>
          )}

          {!userId && (
            <div className="text-xs text-gray-500 mt-1">
              Puan vermek için giriş yapın
            </div>
          )}
        </div>
      </div>

      {/* Yorumlar Bölümü - Direkt Göster */}
      {showReviews && (
        <StoreReviews storeId={storeId} userId={userId} userName={userName} />
      )}
    </div>
  );
};

export default StarRating;
