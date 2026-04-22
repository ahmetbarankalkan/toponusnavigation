'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ProfileMain({ user, setActiveSection, handleLogout }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams?.get('slug') || 'ankamall';
  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] overflow-hidden">
      {/* Header Section */}
      <div
        className="relative bg-[#1B3349] h-[120px] sm:h-[167px]"
        style={{ borderRadius: '0 0 20px 0' }}
      >
        {/* Welcome Text - Responsive positioning */}
        <div className="absolute left-[130px] sm:left-[148px] bottom-[20px] sm:bottom-[25px] right-4">
          <p
            className="text-white text-[13px] sm:text-[14px] font-normal leading-[18px] sm:leading-[21px]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Hoş geldiniz,
          </p>
          <p
            className="text-white text-[14px] sm:text-[16px] font-semibold leading-[20px] sm:leading-[24px] truncate"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {user.displayName || user.email}
          </p>
        </div>
      </div>

      {/* Profile Avatar Card - Responsive sizing */}
      <div className="absolute left-0 top-[40px] sm:top-[65px] w-[100px] sm:w-[128px] h-[100px] sm:h-[132px] bg-white rounded-tr-[30px] sm:rounded-tr-[40px] rounded-br-[30px] sm:rounded-br-[40px] flex items-center justify-center shadow-lg z-10">
        <svg
          className="w-[50px] h-[50px] sm:w-[59px] sm:h-[59px]"
          viewBox="0 0 59 59"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.25 13C16.25 9.55219 17.6196 6.24558 20.0576 3.80761C22.4956 1.36964 25.8022 0 29.25 0C32.6978 0 36.0044 1.36964 38.4424 3.80761C40.8804 6.24558 42.25 9.55219 42.25 13C42.25 16.4478 40.8804 19.7544 38.4424 22.1924C36.0044 24.6304 32.6978 26 29.25 26C25.8022 26 22.4956 24.6304 20.0576 22.1924C17.6196 19.7544 16.25 16.4478 16.25 13ZM16.25 32.5C11.9402 32.5 7.80698 34.212 4.75951 37.2595C1.71205 40.307 0 44.4402 0 48.75C0 51.3359 1.02723 53.8158 2.85571 55.6443C4.68419 57.4728 7.16414 58.5 9.75 58.5H48.75C51.3359 58.5 53.8158 57.4728 55.6443 55.6443C57.4728 53.8158 58.5 51.3359 58.5 48.75C58.5 44.4402 56.788 40.307 53.7405 37.2595C50.693 34.212 46.5598 32.5 42.25 32.5H16.25Z"
            fill="#1B3349"
          />
        </svg>
      </div>

      {/* Menu Items */}
      <div className="flex-1 min-h-0 px-[20px] sm:px-[30px] pt-[50px] sm:pt-[72px] space-y-[15px] sm:space-y-[31px] pb-[180px] overflow-y-auto touch-pan-y overscroll-contain">
        {/* Profili Düzenle */}
        <button
          onClick={() => setActiveSection('edit')}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-[rgba(217,217,217,0.85)] transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 4.0475C0 2.97404 0.426432 1.94454 1.18549 1.18549C1.94454 0.426432 2.97404 0 4.0475 0H8.33333C8.55435 0 8.76631 0.0877973 8.92259 0.244078C9.07887 0.400358 9.16667 0.61232 9.16667 0.833333C9.16667 1.05435 9.07887 1.26631 8.92259 1.42259C8.76631 1.57887 8.55435 1.66667 8.33333 1.66667H4.0475C3.41606 1.66667 2.81049 1.9175 2.364 2.364C1.9175 2.81049 1.66667 3.41606 1.66667 4.0475V12.6192C1.66667 13.2506 1.9175 13.8562 2.364 14.3027C2.81049 14.7492 3.41606 15 4.0475 15H12.6192C13.2506 15 13.8562 14.7492 14.3027 14.3027C14.7492 13.8562 15 13.2506 15 12.6192V8.33333C15 8.11232 15.0878 7.90036 15.2441 7.74408C15.4004 7.5878 15.6123 7.5 15.8333 7.5C16.0543 7.5 16.2663 7.5878 16.4226 7.74408C16.5789 7.90036 16.6667 8.11232 16.6667 8.33333V12.6192C16.6667 13.6926 16.2402 14.7221 15.4812 15.4812C14.7221 16.2402 13.6926 16.6667 12.6192 16.6667H4.0475C2.97404 16.6667 1.94454 16.2402 1.18549 15.4812C0.426432 14.7221 0 13.6926 0 12.6192V4.0475Z"
                fill="#253C51"
                fillOpacity="0.95"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.9476 9.34916L9.11007 10.4575L8.24923 9.02999L10.0867 7.92166L10.0892 7.91999C10.1597 7.87758 10.2246 7.82664 10.2826 7.76833L14.4576 3.57166C14.4994 3.5295 14.5397 3.48586 14.5784 3.44083C14.8542 3.11916 15.2626 2.48249 14.7684 1.98583C14.3509 1.56583 13.7526 1.96249 13.3651 2.30333C13.2611 2.39496 13.161 2.49088 13.0651 2.59083L13.0367 2.61916L8.92007 6.75666C8.82232 6.85383 8.74572 6.97015 8.69507 7.09833L8.0084 8.82583C7.99538 8.85833 7.99293 8.89412 8.00139 8.92809C8.00985 8.96207 8.02881 8.99252 8.05556 9.01512C8.08231 9.03772 8.11549 9.05132 8.15041 9.05399C8.18532 9.05666 8.21936 9.04826 8.24923 9.02999L9.11007 10.4575C7.6059 11.3642 5.81007 9.84083 6.46007 8.20916L7.14757 6.48249C7.28142 6.14508 7.48276 5.83854 7.73923 5.58166L11.8551 1.44333L11.8792 1.41916C12.0017 1.29416 12.4134 0.872494 12.9126 0.56916C13.1851 0.404994 13.6201 0.187494 14.1576 0.145827C14.7742 0.0966602 15.4326 0.290827 15.9492 0.809994C16.3447 1.20065 16.5934 1.7157 16.6534 2.26833C16.6947 2.69907 16.6288 3.13334 16.4617 3.53249C16.2201 4.12999 15.8167 4.56916 15.6392 4.74666L11.4642 8.94333C11.3087 9.09944 11.1365 9.23472 10.9476 9.34916ZM14.6584 3.41083C14.6584 3.41083 14.6551 3.41333 14.6476 3.41583L14.6584 3.41083Z"
                fill="#253C51"
                fillOpacity="0.95"
              />
            </svg>
          </div>
          <span
            className="text-[rgba(37,60,81,0.95)] text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Profili Düzenle
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Mağaza Geçmişi */}
        <button
          onClick={() => setActiveSection('history')}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-[rgba(217,217,217,0.85)] transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 0C5.94911 0.00584975 3.97879 0.799131 2.496 2.216V0.8C2.496 0.587827 2.41171 0.384344 2.26168 0.234314C2.11166 0.0842854 1.90817 0 1.696 0C1.48383 0 1.28034 0.0842854 1.13031 0.234314C0.980285 0.384344 0.896 0.587827 0.896 0.8V4.4C0.896 4.61217 0.980285 4.81565 1.13031 4.96568C1.28034 5.11571 1.48383 5.2 1.696 5.2H5.296C5.50817 5.2 5.71165 5.11571 5.86168 4.96568C6.01171 4.81565 6.096 4.61217 6.096 4.4C6.096 4.18783 6.01171 3.98434 5.86168 3.83431C5.71165 3.68428 5.50817 3.6 5.296 3.6H3.376C4.40462 2.52509 5.7756 1.84212 7.25323 1.66854C8.73085 1.49495 10.2228 1.84158 11.4725 2.64883C12.7223 3.45609 13.6517 4.67353 14.1011 6.09183C14.5504 7.51013 14.4916 9.04068 13.9347 10.4203C13.3779 11.7999 12.3577 12.9425 11.0497 13.6514C9.74172 14.3604 8.22759 14.5915 6.76764 14.3051C5.3077 14.0186 3.99317 13.2324 3.05007 12.0818C2.10697 10.9311 1.59423 9.48777 1.6 8C1.6 7.78782 1.51571 7.58434 1.36569 7.43431C1.21566 7.28428 1.01217 7.2 0.8 7.2C0.587827 7.2 0.384344 7.28428 0.234314 7.43431C0.0842854 7.58434 0 7.78782 0 8C0 9.58225 0.469192 11.129 1.34824 12.4446C2.22729 13.7602 3.47672 14.7855 4.93853 15.391C6.40034 15.9965 8.00887 16.155 9.56072 15.8463C11.1126 15.5376 12.538 14.7757 13.6569 13.6569C14.7757 12.538 15.5376 11.1126 15.8463 9.56072C16.155 8.00887 15.9965 6.40034 15.391 4.93853C14.7855 3.47672 13.7602 2.22729 12.4446 1.34824C11.129 0.469192 9.58225 0 8 0Z"
                fill="#253C51"
              />
            </svg>
          </div>
          <span
            className="text-[rgba(37,60,81,0.95)] text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Mağaza Geçmişi
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>


        {/* Adım */}
        <button
          onClick={() => setActiveSection('steps')}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-[rgba(217,217,217,0.85)] transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_528_2713)">
                <path
                  d="M13.5 5.625C13.9973 5.625 14.4742 5.42746 14.8258 5.07583C15.1775 4.72419 15.375 4.24728 15.375 3.75C15.375 3.25272 15.1775 2.77581 14.8258 2.42417C14.4742 2.07254 13.9973 1.875 13.5 1.875C13.0027 1.875 12.5258 2.07254 12.1742 2.42417C11.8225 2.77581 11.625 3.25272 11.625 3.75C11.625 4.24728 11.8225 4.72419 12.1742 5.07583C12.5258 5.42746 13.0027 5.625 13.5 5.625Z"
                  stroke="#1B3349"
                  strokeOpacity="0.95"
                  strokeWidth="2"
                />
                <path
                  d="M4.49996 6.28874L7.50109 5.24924L11.625 7.21761L7.50109 10.2915L11.625 13.0065L9.00296 16.4992M13.245 8.11611L14.2507 8.66324L16.5 6.54974M6.31834 11.8294L5.20459 13.2964L1.50146 15.3739"
                  stroke="#1B3349"
                  strokeOpacity="0.95"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_528_2713">
                  <rect width="18" height="18" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <span
            className="text-[rgba(37,60,81,0.95)] text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Adım
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Asistan Kullanıcı Adı */}
        <button
          onClick={() => setActiveSection('assistant')}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-[rgba(217,217,217,0.85)] transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9.5C19 14.1944 15.1944 18 10.5 18C5.80558 18 2 14.1944 2 9.5C2 4.80558 5.80558 1 10.5 1C15.1944 1 19 4.80558 19 9.5Z"
                stroke="#253C51"
                strokeOpacity="0.95"
                strokeWidth="2"
              />
              <circle
                cx="7.5"
                cy="8.5"
                r="1.5"
                fill="#253C51"
                fillOpacity="0.95"
              />
              <circle
                cx="13.5"
                cy="8.5"
                r="1.5"
                fill="#253C51"
                fillOpacity="0.95"
              />
              <path
                d="M7 12.5C7 12.5 8.5 14 10.5 14C12.5 14 14 12.5 14 12.5"
                stroke="#253C51"
                strokeOpacity="0.95"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            className="text-[rgba(37,60,81,0.95)] text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Asistan Kullanıcı Adı
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Ayarlar */}
        <button
          onClick={() => setActiveSection('settings')}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-[rgba(217,217,217,0.85)] transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                stroke="#253C51"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                stroke="#253C51"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-[rgba(37,60,81,0.95)] text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Ayarlar
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Çıkış Yap */}
        <button
          onClick={handleLogout}
          className="w-full h-[60px] bg-[rgba(217,217,217,0.71)] rounded-[20px] flex items-center px-[26px] hover:bg-red-50 transition-all"
        >
          <div className="w-5 h-5 mr-[15px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6"
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-red-600 text-[14px] font-medium flex-1 text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Çıkış Yap
          </span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            className="text-red-600"
          >
            <path
              d="M8 6L13 10.5L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
