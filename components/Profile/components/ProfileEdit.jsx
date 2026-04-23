export default function ProfileEdit({
  editForm,
  setEditForm,
  editLoading,
  editError,
  editSuccess,
  handleUpdateProfile,
  setActiveSection,
}) {
  return (
    <div className="w-full h-full flex flex-col bg-[#EAEAEA] overflow-hidden relative">
      {/* Header */}
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
            Profili Düzenle
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Floating Center Profile Icon */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '125px' }}>
        <div 
          className="bg-white flex items-center justify-center relative"
          style={{ width: '110px', height: '105px', borderRadius: '20px', boxShadow: '0px 1px 7.6px rgba(0, 0, 0, 0.25)' }}
        >
          {/* User Icon Inner */}
          <svg width="58" height="58" viewBox="0 0 24 24" fill="#253C51" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
          </svg>
          
          {/* Edit Badge */}
          <div className="absolute -bottom-3 -right-3 w-[28px] h-[28px] bg-[#253C51] rounded-full shadow-[0px_0px_4px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer hover:bg-[#1B3349] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-[35px] pt-[80px] pb-[160px] flex flex-col items-center">
        <div className="w-full max-w-[320px] mx-auto flex flex-col items-center space-y-[15px]">
          
          {editError && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[12px] text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {editError}
            </div>
          )}
          {editSuccess && (
            <div className="w-full bg-green-50 border border-green-200 text-green-700 p-2 rounded-xl text-[12px] text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {editSuccess}
            </div>
          )}

          {/* Full Name Input Box */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <input
              type="text"
              name="displayName"
              value={editForm.displayName}
              onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
              placeholder="Adınız Soyadınız"
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {/* Email Input Box (Disabled) */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5 opacity-80 cursor-not-allowed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <input
              type="email"
              value={editForm.email}
              disabled
              placeholder="E-posta Adresiniz"
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium cursor-not-allowed text-ellipsis"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {/* Phone Input Box */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-3">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <div className="flex items-center">
              <select 
                value={editForm.countryCode || '+90'}
                onChange={e => setEditForm({ ...editForm, countryCode: e.target.value })}
                className="bg-transparent border-none outline-none text-[#000000] text-[11px] font-medium mr-1 cursor-pointer appearance-none"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <option value="+90">+90</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+49">+49</option>
                <option value="+33">+33</option>
              </select>
              <div className="h-[14px] w-[1px] bg-[#253C51]/20 mr-3"></div>
            </div>
            <input
              type="tel"
              value={editForm.phone || ''}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="5XX XXX XX XX"
              className="flex-1 bg-transparent w-full border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {/* Date of Birth Box */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            <input
              type="date"
              name="dateOfBirth"
              value={editForm.dateOfBirth || ''}
              onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          <div className="w-full border-t border-[#253C51]/10 my-[5px]"></div>

          {/* Current Password */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              type="password"
              value={editForm.currentPassword}
              onChange={e => setEditForm({ ...editForm, currentPassword: e.target.value })}
              placeholder="Mevcut Şifre"
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500 tracking-wider"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {/* New Password */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              type="password"
              value={editForm.newPassword}
              onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
              placeholder="Yeni Şifre"
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500 tracking-wider"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          {/* Confirm Password */}
          <div className="w-full h-[46px] rounded-[20px] bg-white/40 shadow-[0_0_7px_rgba(0,0,0,0.15)] flex items-center px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#253C51" className="shrink-0 mr-4">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              type="password"
              value={editForm.confirmPassword}
              onChange={e => setEditForm({ ...editForm, confirmPassword: e.target.value })}
              placeholder="Yeni Şifre (Tekrar)"
              className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[12px] font-medium placeholder:text-gray-500 tracking-wider"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            />
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={editLoading}
              className="w-[205px] h-[64px] rounded-[20px] bg-[#1B3349] text-white flex items-center justify-center transition-all hover:bg-[#253C51] active:bg-[#1B3349] disabled:opacity-50 mx-auto"
              style={{ fontFamily: 'Poppins, sans-serif', touchAction: 'manipulation' }}
            >
              <span className="text-[14px] font-medium">
                {editLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
