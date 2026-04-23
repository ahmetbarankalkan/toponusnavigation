'use client';

const CustomToggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className="relative flex items-center justify-start shrink-0 transition-all bg-white shadow-[0px_0px_1.5px_rgba(0,0,0,0.25)]"
    style={{ width: '40px', height: '22px', borderRadius: '20px', padding: '2px' }}
  >
    <div
      className={`h-[16px] w-[16px] rounded-[20px] transition-transform duration-200 ease-in-out ${
        enabled ? 'bg-[#253C51] translate-x-[18px]' : 'bg-[#AEAEAE] translate-x-0'
      }`}
    />
  </button>
);

export default function SettingsPanel({
  settings,
  saveMessage,
  handleSettingChange,
  setActiveSection,
}) {
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Title - Centered vertically and horizontally */}
          <h2
            className="text-white text-[16px] font-medium absolute left-1/2 -translate-x-1/2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Tercihler ve Ayarlar
          </h2>

          <div className="w-8"></div>
        </div>

        {saveMessage && (
          <span className="text-white/80 text-[12px] bg-white/10 px-3 py-1 rounded-full mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Floating Center Icon */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '125px' }}>
        <div 
          className="bg-white flex items-center justify-center relative"
          style={{ 
            width: '110px', height: '105px', 
            borderRadius: '20px', 
            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)' 
          }}
        >
          <svg width="58" height="58" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8H13M21 8H21.01" stroke="#2E4458" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16.5" cy="8" r="3.5" stroke="#2E4458" strokeWidth="2.5"/>
            <path d="M3 16H3.01M11 16H20" stroke="#2E4458" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7.5" cy="16" r="3.5" stroke="#2E4458" strokeWidth="2.5"/>
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-[35px] pt-[80px] pb-[160px] flex flex-col items-center">
        
        <div className="w-full max-w-[350px] mx-auto space-y-6">
          
          {/* Kişiselleştirme ve Gizlilik Section */}
          <div className="w-full space-y-[10px]">
            <h3
              className="text-[#253C51] text-[12px] font-medium ml-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Kişiselleştirme ve Gizlilik
            </h3>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ziyaret Geçmişimi Kaydet
                </span>
                <span className="text-[rgba(0,0,0,0.61)] text-[9px] sm:text-[10px] leading-[1.3] font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sana gelecekte daha iyi öneriler sunabilmem için ziyaret ettiğin mağazaları ve rotaları hatırla.
                </span>
              </div>
              <CustomToggle 
                enabled={settings.saveVisitHistory !== false} 
                onChange={val => handleSettingChange('saveVisitHistory', val)} 
              />
            </div>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Favori Aramalarımı Kaydet
                </span>
                <span className="text-[rgba(0,0,0,0.61)] text-[9px] sm:text-[10px] leading-[1.3] font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Aradığın kategorileri ve ürünleri kaydederek "Keşfet" ekranını sana özel hale getir.
                </span>
              </div>
              <CustomToggle 
                enabled={settings.saveSearchHistory !== false} 
                onChange={val => handleSettingChange('saveSearchHistory', val)} 
              />
            </div>
          </div>

          {/* Bildirim Section */}
          <div className="w-full space-y-[10px]">
            <h3
              className="text-[#253C51] text-[12px] font-medium ml-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Bildirim
            </h3>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Genel Kampanyalar
                </span>
                <span className="text-[rgba(0,0,0,0.61)] text-[9px] sm:text-[10px] leading-[1.3] font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AVM'deki genel duyuru ve indirimleri bildirim olarak al.
                </span>
              </div>
              <CustomToggle 
                enabled={settings.generalPromos !== false} 
                onChange={val => handleSettingChange('generalPromos', val)} 
              />
            </div>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Kişiselleştirilmiş Fırsatlar
                </span>
                <span className="text-[rgba(0,0,0,0.61)] text-[9px] sm:text-[10px] leading-[1.3] font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sadece favori mağazalarından veya ilgilendiğin kategorilerden bildirim al.
                </span>
              </div>
              <CustomToggle 
                enabled={settings.personalizedPromos !== false} 
                onChange={val => handleSettingChange('personalizedPromos', val)} 
              />
            </div>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Mağaza Önü Hatırlatmaları
                </span>
                <span className="text-[rgba(0,0,0,0.61)] text-[9px] sm:text-[10px] leading-[1.3] font-normal" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Bir mağazanın önünden geçerken oradaki bir kampanyayı hatırlat.
                </span>
              </div>
              <CustomToggle 
                enabled={settings.locationReminders !== false} 
                onChange={val => handleSettingChange('locationReminders', val)} 
              />
            </div>
          </div>

          {/* Görünüm Section */}
          <div className="w-full space-y-[10px]">
            <h3
              className="text-[#253C51] text-[12px] font-medium ml-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Görünüm
            </h3>

            <div 
              className="w-full p-4 flex items-center justify-between hover:bg-white/40 transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.32)', boxShadow: '0px 0px 5.8px rgba(0, 0, 0, 0.2)', borderRadius: '20px' }}
            >
              <div className="flex-1 pr-6 flex flex-col gap-1">
                <span className="text-[#000000] text-[11px] sm:text-[12px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Karanlık Mod
                </span>
              </div>
              <CustomToggle 
                enabled={settings.darkMode === true} 
                onChange={val => handleSettingChange('darkMode', val)} 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
