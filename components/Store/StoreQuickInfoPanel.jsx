import React from 'react';
import { X } from 'lucide-react';
import './StoreQuickInfoPanel.css';

/**
 * Mağaza Hızlı Bilgi Paneli
 * Kullanıcı mağazaya tıkladığında gösterilen küçük bilgi kartı
 * Admin panelinden gelen bilgileri gösterir
 */
export default function StoreQuickInfoPanel({
  store,
  onClose,
  onDetailsClick,
  onRouteClick,
  onFavoriteToggle,
  isFavorite = false,
}) {
  const [storeRating, setStoreRating] = React.useState({ avg: 0, count: 0 });

  // Rating bilgisini yükle
  React.useEffect(() => {
    if (store?.id) {
      fetch(`/api/ratings?storeId=${store.id}`)
        .then(res => res.json())
        .then(data => {
          setStoreRating({
            avg: data.avgRating || 0,
            count: data.count || 0,
          });
        })
        .catch(err => console.error('Rating yükleme hatası:', err));
    }
  }, [store?.id]);

  if (!store) return null;

  return (
    <div className="store-quick-info-panel">
      <div className="store-quick-info-wrapper">
        <div className="store-quick-info-content">
          {/* Favori Butonu (Kalp) - Sol üstte */}
          <button
            className="store-quick-favorite-btn"
            onClick={onFavoriteToggle}
            aria-label={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={isFavorite ? '#1B3349' : 'none'}
              stroke={isFavorite ? '#1B3349' : '#263D52'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Kapatma Butonu - Sağ üstte */}
          <button
            className="store-quick-close-btn"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={12} />
          </button>

          {/* Mağaza Logosu */}
          <div className="store-quick-logo-container">
            <div className="store-quick-logo-bg" />
            {store.logo ? (
              <img
                className="store-quick-logo"
                alt={store.name}
                src={store.logo}
              />
            ) : (
              <div className="store-quick-logo-placeholder">
                {store.name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          {/* Mağaza Bilgileri */}
          <div className="store-quick-info">
            <h3 className="store-quick-name">{store.name || 'Mağaza'}</h3>
            <p className="store-quick-hours">
              {store.hours || '09:00 - 22:00'}
            </p>
          </div>

          {/* Yıldız Değerlendirme - Detaylar butonu ile aynı hizada */}
          {storeRating.count > 0 && (
            <div className="store-quick-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`store-quick-star ${
                    star <= Math.round(storeRating.avg) ? 'filled' : ''
                  }`}
                  width="14"
                  height="13"
                  viewBox="0 0 14 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 0L8.5716 4.83688H13.6574L9.5429 7.82624L11.1145 12.6631L7 9.67376L2.8855 12.6631L4.4571 7.82624L0.342604 4.83688H5.4284L7 0Z"
                    fill="currentColor"
                  />
                </svg>
              ))}
            </div>
          )}

          {/* Detaylara Göz At Butonu */}
          <button className="store-quick-details-btn" onClick={onDetailsClick}>
            Detaylara göz at
          </button>

          {/* Yol Tarifi Al Butonu */}
          <button className="store-quick-route-btn" onClick={onRouteClick}>
            Yol Tarifi Al
          </button>
        </div>
      </div>
    </div>
  );
}
