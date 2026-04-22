'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavbar from '@/components/Navigation/BottomNavbar';
import StoreDetailDesign from '@/components/Store/StoreDetailDesign';

function FavoritesContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(3);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = localStorage.getItem('user_token');
        if (!token) {
          setLoading(false);
          setFavorites([]);
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);

        const slug = searchParams.get('slug') || 'ankamall';

        const [favoritesRes, placesRes] = await Promise.all([
          fetch('/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/places?slug=${slug}`),
        ]);

        const [favData, placesData] = await Promise.all([
          favoritesRes.json(),
          placesRes.json(),
        ]);

        if (favData.success && favData.favorites.length > 0) {
          // Prepare basic data from favorites API
          const initialFavorites = favData.favorites.map(fav => ({
            id: fav.storeId,
            name: fav.storeName,
            floor: null,
            category: null,
            description: null,
            image: null,
            logo: null,
            rating: 4.1,
          }));

          // Fetch rooms data to enrich
          const roomsRes = await fetch(
            `/api/rooms?place_id=${placesData.place_id}`
          );
          const roomsData = await roomsRes.json();

          const allRooms = [];
          Object.keys(roomsData).forEach(floor => {
            if (roomsData[floor]?.features) {
              roomsData[floor].features.forEach(feature => {
                const props = feature.properties;
                allRooms.push({
                  id: `f${props.floor}-${props.id}`,
                  name: props.name,
                  floor: props.floor,
                  category: props.category,
                  description: props.description,
                  header_image: props.header_image,
                  logo: props.logo,
                  rating: props.rating,
                });
              });
            }
          });

          // Enrich data
          const enrichedFavorites = initialFavorites.map(fav => {
            const room = allRooms.find(r => r.id === fav.id);
            return {
              ...fav,
              floor: room?.floor,
              category: room?.category,
              description: room?.description,
              image: room?.header_image || room?.logo,
              // Keep logo as null to preserve the text-based logo the user liked
              logo: null, 
              rating: room?.rating || 4.1,
            };
          });

          // UPDATE STATE ONLY ONCE
          setFavorites(enrichedFavorites);
          setLoading(false);
        } else {
          setFavorites([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setLoading(false);
      }
    };

    loadFavorites();
  }, [searchParams]);

  const removeFavorite = async storeId => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        alert(t('favorites.loginRequired'));
        return;
      }

      const store = favorites.find(fav => fav.id === storeId);
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: storeId,
          storeName: store?.name || 'Store',
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedFavorites = favorites.filter(fav => fav.id !== storeId);
        setFavorites(updatedFavorites);
      } else {
        alert(data.error || t('errors.sendMessageError'));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert(t('errors.sendMessageError'));
    }
  };

  const navigateToStore = store => {
    const slug = searchParams.get('slug') || 'ankamall';
    router.push(`/?slug=${slug}&targetRoom=${store.id}&selectStart=true`);
  };

  const handleDetaylar = (store) => {
    setSelectedStore(store);
  };

  /* ─── Tab Bar ─── */
  const TabBar = () => (
    <div className="flex items-center justify-center gap-[8px] mx-auto px-4 w-full max-w-[360px]" style={{ height: '34px' }}>
      {[
        { key: 'stores', label: 'Mağazalar' },
        { key: 'products', label: 'Ürünler' },
        { key: 'campaigns', label: 'Kampanyalar' },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className="flex-1 h-full flex items-center justify-center rounded-[20px] transition-all"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            fontSize: '9px',
            lineHeight: '13px',
            ...(activeTab === tab.key
              ? { backgroundColor: '#1B3349', color: '#FFFFFF', border: 'none' }
              : { backgroundColor: 'transparent', color: '#1B3349', border: '1px solid #1B3349' }
            ),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  /* ─── Store Card (Figma) ─── */
  const StoreCard = ({ store }) => (
    <div
      className="relative overflow-hidden w-full max-w-[355px] mx-auto shadow-md"
      style={{ height: '117px', borderRadius: '20px' }}
    >
      {/* Background Image + Dark Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: store.image
            ? `linear-gradient(0deg, rgba(0,0,0,0.46), rgba(0,0,0,0.46)), url(${store.image})`
            : 'linear-gradient(0deg, rgba(0,0,0,0.46), rgba(0,0,0,0.46)), linear-gradient(135deg, #3a5a7c 0%, #1B3349 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '20px',
        }}
      />

      {/* Top-Left: Detaylara göz at */}
      <button
        onClick={() => handleDetaylar(store)}
        className="absolute flex items-center justify-center hover:bg-white/20 transition-colors"
        style={{
          left: '13px',
          top: '13px',
          width: '71px',
          height: '22px',
          border: '1px solid rgba(255,255,255,0.99)',
          borderRadius: '20px',
        }}
      >
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '7px', lineHeight: '10px', color: '#FFFFFF' }}>
          Detaylara göz at
        </span>
      </button>

      {/* Top-Right: Rating Pill */}
      <div
        className="absolute flex items-center justify-center gap-[3px]"
        style={{
          right: '40px',
          top: '12px',
          width: '39px',
          height: '23px',
          backgroundColor: '#FDFDFD',
          borderRadius: '20px',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0L6.12257 3.45492H9.75528L6.81636 5.59017L7.93893 9.04508L5 6.90983L2.06107 9.04508L3.18364 5.59017L0.244718 3.45492H3.87743L5 0Z" fill="#1B3349"/>
        </svg>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '9px', lineHeight: '14px', color: '#1B3349' }}>
          {store.rating || '4.1'}
        </span>
      </div>

      {/* Top-Right: Heart */}
      <button
        onClick={() => removeFavorite(store.id)}
        className="absolute flex items-center justify-center hover:scale-110 transition-transform"
        style={{
          right: '9px',
          top: '12px',
          width: '24px',
          height: '22.74px',
          backgroundColor: 'rgba(255,255,255,0.99)',
          borderRadius: '20px',
        }}
      >
        <svg width="11" height="10" viewBox="0 0 24 24" fill="#1B3349">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Bottom-Left: Logo Pill */}
      <div
        className="absolute flex items-center justify-center overflow-hidden bg-white/95"
        style={{
          left: '13px',
          bottom: '10px',
          width: '84px',
          height: '32px',
          borderRadius: '20px',
        }}
      >
        {store.logo && (
          <img
            src={store.logo}
            alt={store.name}
            className="h-[18px] w-auto object-contain"
            style={{ display: 'block' }}
            onError={e => {
              e.currentTarget.style.display = 'none';
              const span = e.currentTarget.nextElementSibling;
              if (span) span.style.display = 'flex';
            }}
          />
        )}
        <span
          className={`text-[#1B3349] font-semibold ${store.logo ? 'hidden' : 'flex'}`}
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontSize: '9px',
            textAlign: 'center'
          }}
        >
          {store.name?.toUpperCase() || 'STORE'}
        </span>
      </div>

      {/* Bottom-Right: Yol Tarifi Al */}
      <button
        onClick={() => navigateToStore(store)}
        className="absolute flex items-center justify-center hover:bg-gray-100 transition-colors"
        style={{
          right: '9px',
          bottom: '10px',
          width: '84px',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.99)',
          borderRadius: '20px',
        }}
      >
        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '8px', lineHeight: '12px', color: '#000000' }}>
          Yol Tarifi Al
        </span>
      </button>
    </div>
  );

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#EAEAEA] overflow-hidden flex flex-col touch-pan-y">
        <div className="flex-1 overflow-y-auto pb-40">
          <div className="pt-[50px] px-[26px]">
            <div className="mb-6"><TabBar /></div>
            <div className="flex flex-col items-center gap-[25px] w-full max-w-[400px] mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-[20px] w-full" style={{ height: '117px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
              ))}
            </div>
          </div>
        </div>
        <BottomNavbar activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} searchParams={searchParams} />
      </div>
    );
  }

  /* ─── Main ─── */
  return (
    <div className="h-[100dvh] bg-[#EAEAEA] overflow-hidden flex flex-col">
      <div
        className={`flex-1 min-h-0 ${
          !isLoggedIn || (activeTab === 'stores' && favorites.length === 0)
            ? 'overflow-hidden flex flex-col'
            : 'overflow-y-auto pb-[180px] touch-pan-y overscroll-contain'
        }`}
      >
        {isLoggedIn && (
          <div className="pt-[50px] pb-[16px] flex justify-center sticky top-0 z-10 bg-[#EAEAEA]">
            <TabBar />
          </div>
        )}

        <div className={`${favorites.length === 0 ? 'flex-1 flex flex-col' : ''}`}>
          {activeTab === 'stores' && (
            <>
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center px-4 w-full flex-1 min-h-[70vh]">
                  <div className="mb-8">
                    <svg width="159" height="161" viewBox="0 0 159 161" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M114.658 51.6284C118.218 47.5216 120.331 42.3128 120.658 36.8336V12.2779C120.658 9.02158 119.394 5.89865 117.144 3.5961C114.893 1.29356 111.841 0 108.659 0L82.9789 0C77.6238 0.335109 72.5329 2.49647 68.5191 6.13893L3.53995 72.6236C2.41696 73.7658 1.52601 75.1241 0.918452 76.6202C0.310896 78.1164 -0.00125087 79.7207 3.82622e-06 81.3409C-0.00252491 84.5831 1.24846 87.6948 3.47996 89.9968L32.5796 119.709C33.694 120.851 35.0175 121.756 36.4742 122.374C37.931 122.992 39.4925 123.31 41.0694 123.31C42.6464 123.31 44.2079 122.992 45.6647 122.374C47.1214 121.756 48.4449 120.851 49.5593 119.709L55.5592 113.57C55.9579 113.134 56.2263 112.59 56.3326 112.002C56.4389 111.415 56.3787 110.809 56.1592 110.255C53.8909 104.692 53.2736 98.5687 54.3846 92.6489C55.4955 86.7291 58.2854 81.2751 62.4062 76.9671C66.527 72.6591 71.7963 69.688 77.5568 68.4243C83.3173 67.1606 89.314 67.6603 94.7987 69.8611C95.3397 70.0857 95.9322 70.1472 96.5063 70.0384C97.0804 69.9297 97.6121 69.6551 98.0386 69.2472L114.658 51.6284ZM75.539 33.7641C75.539 31.3358 76.2427 28.962 77.5613 26.9429C78.8799 24.9238 80.754 23.3502 82.9467 22.4209C85.1393 21.4916 87.5521 21.2484 89.8798 21.7222C92.2076 22.1959 94.3457 23.3653 96.0239 25.0824C97.7022 26.7995 98.845 28.9872 99.3081 31.3688C99.7711 33.7505 99.5334 36.2192 98.6252 38.4627C97.717 40.7062 96.1789 42.6237 94.2055 43.9728C92.2322 45.3219 89.9121 46.042 87.5388 46.042C84.3562 46.042 81.304 44.7485 79.0536 42.4459C76.8032 40.1434 75.539 37.0204 75.539 33.7641Z" fill="#1B3349"/>
                      <path d="M81.1639 72.3272C76.1571 73.0996 71.4641 75.2417 67.6083 78.5146C63.7524 81.7876 60.8853 86.0626 59.3266 90.8632C57.7678 95.6637 57.5788 100.801 58.7804 105.702C59.9821 110.604 62.5273 115.076 66.1322 118.621L105.804 159.746C106.153 160.14 106.582 160.456 107.063 160.672C107.544 160.888 108.065 161 108.593 161C109.121 161 109.642 160.888 110.123 160.672C110.604 160.456 111.033 160.14 111.382 159.746L150.976 118.699C153.52 116.165 155.538 113.158 156.915 109.849C158.291 106.539 159 102.992 159 99.4093C159 95.8269 158.291 92.2797 156.915 88.97C155.538 85.6604 153.52 82.6531 150.976 80.12C148.433 77.5869 145.413 75.5776 142.089 74.2067C138.765 72.8358 135.203 72.1302 131.606 72.1302C128.008 72.1302 124.446 72.8358 121.122 74.2067C117.798 75.5776 114.779 77.5869 112.235 80.12L109.91 82.5119C109.527 82.8535 109.03 83.0424 108.516 83.0424C108.001 83.0424 107.504 82.8535 107.121 82.5119L104.796 80.12C101.765 77.0416 98.0386 74.7284 93.9281 73.373C89.8177 72.0175 85.4416 71.659 81.1639 72.3272Z" fill="#1B3349"/>
                    </svg>
                  </div>
                  <p className="text-[#1B3349] text-center text-[13px] font-medium leading-[19.5px] mb-7 max-w-[321px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Favori ürünlerine, mağazalarına ve kampanyalarına erişebilmek için önce;
                  </p>
                  <button onClick={() => router.push('/profile')} className="w-[268px] h-[43px] bg-[#1B3349] text-white text-[11px] font-normal rounded-[20px] mb-3.5 hover:bg-[#1B3349]/90 transition-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Giriş Yap
                  </button>
                  <span className="text-[#1B3349] text-[11px] font-normal mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>ve ya</span>
                  <button onClick={() => router.push('/profile?tab=signup')} className="w-[268px] h-[43px] border border-[#1B3349] text-[#1B3349] text-[11px] font-normal rounded-[20px] hover:bg-[#1B3349]/5 transition-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Kayıt Ol
                  </button>
                </div>
              ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 w-full flex-1 min-h-[70vh] pb-20">
                  <div className="mb-8">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#1B3349" stroke="#1B3349" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <p className="text-[#1B3349] text-center text-[15px] font-medium leading-[22px] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Henüz favori mağazanız yok
                  </p>
                  <p className="text-gray-500 text-center text-[13px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Mağazaları keşfedin ve favorilerinize ekleyin
                  </p>
                  <button
                    onClick={() => { const slug = searchParams.get('slug') || 'ankamall'; router.push(`/?slug=${slug}`); }}
                    className="px-6 py-2 bg-[#1B3349] text-white text-[13px] font-medium rounded-[20px] hover:bg-[#1B3349]/90 transition-all"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Mağazaları Keşfet
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-[25px] px-[26px] pb-6">
                  {favorites.map(store => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'products' && (
            <div className="flex flex-col items-center justify-center px-4 w-full flex-1 min-h-[60vh] pb-20">
              <div className="mb-8 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" fill="#1B3349" stroke="#1B3349" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-[#1B3349] text-center text-[18px] font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Favori Ürünler
              </h2>
              <p className="text-gray-500 text-center text-[13px] max-w-[250px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Favori ürünleriniz için geliştirmelerimiz devam ediyor. Çok yakında burada!
              </p>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="flex flex-col items-center justify-center px-4 w-full flex-1 min-h-[60vh] pb-20">
              <div className="mb-8 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 7H7.01M13 3L21 11L11 21L3 13V3H13Z" fill="#1B3349" stroke="#1B3349" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-[#1B3349] text-center text-[18px] font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Favori Kampanyalar
              </h2>
              <p className="text-gray-500 text-center text-[13px] max-w-[250px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Size özel kampanyaları takip edebileceğiniz bu bölüm çok yakında hizmetinizde!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Store Detail Popup */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedStore(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          
          {/* Popup Card */}
          <div
            className="relative w-full max-w-[420px] rounded-t-[32px] animate-slideUp flex flex-col bg-[#EAEAEA]"
            style={{ 
              height: '85vh', 
              maxHeight: '85vh',
              boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedStore(null)}
              className="absolute top-4 right-4 z-[60] w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#32475A" />
              </svg>
            </button>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-20">
              <StoreDetailDesign 
                store={selectedStore} 
                onGetDirections={() => {
                  setSelectedStore(null);
                  navigateToStore(selectedStore);
                }}
                onToggleFavorite={() => removeFavorite(selectedStore.id)}
                isFavorite={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <BottomNavbar activeNavItem={activeNavItem} setActiveNavItem={setActiveNavItem} searchParams={searchParams} />
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesContent />
    </Suspense>
  );
}
