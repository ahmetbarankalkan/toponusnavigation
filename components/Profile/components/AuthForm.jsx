import { Mail, LogOut, Lock } from 'lucide-react';

export default function AuthForm({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  loading,
  error,
  handleAuth,
}) {
  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] overflow-hidden touch-pan-y">
      {/* Header Section with Blue Background */}
      <div className="relative bg-[#1B3349] rounded-b-[20px] h-[160px] flex flex-col justify-center px-6 sm:px-12">
        <h1
          className="text-white text-[18px] font-semibold mb-1"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Hoş geldiniz
        </h1>
        <p
          className="text-white text-[13px] font-light"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Devam etmek için giriş yapın veya kayıt olun
        </p>
      </div>

      {/* White Card Form */}
      <div className="flex-1 flex items-start justify-center pt-4 px-4 pb-24 overflow-y-auto">
        <div className="w-full max-w-[315px]">
          <div className="bg-[#f7f7f7] rounded-[20px] shadow-lg p-5">
            <h2
              className="text-[#3c5062] text-[18px] font-semibold text-center mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {activeTab === 'signin' ? 'Giriş Yap' : 'Üye Ol'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-xs mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Email Input */}
              <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-[13px] h-[10px] text-gray-600 flex-shrink-0" />
                  <input
                    type="text"
                    name="email"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={formData.email}
                    onChange={e => {
                      // Mobil klavyeden gelen görünmez karakterleri anında temizle
                      const value = e.target.value
                        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, '')
                        .replace(/\s/g, '');
                      setFormData({ ...formData, email: value });
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('password-field')?.focus();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const pastedText = e.clipboardData
                        .getData('text')
                        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, '')
                        .replace(/\s/g, '')
                        .trim();
                      setFormData({ ...formData, email: pastedText });
                    }}
                    placeholder="ornek@email.com"
                    className="bg-transparent border-none outline-none text-[14px] text-black placeholder:text-black/30 w-full"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-[12.67px] h-[16.625px] text-gray-600 flex-shrink-0" />
                  <input
                    id="password-field"
                    type="password"
                    name="password"
                    autoComplete="off"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAuth({ preventDefault: () => {} }, activeTab);
                      }
                    }}
                    placeholder="Şifre"
                    className="bg-transparent border-none outline-none text-[14px] text-black placeholder:text-black/30 w-full"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  console.log('🖱️ Button clicked');
                  handleAuth({ preventDefault: () => {} }, activeTab);
                }}
                className="w-full bg-[#1B3349] text-white rounded-[20px] py-3 text-[14px] font-medium hover:bg-[#1a2b3a] active:bg-[#1a2b3a] disabled:bg-gray-400 transition-all select-none"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                }}
              >
                {loading
                  ? 'İşleniyor...'
                  : activeTab === 'signin'
                  ? 'Giriş Yap'
                  : 'Üye Ol'}
              </button>
            </div>

            {activeTab === 'signin' && (
              <>
                {/* Forgot Password */}
                <button
                  type="button"
                  className="w-full text-center text-[#1B3349] text-[10px] mt-3 hover:underline"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Şifremi Unuttum
                </button>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#d9d9d9] rounded-[20px] my-3"></div>

                {/* Register Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('📝 Switching to signup');
                    setActiveTab('signup');
                    setFormData({ email: '', password: '' });
                  }}
                  className="w-full border border-[#1B3349] text-[#1B3349] rounded-[20px] py-3 text-[14px] font-medium hover:bg-gray-50 active:bg-gray-100 transition-all select-none"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    touchAction: 'manipulation',
                  }}
                >
                  Kayıt Ol
                </button>
              </>
            )}

            {activeTab === 'signup' && (
              <>
                {/* Divider */}
                <div className="w-full h-[1px] bg-[#d9d9d9] rounded-[20px] my-3"></div>

                {/* Back to Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔙 Switching to signin');
                    setActiveTab('signin');
                    setFormData({ email: '', password: '' });
                  }}
                  className="w-full border border-[#1B3349] text-[#1B3349] rounded-[20px] py-3 text-[14px] font-medium hover:bg-gray-50 active:bg-gray-100 transition-all select-none"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    touchAction: 'manipulation',
                  }}
                >
                  Giriş Yap
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
