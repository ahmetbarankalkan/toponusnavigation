'use client';

import { useState, useEffect } from 'react';
import { UserCircle2, Mail, Phone, LogOut } from 'lucide-react';

export default function ProfilePanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [upgradeData, setUpgradeData] = useState({ email: '', phone: '' });

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleAuth = async (e, endpoint) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        setFormData({ username: '', password: '' });
      } else {
        setError(data.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleUpgrade = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(upgradeData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
        setSuccess('Profiliniz başarıyla güncellendi!');
        setUpgradeData({ email: '', phone: '' });
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch (err) {
      setError('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn && user) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
            <UserCircle2 className="w-24 h-24 text-gray-300" strokeWidth={1} />
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                <p className="text-sm text-gray-500">
                    {user.role === 'basic_user' ? 'Temel Kullanıcı' : 'Gelişmiş Kullanıcı'}
                </p>
            </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

        {user.role === 'basic_user' ? (
          <form onSubmit={handleUpgrade} className="space-y-4">
            <p className="text-sm text-center text-gray-600">Gelişmiş özellikler için profilinizi tamamlayın.</p>
            <div>
              <label className="text-sm font-medium text-gray-700">E-posta</label>
              <input type="email" value={upgradeData.email} onChange={e => setUpgradeData({...upgradeData, email: e.target.value})} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-light0 focus:border-brand" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefon</label>
              <input type="tel" value={upgradeData.phone} onChange={e => setUpgradeData({...upgradeData, phone: e.target.value})} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-light0 focus:border-brand" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-dark text-white rounded-lg font-semibold hover:bg-brand-darkest disabled:bg-gray-400">{loading ? 'Yükseltiliyor...' : 'Profili Yükselt'}</button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-800">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-800">{user.phone}</span>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 disabled:bg-gray-400">
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('signin')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'signin' ? 'text-brand-dark border-b-2 border-brand-dark' : 'text-gray-500'}`}>Giriş Yap</button>
          <button onClick={() => setActiveTab('signup')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'signup' ? 'text-brand-dark border-b-2 border-brand-dark' : 'text-gray-500'}`}>Üye Ol</button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={e => handleAuth(e, activeTab)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Kullanıcı Adı</label>
          <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-light0 focus:border-brand" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Şifre</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={4} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-light0 focus:border-brand" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-dark text-white rounded-lg font-semibold hover:bg-brand-darkest disabled:bg-gray-400">{loading ? 'İşleniyor...' : (activeTab === 'signin' ? 'Giriş Yap' : 'Üye Ol')}</button>
      </form>
    </div>
  );
}
