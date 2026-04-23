'use client';
import React, { useState } from 'react';
import StoreReviewSection from './StoreReviewSection';

const StoreDetailDesign = ({
  store,
  userId,
  userName,
  onGetDirections,
  onToggleFavorite,
  isFavorite: isFavoriteProp = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);

  React.useEffect(() => {
    setIsFavorite(isFavoriteProp);
  }, [isFavoriteProp]);

  const storeImage =
    store?.image ||
    'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b08faf65-3c0c-464d-9cf8-9d57d6418152';
  const storeName = store?.name || 'Mağaza Adı';
  const rating = store?.rating || '4.1';
  const floor = store?.floor || 'Zemin Kat';
  const hours = store?.hours;
  const phone = store?.phone;
  const website = store?.website;

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(store, !isFavorite);
    }
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/?slug=ankamall&targetRoom=${store?.id}`;
    const shareData = {
      title: storeName,
      text: `${storeName} mağazasını Toponus üzerinde keşfet!`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Mağaza bağlantısı panoya kopyalandı!');
      }
    } catch (err) {
      console.error('Paylaşım hatası:', err);
    }
  };

  return (
    <div className="w-full bg-[#EAEAEA] rounded-[20px] overflow-hidden pb-8">
      {/* Header Image with Rating */}
      <div
        className="relative w-full h-[180px] bg-cover bg-center"
        style={{ backgroundImage: `url(${storeImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />

        {/* Rating Badge - Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z"
              fill="white"
            />
          </svg>
          <span className="text-white text-[13px] font-bold">{rating}</span>
        </div>

        {/* Store Name Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <svg
            width="129"
            height="35"
            viewBox="0 0 129 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="128.107"
              height="35"
              rx="17.5"
              fill="white"
              fillOpacity="0.99"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#1B3349] text-[15px] font-semibold font-poppins">
              {storeName}
            </span>
          </div>
        </div>

        {/* Action Icons - Bottom Right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* Heart Icon */}
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            {isFavorite ? (
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <path
                  d="M10 18L8.55 16.7C3.4 12.12 0 9.08 0 5.5C0 2.42 2.42 0 5.5 0C7.24 0 8.91 0.81 10 2.09C11.09 0.81 12.76 0 14.5 0C17.58 0 20 2.42 20 5.5C20 9.08 16.6 12.12 11.45 16.7L10 18Z"
                  fill="#1B3349"
                />
              </svg>
            ) : (
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <path
                  d="M14.5 0C12.76 0 11.09 0.81 10 2.09C8.91 0.81 7.24 0 5.5 0C2.42 0 0 2.42 0 5.5C0 9.08 3.4 12.12 8.55 16.7L10 18L11.45 16.7C16.6 12.12 20 9.08 20 5.5C20 2.42 17.58 0 14.5 0ZM10.1 15.3L10 15.4L9.9 15.3C5.14 11.16 2 8.38 2 5.5C2 3.5 3.5 2 5.5 2C7.04 2 8.54 2.99 9.07 4.36H10.93C11.46 2.99 12.96 2 14.5 2C16.5 2 18 3.5 18 5.5C18 8.38 14.86 11.16 10.1 15.3Z"
                  fill="#1B3349"
                />
              </svg>
            )}
          </button>

          {/* Share Icon */}
          <button
            onClick={handleShareClick}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08Z"
                fill="#1B3349"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-t-[20px] rounded-b-[30px] border-2 border-[#1B33491C] -mt-2">
        <div className="px-6 pt-6 pb-4">
          {/* Title */}
          <div className="flex items-center gap-1.5 mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M8.1 13.5H9.89999V8.1H8.1V13.5ZM8.99999 6.3C9.25499 6.3 9.46889 6.2136 9.64169 6.0408C9.81449 5.868 9.90059 5.6544 9.89999 5.4C9.89939 5.1456 9.81299 4.932 9.64079 4.7592C9.46859 4.5864 9.25499 4.5 8.99999 4.5C8.74499 4.5 8.53139 4.5864 8.35919 4.7592C8.18699 4.932 8.1006 5.1456 8.1 5.4C8.0994 5.6544 8.18579 5.8683 8.35919 6.0417C8.53259 6.2151 8.74619 6.3012 8.99999 6.3ZM8.99999 18C7.755 18 6.585 17.7636 5.49 17.2908C4.395 16.818 3.4425 16.1769 2.6325 15.3675C1.8225 14.5581 1.1814 13.6056 0.709201 12.51C0.237001 11.4144 0.000601139 10.2444 1.13924e-06 9C-0.00059886 7.7556 0.235801 6.5856 0.709201 5.49C1.1826 4.3944 1.8237 3.4419 2.6325 2.6325C3.4413 1.8231 4.3938 1.182 5.49 0.7092C6.5862 0.2364 7.7562 0 8.99999 0C10.2438 0 11.4138 0.2364 12.51 0.7092C13.6062 1.182 14.5587 1.8231 15.3675 2.6325C16.1763 3.4419 16.8177 4.3944 17.2917 5.49C17.7657 6.5856 18.0018 7.7556 18 9C17.9982 10.2444 17.7618 11.4144 17.2908 12.51C16.8198 13.6056 16.1787 14.5581 15.3675 15.3675C14.5563 16.1769 13.6038 16.8183 12.51 17.2917C11.4162 17.7651 10.2462 18.0012 8.99999 18Z"
                fill="#1B3349"
              />
            </svg>
            <span className="text-[#1B3349] text-[15px] font-semibold font-poppins">
              Mağaza Bilgileri
            </span>
          </div>

          {/* Info Badges Row 1 */}
          <div className="flex items-start gap-2 mb-2">
            <div className="flex items-center gap-1.5 border border-[#32475A] rounded-[20px] px-3.5 py-1">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <path
                  d="M6 7.5C6.39782 7.5 6.77936 7.34196 7.06066 7.06066C7.34196 6.77936 7.5 6.39782 7.5 6C7.5 5.60218 7.34196 5.22064 7.06066 4.93934C6.77936 4.65804 6.39782 4.5 6 4.5C5.60218 4.5 5.22064 4.65804 4.93934 4.93934C4.65804 5.22064 4.5 5.60218 4.5 6C4.5 6.39782 4.65804 6.77936 4.93934 7.06066C5.22064 7.34196 5.60218 7.5 6 7.5ZM6 0C7.19347 0 8.33807 0.474106 9.18198 1.31802C10.0259 2.16193 10.5 3.30653 10.5 4.5C10.5 9.375 6 15 6 15C6 15 1.5 9.375 1.5 4.5C1.5 3.30653 1.97411 2.16193 2.81802 1.31802C3.66193 0.474106 4.80653 0 6 0Z"
                  fill="#32475A"
                />
              </svg>
              <span className="text-[#32475A] text-[13px]">{floor}</span>
            </div>
            {hours && (
              <div className="flex items-center gap-1.5 border border-[#32475A] rounded-[20px] px-4 py-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM7 12.6C3.90625 12.6 1.4 10.0938 1.4 7C1.4 3.90625 3.90625 1.4 7 1.4C10.0938 1.4 12.6 3.90625 12.6 7C12.6 10.0938 10.0938 12.6 7 12.6ZM7.35 3.5H6.3V7.7L9.8 9.73L10.325 8.8775L7.35 7.175V3.5Z"
                    fill="#32475A"
                  />
                </svg>
                <span className="text-[#32475A] text-[13px]">{hours}</span>
              </div>
            )}
          </div>

          {/* Info Badges Row 2 */}
          {(phone || website) && (
            <div className="flex items-center gap-2">
              {phone && (
                <div className="flex items-center gap-1.5 border border-[#32475A] rounded-[20px] px-4 py-1">
                  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
                    <path
                      d="M9.76641 8.48145L9.41251 8.85445C9.41251 8.85445 8.57021 9.74065 6.27181 7.32105C3.97351 4.90155 4.81591 4.01535 4.81591 4.01535L5.03831 3.77985C5.58821 3.20175 5.64031 2.27275 5.16041 1.59415L4.18041 0.208145C3.58621 -0.631855 2.43901 -0.743055 1.75841 -0.0265547L0.537306 1.25815C0.200606 1.61395 -0.0249939 2.07345 0.00220611 2.58405C0.0722061 3.89105 0.630706 6.70175 3.74491 9.98105C7.04811 13.4581 10.1475 13.5964 11.4145 13.4713C11.8158 13.4317 12.1643 13.216 12.445 12.9195L13.5495 11.7567C14.2961 10.9718 14.0861 9.62535 13.131 9.07605L11.6455 8.22035C11.0186 7.86045 10.2564 7.96585 9.76641 8.48145Z"
                      fill="#32475A"
                    />
                  </svg>
                  <span className="text-[#32475A] text-[13px]">{phone}</span>
                </div>
              )}
              {website && (
                <div className="flex items-center gap-1.5 border border-[#32475A] rounded-[20px] px-4 py-1">
                  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.677 1.79535C4.522 2.08955 3.479 2.75935 2.693 3.71315C1.906 4.66685 1.414 5.85785 1.284 7.12285H3.969C4.152 5.22665 4.738 3.40555 5.677 1.79535ZM8.323 1.79535C9.265 3.40775 9.849 5.23035 10.031 7.12285H12.716C12.586 5.85785 12.094 4.66685 11.308 3.71315C10.521 2.75935 9.479 2.08955 8.323 1.79535ZM8.773 7.12285C8.576 5.31085 7.968 3.57815 7 2.07715C6.032 3.57815 5.424 5.31085 5.227 7.12285H8.773ZM5.227 8.46195H8.773C8.576 10.274 7.968 12.0066 7 13.5076C6.032 12.0066 5.424 10.274 5.227 8.46195ZM3.969 8.46195H1.284C1.414 9.72695 1.906 10.9179 2.693 11.8716C3.479 12.8254 4.522 13.4952 5.677 13.7894C4.735 12.177 4.151 10.3544 3.969 8.46195ZM8.323 13.7894C9.265 12.177 9.849 10.3544 10.031 8.46195H12.716C12.586 9.72695 12.094 10.9179 11.308 11.8716C10.521 12.8254 9.479 13.4952 8.323 13.7894ZM7 15.2924C7.919 15.2924 8.83 15.0984 9.679 14.7215C10.528 14.3445 11.3 13.7921 11.95 13.0957C12.6 12.3992 13.115 11.5724 13.467 10.6625C13.819 9.75245 14 8.77725 14 7.79235C14 6.80745 13.819 5.83225 13.467 4.92225C13.115 4.01235 12.6 3.18555 11.95 2.48905C11.3 1.79265 10.528 1.24025 9.679 0.863251C8.83 0.486451 7.919 0.292451 7 0.292451C5.143 0.292451 3.363 1.08255 2.05 2.48905C0.737 3.89565 0 5.80325 0 7.79235C0 9.78155 0.737 11.6891 2.05 13.0957C3.363 14.5022 5.143 15.2924 7 15.2924Z"
                      fill="#32475A"
                    />
                  </svg>
                  <span className="text-[#32475A] text-[13px]">{website}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store Description */}
        {store?.description && (
          <div className="px-6 mb-5">
            <p className="text-[#32475A]/70 text-[13px] leading-[1.6]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {store.description}
            </p>
          </div>
        )}
        
        {/* Get Directions Button */}
        <button
          className="w-full mx-6 mb-5 rounded-[20px] bg-[#32475AF0] py-3.5 flex items-center justify-center"
          style={{ width: 'calc(100% - 48px)' }}
          onClick={onGetDirections}
        >
          <span className="text-white text-[16px] font-medium">
            Yol Tarifi Al
          </span>
        </button>
      </div>

      {/* Services Section */}
      <div className="relative w-[95%] max-w-[359px] h-60 mx-auto mt-4 mb-6">
        {/* SVG Border for Services */}
        <svg
          className="absolute top-[14px] left-0 right-0 bottom-[10px] w-full h-full pointer-events-none"
          viewBox="0 0 359 199"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M339.517 0.00683594C350.324 0.280846 359 9.12703 359 20V179C359 189.873 350.324 198.719 339.517 198.993L339 199H20C9.12703 199 0.280845 190.324 0.00683594 179.517L0 179V20C0 8.95431 8.95431 3.58368e-07 20 0H75V1H20C9.50659 1 1 9.50659 1 20V179C1 189.493 9.50659 198 20 198H339C349.493 198 358 189.493 358 179V20C358 9.67049 349.757 1.26588 339.49 1.00586L339 1H286V0H339L339.517 0.00683594Z"
            fill="#32475A"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Services Title */}
        <div className="relative z-[2] flex items-center justify-center h-6 mb-1">
          <div className="flex items-center justify-center px-4 h-6">
            <span className="text-[#32475A] text-[14px] font-medium whitespace-nowrap">
              Hizmetler / Online İşlemler
            </span>
          </div>
        </div>

        {/* Services Content */}
        <div
          className="relative z-[1] bg-white rounded-[20px] p-2.5 mx-auto"
          style={{ width: '90%', maxWidth: '320px', marginTop: '5px', marginBottom: '10px' }}
        >
          <div className="space-y-2.5">
            {/* Service 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#3D5A6C] flex items-center justify-center flex-shrink-0">
                <svg
                  width="15"
                  height="20"
                  viewBox="0 0 19 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.64248 18.9832C8.72415 19.0143 7.84572 18.8669 7.00719 18.541C6.16866 18.2152 5.43209 17.7407 4.79749 17.1175C4.16289 16.4944 3.67966 15.7948 3.3478 15.0187C3.01593 14.2425 2.85 13.4185 2.85 12.5466C2.85 12.2357 2.86583 11.9328 2.89749 11.6381C2.92916 11.3433 2.9925 11.0553 3.0875 10.7743C3.21416 10.4011 3.20656 10.028 3.0647 9.65485C2.92283 9.28172 2.6771 9.01741 2.3275 8.86194C1.9475 8.70647 1.57573 8.70647 1.2122 8.86194C0.848665 9.01741 0.602932 9.28172 0.474999 9.65485C0.316666 10.1213 0.198233 10.5877 0.1197 11.0541C0.041167 11.5205 0.00126666 12.0025 0 12.5C0 13.7438 0.245733 14.9335 0.737199 16.069C1.22866 17.2046 1.9171 18.2071 2.8025 19.0765C3.6575 19.9471 4.66323 20.6157 5.81969 21.0821C6.97616 21.5485 8.17125 21.7973 9.40499 21.8284L8.59749 22.6213C8.31249 22.9011 8.16999 23.2276 8.16999 23.6007C8.16999 23.9739 8.31249 24.3004 8.59749 24.5802C8.88249 24.8601 9.21499 25 9.59499 25C9.97499 25 10.3075 24.8601 10.5925 24.5802L13.6325 21.5951C14.0125 21.222 14.2025 20.7867 14.2025 20.2892C14.2025 19.7917 14.0125 19.3563 13.6325 18.9832L10.5925 15.9981C10.3075 15.7183 9.97499 15.5784 9.59499 15.5784C9.21499 15.5784 8.88249 15.7183 8.59749 15.9981C8.31249 16.278 8.16999 16.6045 8.16999 16.9776C8.16999 17.3507 8.31249 17.6772 8.59749 17.9571L9.64248 18.9832ZM9.30999 5.97015C10.2283 5.97015 11.115 6.1337 11.97 6.46082C12.825 6.78793 13.5691 7.26181 14.2025 7.88246C14.8358 8.50311 15.319 9.20273 15.6522 9.98134C15.9853 10.7599 16.1512 11.584 16.15 12.4534C16.15 12.7643 16.1341 13.0672 16.1025 13.3619C16.0708 13.6567 16.0075 13.9447 15.9125 14.2257C15.7858 14.5989 15.794 14.9795 15.9372 15.3675C16.0803 15.7556 16.3254 16.028 16.6725 16.1847C17.0525 16.3402 17.4249 16.3402 17.7897 16.1847C18.1545 16.0292 18.3996 15.7649 18.525 15.3918C18.6833 14.9254 18.8024 14.4509 18.8822 13.9683C18.962 13.4857 19.0012 12.9963 19 12.5C19 11.2562 18.7701 10.0672 18.3103 8.93284C17.8505 7.79851 17.162 6.77985 16.245 5.87686C15.3583 5.00622 14.3374 4.34577 13.1822 3.89552C12.027 3.44527 10.8313 3.21953 9.59499 3.21828L10.45 2.37873C10.7033 2.09888 10.83 1.77239 10.83 1.39925C10.83 1.02612 10.6875 0.699627 10.4025 0.419776C10.1175 0.139925 9.78498 0 9.40499 0C9.02499 0 8.69249 0.139925 8.40749 0.419776L5.36749 3.40485C4.98749 3.77798 4.79749 4.21331 4.79749 4.71082C4.79749 5.20833 4.98749 5.64366 5.36749 6.01679L8.40749 9.00186C8.69249 9.28172 9.02499 9.42164 9.40499 9.42164C9.78498 9.42164 10.1175 9.28172 10.4025 9.00186C10.6875 8.72201 10.83 8.39552 10.83 8.02239C10.83 7.64925 10.6875 7.32276 10.4025 7.04291L9.30999 5.97015Z"
                    fill="#E6E6E6"
                  />
                </svg>
              </div>
              <span className="text-[#5A6C7D] text-[12px] flex-1">
                30 gün mağazadan iade/değişim
              </span>
            </div>

            {/* Service 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#3D5A6C] flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.05765 0.906937C2.15773 1.81519 1.92005 3.35081 1.44578 6.42338L0.635519 11.6734C-0.031054 15.9941 -0.363801 18.1545 0.60743 19.5773C1.57974 21 3.38824 21 7.0074 21H12.9925C16.6117 21 18.4202 21 19.3925 19.5773C20.3648 18.1545 20.0299 15.9941 19.3644 11.6734L18.5541 6.42338C18.0788 3.35213 17.8422 1.81519 16.9423 0.906937C16.0423 0 14.7556 0 12.1823 0H7.81766C5.24427 0 3.95758 0 3.05765 0.906937ZM7.70746 4.92319C7.87499 5.49942 8.18548 5.99836 8.59615 6.35127C9.00682 6.70418 9.49747 6.89369 10.0005 6.89369C10.5035 6.89369 10.9942 6.70418 11.4048 6.35127C11.8155 5.99836 12.126 5.49942 12.2935 4.92319C12.3691 4.68365 12.5186 4.48941 12.7103 4.38182C12.902 4.27423 13.1207 4.2618 13.3198 4.34716C13.5189 4.43253 13.6827 4.60896 13.7764 4.83887C13.87 5.06879 13.8861 5.33403 13.8211 5.57812C13.5418 6.53801 13.0244 7.36908 12.3402 7.95689C11.6559 8.5447 10.8385 8.86034 10.0005 8.86034C9.16247 8.86034 8.34506 8.5447 7.66083 7.95689C6.97659 7.36908 6.45918 6.53801 6.17985 5.57812C6.14235 5.4557 6.12528 5.32543 6.12964 5.19491C6.134 5.06439 6.15969 4.93623 6.20523 4.8179C6.25076 4.69956 6.31523 4.59342 6.39487 4.50566C6.47452 4.4179 6.56774 4.35028 6.66911 4.30673C6.77048 4.26318 6.87797 4.24458 6.98532 4.25201C7.09267 4.25944 7.19773 4.29276 7.29437 4.35001C7.39101 4.40726 7.47731 4.48731 7.54823 4.58549C7.61916 4.68368 7.67328 4.79934 7.70746 4.92319Z"
                    fill="white"
                    fillOpacity="0.95"
                  />
                </svg>
              </div>
              <span className="text-[#5A6C7D] text-[12px] flex-1">
                Online sipariş ve mağazadan teslim alma
              </span>
            </div>

            {/* Service 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#3D5A6C] flex items-center justify-center flex-shrink-0">
                <svg
                  width="24"
                  height="22"
                  viewBox="0 0 30 27"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28.6364 13.5V24.3C28.6364 25.0161 28.349 25.7028 27.8376 26.2092C27.3261 26.7155 26.6324 27 25.9091 27H4.09091C3.36759 27 2.6739 26.7155 2.16244 26.2092C1.65097 25.7028 1.36364 25.0161 1.36364 24.3V13.5C1.00198 13.5 0.655131 13.3578 0.3994 13.1046C0.143668 12.8514 0 12.508 0 12.15V8.1C0 7.38392 0.287337 6.69716 0.7988 6.19081C1.31026 5.68446 2.00396 5.4 2.72727 5.4H7.05C6.89589 4.96629 6.81749 4.50976 6.81818 4.05C6.81818 2.97587 7.24919 1.94574 8.01638 1.18622C8.78358 0.426695 9.82411 0 10.9091 0C12.2727 0 13.4727 0.675 14.2227 1.674V1.6605L15 2.7L15.7773 1.6605V1.674C16.5273 0.675 17.7273 0 19.0909 0C20.1759 0 21.2164 0.426695 21.9836 1.18622C22.7508 1.94574 23.1818 2.97587 23.1818 4.05C23.1825 4.50976 23.1041 4.96629 22.95 5.4H27.2727C27.996 5.4 28.6897 5.68446 29.2012 6.19081C29.7127 6.69716 30 7.38392 30 8.1V12.15C30 12.508 29.8563 12.8514 29.6006 13.1046C29.3449 13.3578 28.998 13.5 28.6364 13.5ZM4.09091 24.3H13.6364V13.5H4.09091V24.3ZM25.9091 24.3V13.5H16.3636V24.3H25.9091ZM10.9091 2.7C10.5474 2.7 10.2006 2.84223 9.94485 3.09541C9.68912 3.34858 9.54545 3.69196 9.54545 4.05C9.54545 4.40804 9.68912 4.75142 9.94485 5.00459C10.2006 5.25777 10.5474 5.4 10.9091 5.4C11.2707 5.4 11.6176 5.25777 11.8733 5.00459C12.1291 4.75142 12.2727 4.40804 12.2727 4.05C12.2727 3.69196 12.1291 3.34858 11.8733 3.09541C11.6176 2.84223 11.2707 2.7 10.9091 2.7ZM19.0909 2.7C18.7293 2.7 18.3824 2.84223 18.1267 3.09541C17.8709 3.34858 17.7273 3.69196 17.7273 4.05C17.7273 4.40804 17.8709 4.75142 18.1267 5.00459C18.3824 5.25777 18.7293 5.4 19.0909 5.4C19.4526 5.4 19.7994 5.25777 20.0551 5.00459C20.3109 4.75142 20.4545 4.40804 20.4545 4.05C20.4545 3.69196 20.3109 3.34858 20.0551 3.09541C19.7994 2.84223 19.4526 2.7 19.0909 2.7ZM2.72727 8.1V10.8H13.6364V8.1H2.72727ZM16.3636 8.1V10.8H27.2727V8.1H16.3636Z"
                    fill="#E6E6E6"
                  />
                </svg>
              </div>
              <span className="text-[#5A6C7D] text-[12px] flex-1">
                "Benim İçin Al" (Hediye) hizmeti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <StoreReviewSection
        storeId={store?.id || store?._id}
        userId={userId}
        userName={userName}
      />
    </div>
  );
};

export default StoreDetailDesign;
