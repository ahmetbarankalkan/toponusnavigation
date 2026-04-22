'use client';

export default function AssistantDiscover({ onAssistantOpen }) {
  return (
    <div className="mb-8 px-0 pb-12 mt-4">
      {/* Redundant banner section removed and moved to DiscoverModal for push-sticky effect */}

      
      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {/* Card 1 - Sesli Komutlar */}
        <button
          onClick={onAssistantOpen}
          className="bg-white rounded-[20px] py-4 px-2 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all min-h-[148px] justify-between"
          style={{
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <div className="w-10 h-10 mb-1 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#253C51" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </div>
          <div className="text-center">
            <h4 className="text-[#253C51] text-[11px] font-bold mb-1">
              Sesli Komutlar
            </h4>
            <p className="text-[#253C51] text-[8px] leading-[11px] opacity-80">
              Sesinizle mağazaları arayın, yol tarifi alın
            </p>
          </div>
        </button>
        
        {/* Card 2 - Kişisel Asistan */}
        <div 
          className="bg-white rounded-[20px] py-4 px-2 flex flex-col items-center min-h-[148px] justify-between"
          style={{
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <div className="w-10 h-10 mb-1 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#253C51" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="text-center">
            <h4 className="text-[#253C51] text-[11px] font-bold mb-1">
              Kişisel Asistan
            </h4>
            <p className="text-[#253C51] text-[8px] leading-[11px] opacity-80">
              Kullanıcı adı ve şifrenizle giriş yapın
            </p>
          </div>
        </div>
        
        {/* Card 3 - Sesinizi Tanır */}
        <div 
          className="bg-white rounded-[20px] py-4 px-2 flex flex-col items-center min-h-[148px] justify-between"
          style={{
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <div className="w-10 h-10 mb-1 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#253C51" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="text-center">
            <h4 className="text-[#253C51] text-[11px] font-bold mb-1">
              Sesinizi Tanır
            </h4>
            <p className="text-[#253C51] text-[8px] leading-[11px] opacity-80">
              Sesinizi öğrenir ve sadece sizi dinler
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}