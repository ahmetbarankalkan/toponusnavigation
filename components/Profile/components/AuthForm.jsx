import { Mail, LogOut, Lock, User, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function AuthForm({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  loading,
  error,
  handleAuth,
}) {
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setIsForgotMode(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (isForgotMode) {
    return (
      <div className="w-full h-full flex flex-col bg-[#eaeaea] overflow-hidden">
        <div className="relative bg-[#1B3349] rounded-b-[20px] h-[120px] flex flex-col justify-center px-6">
          <button onClick={() => { setIsForgotMode(false); setForgotStep(1); }} className="absolute top-4 left-4 text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white text-[18px] font-semibold font-poppins">
            {forgotStep === 1 ? 'Şifre Sıfırlama' : 'Yeni Şifre Belirle'}
          </h1>
          <p className="text-white text-[12px] font-light font-poppins">
            {forgotStep === 1 ? 'E-posta adresinizi girin' : 'Size gönderilen kodu ve yeni şifrenizi girin'}
          </p>
        </div>
        <div className="flex-1 flex items-start justify-center pt-8 px-4">
          <div className="w-full max-w-[315px] bg-[#f7f7f7] rounded-[20px] shadow-lg p-6">
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 1 ? (
                <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                  <Mail className="w-[13px] h-[10px] text-gray-600" />
                  <input
                    type="email"
                    placeholder="E-posta"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                  />
                </div>
              ) : (
                <>
                  <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                    <Lock className="w-[14px] h-[14px] text-gray-600" />
                    <input
                      type="text"
                      placeholder="Doğrulama Kodu"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                    />
                  </div>
                  <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                    <Lock className="w-[14px] h-[14px] text-gray-600" />
                    <input
                      type="password"
                      placeholder="Yeni Şifre"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                    />
                  </div>
                </>
              )}
              <button 
                type="submit" 
                disabled={forgotLoading}
                className="w-full bg-[#1B3349] text-white rounded-[20px] py-3 font-poppins text-[14px]"
              >
                {forgotLoading ? 'İşleniyor...' : (forgotStep === 1 ? 'Kod Gönder' : 'Şifreyi Güncelle')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#eaeaea] overflow-hidden touch-pan-y">
      {/* Header Section - Height Reduced to 120px */}
      <div className="relative bg-[#1B3349] rounded-b-[20px] h-[120px] flex flex-col justify-center px-6 sm:px-12">
        <h1
          className="text-white text-[18px] font-semibold mb-1"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {activeTab === 'signin' ? 'Hoş geldiniz' : 'Hesap Oluştur'}
        </h1>
        <p
          className="text-white text-[12px] font-light"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {activeTab === 'signin' ? 'Devam etmek için giriş yapın' : 'Bilgilerinizi eksiksiz doldurun'}
        </p>
      </div>

      {/* White Card Form */}
      <div className="flex-1 flex items-start justify-center pt-4 px-4 pb-24 overflow-y-auto">
        <div className="w-full max-w-[315px]">
          <div className="bg-[#f7f7f7] rounded-[20px] shadow-lg p-5">
            <h2
              className="text-[#1B3349] text-[18px] font-semibold text-center mb-4 font-poppins"
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
              {activeTab === 'signup' && (
                <>
                  {/* Name Input */}
                  <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                    <User className="w-[14px] h-[14px] text-gray-600 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={formData.displayName || ''}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                    />
                  </div>
                  {/* Phone Input with Country Code */}
                  <div className="flex gap-2">
                    <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-3 py-3 flex items-center justify-center shrink-0 min-w-[70px]">
                      <select 
                        value={formData.countryCode || '+90'}
                        onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                        className="bg-transparent border-none outline-none text-[13px] font-poppins font-medium cursor-pointer"
                      >
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                      </select>
                    </div>
                    <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5 flex-1">
                      <Phone className="w-[14px] h-[14px] text-gray-600 flex-shrink-0" />
                      <input
                        type="tel"
                        placeholder="5xx xxx xxxx"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                      />
                    </div>
                  </div>
                  {/* Birthday Input - Real Date Picker */}
                  <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3 flex items-center gap-2.5">
                    <Calendar className="w-[14px] h-[14px] text-gray-600 flex-shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] text-gray-500 font-poppins ml-0.5">Doğum Tarihi</span>
                      <input
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="bg-transparent border-none outline-none text-[14px] font-poppins w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Input */}
              <div className="bg-[rgba(217,217,217,0.42)] rounded-[20px] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-[13px] h-[10px] text-gray-600 flex-shrink-0" />
                  <input
                    type="text"
                    name="email"
                    inputMode="email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value.replace(/\s/g, '') })}
                    placeholder="E-posta"
                    className="bg-transparent border-none outline-none text-[14px] text-black placeholder:text-black/30 w-full font-poppins"
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
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifre"
                    className="bg-transparent border-none outline-none text-[14px] text-black placeholder:text-black/30 w-full font-poppins"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAuth({ preventDefault: () => {} }, activeTab)}
                className="w-full bg-[#1B3349] text-white rounded-[20px] py-3 text-[14px] font-medium hover:bg-[#1a2b3a] transition-all font-poppins"
              >
                {loading ? 'İşleniyor...' : activeTab === 'signin' ? 'Giriş Yap' : 'Üye Ol'}
              </button>
            </div>

            {activeTab === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="w-full text-center text-[#1B3349] text-[10px] mt-3 hover:underline font-poppins"
                >
                  Şifremi Unuttum
                </button>
                <div className="w-full h-[1px] bg-[#d9d9d9] rounded-[20px] my-3"></div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setFormData({ email: '', password: '', displayName: '', phone: '', countryCode: '+90', dateOfBirth: '' });
                  }}
                  className="w-full border border-[#1B3349] text-[#1B3349] rounded-[20px] py-3 text-[14px] font-medium hover:bg-gray-50 transition-all font-poppins"
                >
                  Kayıt Ol
                </button>
              </>
            )}

            {activeTab === 'signup' && (
              <>
                <div className="w-full h-[1px] bg-[#d9d9d9] rounded-[20px] my-3"></div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setFormData({ email: '', password: '' });
                  }}
                  className="w-full border border-[#1B3349] text-[#1B3349] rounded-[20px] py-3 text-[14px] font-medium hover:bg-gray-50 transition-all font-poppins"
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
