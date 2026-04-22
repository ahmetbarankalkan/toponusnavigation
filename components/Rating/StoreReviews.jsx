'use client';
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Calendar } from 'lucide-react';

const StoreReviews = ({ storeId, userId, userName }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Yorumları yükle - component mount olduğunda ve storeId/userId değiştiğinde
  useEffect(() => {
    if (!storeId) return;

    console.log('🔄 StoreReviews useEffect triggered:', { storeId, userId });
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, userId]);

  const loadReviews = async () => {
    console.log('📥 loadReviews called:', { storeId, userId });
    setIsLoading(true);

    try {
      const url = userId
        ? `/api/reviews?storeId=${storeId}&userId=${userId}`
        : `/api/reviews?storeId=${storeId}`;

      console.log('🌐 Fetching reviews from:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('📦 Reviews data received:', data);

      if (response.ok) {
        // Tüm onaylanmış yorumları ayarla
        setReviews(data.reviews || []);
        console.log('✅ Reviews set:', data.reviews?.length || 0, 'reviews');

        // Kullanıcının kendi yorumunu ayarla (varsa)
        if (userId && data.review) {
          setUserReview(data.review);
          setRating(data.review.rating);
          setComment(data.review.comment);
          console.log('✅ User review set:', data.review);
        } else {
          setUserReview(null);
          console.log('ℹ️ No user review');
        }
      } else {
        console.error('❌ API error:', response.status, data);
      }
    } catch (error) {
      console.error('❌ Yorumlar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async e => {
    e.preventDefault();

    if (!userId) {
      setNotification({
        type: 'error',
        message: 'Yorum yapmak için giriş yapmalısınız',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (rating === 0) {
      setNotification({
        type: 'error',
        message: 'Lütfen bir puan verin',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!comment.trim()) {
      setNotification({
        type: 'error',
        message: 'Lütfen bir yorum yazın',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          userId,
          userName: userName || 'Anonim Kullanıcı',
          rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        setShowReviewForm(false);
        setRating(0);
        setComment('');
        loadReviews(); // Yorumları yeniden yükle
        setNotification({
          type: 'success',
          message: 'Yorumunuz başarıyla kaydedildi!',
        });
        setTimeout(() => setNotification(null), 5000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message:
            'Yorum kaydedilirken hata: ' +
            (errorData.error || 'Bilinmeyen hata'),
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      setNotification({
        type: 'error',
        message: 'Yorum gönderilirken hata oluştu',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick && onStarClick(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-all duration-200`}
          >
            <Star
              size={16}
              className={`${
                star <= (interactive ? hoveredStar || rating : rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Bildirim */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span className="flex items-center">
            {notification.type === 'success' ? '✓' : '✕'} {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="mr-2" size={20} />
          Mağaza Yorumları
        </h3>

        {userId && !userReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Yorum Yap
          </button>
        )}

        {userId && userReview && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Yorumunuz kaydedildi
          </span>
        )}
      </div>

      {/* Yorum Formu */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puanınız
            </label>
            {renderStars(rating, true, setRating)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yorumunuz
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Mağaza hakkındaki düşüncelerinizi paylaşın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/500 karakter
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setRating(0);
                setComment('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Kullanıcının Mevcut Yorumu - Sadece onaylanmışsa göster */}
      {userReview && userReview.approved && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Sizin Yorumunuz
            </span>
            <span className="text-xs text-gray-500">
              (Yorum değiştirilemez)
            </span>
          </div>
          <div className="flex items-center mb-2">
            {renderStars(userReview.rating)}
            <span className="ml-2 text-sm text-gray-600">
              {formatDate(userReview.createdAt)}
            </span>
          </div>
          <p className="text-gray-700">{userReview.comment}</p>
        </div>
      )}

      {/* Tüm Yorumlar Listesi */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Yorumlar yükleniyor...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            Henüz yorum yapılmamış
          </p>
          <p className="text-sm text-gray-500">
            {userId
              ? 'İlk yorumu siz yapın!'
              : 'Giriş yaparak yorum yapabilirsiniz'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter(review => review.userId !== userId) // Kullanıcının kendi yorumunu tekrar gösterme
            .map((review, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        {review.userName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default StoreReviews;
