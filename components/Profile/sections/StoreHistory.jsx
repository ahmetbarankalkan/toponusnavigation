'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StoreHistory({ setActiveSection }) {
  const [storeHistory, setStoreHistory] = useState([]);
  const [favorites, setFavorites] = useState([]); // Favori storeId'leri
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem('store_history') || '[]'
      );
      setStoreHistory(history);
    } catch (err) {
      console.error('Store history load error:', err);
    }

    // Favorileri getir
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('user_token');
        if (!token) return;
        const response = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setFavorites(data.favorites.map(f => f.storeId));
        }
      } catch (err) {
        console.error('Favoriler yüklenirken hata:', err);
      }
    };
    fetchFavorites();
  }, []);

  const handleYolTarifi = (store) => {
    const slug = searchParams?.get('slug') || 'ankamall';
    router.push(`/?slug=${slug}&targetRoom=${store.id}&selectStart=true`);
  };

  const handleDetaylar = (store) => {
    const slug = searchParams?.get('slug') || 'ankamall';
    router.push(`/?slug=${slug}&search=${store.name}`);
  };

  const handleFavoriteToggle = async (store) => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        alert('Favorilere eklemek için giriş yapmalısınız');
        return;
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.name || 'Store',
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.action === 'added') {
          setFavorites(prev => [...prev, store.id]);
        } else if (data.action === 'removed') {
          setFavorites(prev => prev.filter(id => id !== store.id));
        }
      }
    } catch (error) {
      console.error('Favori değiştirme hatası:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#EAEAEA] overflow-hidden relative">
      {/* Curved Header Block */}
      <div 
        className="relative bg-[#253C51] shrink-0 flex flex-col items-center"
        style={{ height: '180px', borderRadius: '0px 0px 20px 20px' }}
      >
        <div className="w-full px-6 flex items-center justify-between h-full">
          {/* Back Button */}
          <button 
            onClick={() => setActiveSection('main')} 
            className="text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Title - Centered vertically and horizontally */}
          <h2
            className="text-white text-[16px] font-medium absolute left-1/2 -translate-x-1/2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Mağaza Geçmişi
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Floating Center Icon */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '125px' }}>
        <div 
          className="bg-white flex items-center justify-center relative shadow-[0_1px_7.6px_rgba(0,0,0,0.25)] rounded-[20px]"
          style={{ width: '110px', height: '105px' }}
        >
          <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28.6429" cy="28.6429" r="28.6429" fill="#253C51"/>
            <circle cx="28.6429" cy="28.6429" r="28.6429" stroke="white"/>
            <path d="M33.9767 17.9965C29.4274 15.4292 23.8283 16.2461 20.0956 19.7469V17.6464C20.0956 16.9462 19.629 16.4794 18.9291 16.4794C18.2292 16.4794 17.7626 16.9462 17.7626 17.6464V22.8976C17.7626 23.5977 18.2292 24.0645 18.9291 24.0645H24.1782C24.8781 24.0645 25.3447 23.5977 25.3447 22.8976C25.3447 22.1974 24.8781 21.7306 24.1782 21.7306H21.3787C23.1284 19.8635 25.578 18.8133 28.1443 18.8133C33.2768 18.8133 37.4761 23.0143 37.4761 28.1488C37.4761 33.2833 33.2768 37.4842 28.1443 37.4842C23.0118 37.4842 18.8124 33.2833 18.8124 28.1488C18.8124 27.4486 18.3459 26.9818 17.646 26.9818C16.9461 26.9818 16.4795 27.4486 16.4795 28.1488C16.4795 34.5669 21.7286 39.8181 28.1443 39.8181C32.3436 39.8181 36.193 37.6009 38.2926 33.9834C41.4421 28.3821 39.5757 21.2639 33.9767 17.9965Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-[80px] pb-[160px] flex flex-col items-center touch-pan-y overscroll-contain">
        {storeHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-center">
            <p className="text-[#253C51] text-[15px] font-medium mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Henüz mağaza geçmişiniz yok
            </p>
            <p className="text-gray-500 text-[13px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Haritadan mağazalara tıkladığınızda burada görünecek
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[357px] space-y-[14px] mx-auto">
            {storeHistory.map((store, index) => (
              <div
                key={store.id + index}
                className="w-full rounded-[20px] flex items-center transition-all"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.55)', 
                  boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.15)',
                  padding: '10px 14px 10px 10px',
                  minHeight: '88px'
                }}
              >
                {/* Store Logo */}
                <div 
                  className="shrink-0 flex items-center justify-center overflow-hidden bg-white"
                  style={{
                    width: '66px',
                    height: '66px',
                    borderRadius: '14px',
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-contain p-2.5"
                      onError={e => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center text-[#253C51] font-bold text-[18px] ${store.logo ? 'hidden' : 'flex'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {store.name?.substring(0,1)?.toUpperCase() || 'S'}
                  </div>
                </div>

                {/* Center Column: Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ paddingLeft: '12px', paddingRight: '8px' }}>
                  <h3
                    className="text-[#000000] truncate uppercase mb-[1px]"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '20px', letterSpacing: '0.02em' }}
                  >
                    {store.name}
                  </h3>
                  <p
                    className="mb-[3px]"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '11px', lineHeight: '15px', color: 'rgba(0,0,0,0.5)' }}
                  >
                    {store.category || 'Giyim'}
                  </p>
                  
                  {/* Stars */}
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <svg key={star} width="11" height="11" viewBox="0 0 24 24" fill="#32475A" className="mr-[1.5px]">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#B0B0B0" className="mr-[3px]">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '11px', lineHeight: '15px', color: '#000' }}>
                      {store.rating || '4.1'}
                    </span>
                  </div>
                </div>

                {/* Right Column: Buttons */}
                <div className="flex flex-col items-end justify-center shrink-0 gap-[7px]" style={{ width: '120px' }}>
                  
                  {/* Top row: Detaylara göz at + Heart */}
                  <div className="flex items-center gap-[6px]">
                    <button 
                      onClick={() => handleDetaylar(store)}
                      className="flex items-center justify-center transition-colors hover:bg-[#1B3349]/10"
                      style={{
                        border: '1px solid #253C51',
                        borderRadius: '20px',
                        padding: '3px 10px',
                      }}
                    >
                      <span 
                        style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: '8px', color: '#000', whiteSpace: 'nowrap' }}
                      >
                        Detaylara göz at
                      </span>
                    </button>
                    
                    {/* Heart Icon */}
                    <button onClick={() => handleFavoriteToggle(store)} className="hover:scale-110 transition-transform bg-transparent flex items-center justify-center p-0">
                      {favorites.includes(store.id) ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" stroke="#253C51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" fill="#253C51"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" stroke="#253C51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Yol Tarifi Al button */}
                  <button
                    onClick={() => handleYolTarifi(store)}
                    className="w-full flex items-center justify-center hover:bg-[#1a2a3a] transition-colors"
                    style={{
                      backgroundColor: '#253C51',
                      borderRadius: '20px',
                      padding: '6px 16px',
                    }}
                  >
                    <span 
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '11px', color: '#FFFFFF', whiteSpace: 'nowrap' }}
                    >
                      Yol Tarifi Al
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
