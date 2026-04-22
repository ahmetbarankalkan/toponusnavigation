'use client';
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Calendar, ChevronDown } from 'lucide-react';
import './StoreReviewSection.css';

const StoreReviewSection = ({ storeId, userId, userName }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Yorumları yükle
  useEffect(() => {
    if (!storeId) return;
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, userId]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const url = userId
        ? `/api/reviews?storeId=${storeId}&userId=${userId}`
        : `/api/reviews?storeId=${storeId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        if (userId && data.review) {
          setUserReview(data.review);
          setRating(data.review.rating);
          setComment(data.review.comment);
        } else {
          setUserReview(null);
        }
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
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
        loadReviews();
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

  const renderStars = (starRating, interactive = false, onStarClick = null) => {
    return (
      <div className="review-stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onStarClick && onStarClick(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            disabled={!interactive}
            className={`review-star-button ${interactive ? 'interactive' : ''}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0L12.2451 6.90983H19.5106L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983H7.75486L10 0Z"
                fill={
                  star <= (interactive ? hoveredStar || starRating : starRating)
                    ? '#FFD700'
                    : '#E5E7EB'
                }
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const displayedReviews = isExpanded ? reviews : reviews.slice(0, 2);
  const hasMoreReviews = reviews.length > 2;

  return (
    <div className="review-section-container">
      {/* SVG Background Border */}
      <svg
        className="review-border-svg"
        viewBox="0 0 359 199"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M339.517 0.00683594C350.324 0.280846 359 9.12703 359 20V179C359 189.873 350.324 198.719 339.517 198.993L339 199H20C9.12703 199 0.280845 190.324 0.00683594 179.517L0 179V20C0 8.95431 8.95431 3.58368e-07 20 0H75V1H20C9.50659 1 1 9.50659 1 20V179C1 189.493 9.50659 198 20 198H339C349.493 198 358 189.493 358 179V20C358 9.67049 349.757 1.26588 339.49 1.00586L339 1H286V0H339L339.517 0.00683594Z"
          fill="#32475A"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Header */}
      <div className="review-section-header">
        <div className="review-section-title-wrapper">
          <span className="review-section-title">Değerlendirme / Yorumlar</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="review-content-area">
        {/* Bildirim */}
        {notification && (
          <div className={`review-notification ${notification.type}`}>
            <span>
              {notification.type === 'success' ? '✓' : '✕'}{' '}
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="notification-close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Yorum Yap Butonu veya Durum */}
        {userId && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="add-review-button"
          >
            <MessageCircle size={16} />
            <span>Yorum Yap</span>
          </button>
        )}

        {/* Yorum Formu */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="review-form-group">
              <label className="review-form-label">Puanınız</label>
              {renderStars(rating, true, setRating)}
            </div>

            <div className="review-form-group">
              <label className="review-form-label">Yorumunuz</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Mağaza hakkındaki düşüncelerinizi paylaşın..."
                className="review-textarea"
                rows={4}
                maxLength={500}
              />
              <div className="review-char-count">
                {comment.length}/500 karakter
              </div>
            </div>

            <div className="review-form-actions">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="review-submit-btn"
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
                className="review-cancel-btn"
              >
                İptal
              </button>
            </div>
          </form>
        )}

        {/* Kullanıcının Mevcut Yorumu */}
        {userReview && userReview.approved && (
          <div className="user-review-card">
            <div className="user-review-header">
              <span className="user-review-badge">Sizin Yorumunuz</span>
              <span className="user-review-note">(Yorum değiştirilemez)</span>
            </div>
            <div className="user-review-rating">
              {renderStars(userReview.rating)}
              <span className="user-review-date">
                {formatDate(userReview.createdAt)}
              </span>
            </div>
            <p className="user-review-comment">{userReview.comment}</p>
          </div>
        )}

        {/* Yorumlar Listesi */}
        {isLoading ? (
          <div className="review-loading">
            <div className="review-spinner"></div>
            <p>Yorumlar yükleniyor...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="review-empty-state">
            <MessageCircle className="empty-icon" size={28} />
            <p className="empty-title">Henüz yorum yapılmamış</p>
            <p className="empty-subtitle">
              {userId
                ? 'İlk yorumu siz yapın!'
                : 'Giriş yaparak yorum yapabilirsiniz'}
            </p>
          </div>
        ) : (
          <>
            <div className="reviews-list">
              {displayedReviews
                .filter(review => review.userId !== userId)
                .map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-user-avatar">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="review-content">
                      <div className="review-header">
                        <h4 className="review-user-name">{review.userName}</h4>
                        <div className="review-meta">
                          {renderStars(review.rating)}
                          <span className="review-date">
                            <Calendar size={12} />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Daha Fazla Göster Butonu */}
            {hasMoreReviews && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="show-more-btn"
              >
                <span>
                  {isExpanded
                    ? 'Daha Az Göster'
                    : `${reviews.length - 2} Yorum Daha Göster`}
                </span>
                <ChevronDown
                  size={16}
                  className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreReviewSection;
