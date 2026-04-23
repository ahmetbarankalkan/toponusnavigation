'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Head from 'next/head';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          router.push('/?discover=false'); // Ana sayfaya ve giriş ekranına yönlendir
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#EAEAEA]">
        <div className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#1B3349] mb-4">Geçersiz Bağlantı</h1>
          <p className="text-gray-600 mb-6">Şifre sıfırlama bağlantısı eksik veya geçersiz. Lütfen tekrar şifre sıfırlama talebi oluşturun.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#1B3349] text-white px-6 py-2 rounded-full font-medium"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#EAEAEA]">
      <Head>
        <title>Şifre Sıfırlama | Toponus</title>
      </Head>
      
      <div className="bg-white p-8 rounded-[30px] shadow-xl max-w-md w-full relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#1B3349]" />
        
        <div className="text-center mb-8">
          <div className="bg-[#1B3349]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B3349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1B3349]">Yeni Şifre Belirle</h1>
          <p className="text-gray-500 mt-2">Lütfen hesabınız için yeni bir şifre giriniz.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Yeni Şifre</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3349]/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Şifreyi Onayla</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3349]/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1B3349] text-white py-4 rounded-2xl font-bold text-[16px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#EAEAEA]">Yükleniyor...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
