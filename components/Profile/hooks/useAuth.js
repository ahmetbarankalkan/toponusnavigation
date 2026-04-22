import { useState, useEffect } from 'react';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // localStorage'dan kullanıcı verilerini yükle
  useEffect(() => {
    try {
      const token = localStorage.getItem('user_token');
      const userData = localStorage.getItem('user_data');

      console.log('🔍 Checking stored auth:', {
        hasToken: !!token,
        hasUserData: !!userData,
      });

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ User loaded from localStorage:', parsedUser.email);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (parseError) {
          console.error('❌ Error parsing user data:', parseError);
          localStorage.clear();
        }
      }
    } catch (storageError) {
      console.error('❌ localStorage access error:', storageError);
      setError(
        'Tarayıcı depolama erişimi yok. Lütfen gizli mod olmadığından emin olun.'
      );
    }
  }, []);

  const handleAuth = async (e, endpoint, formData) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mobil klavyeden gelen görünmez karakterleri temizle
    const cleanEmail = formData.email
      .replace(/[\u00A0\u200B\u200C\u200D\uFEFF\u2000-\u200F]/g, '')
      .replace(/\s+/g, '')
      .trim()
      .toLowerCase();

    const cleanPassword = formData.password.trim();

    console.log('📧 Email debug:', {
      original: formData.email,
      cleaned: cleanEmail,
      length: cleanEmail.length,
      chars: cleanEmail.split('').map(c => c.charCodeAt(0)),
    });

    // Email boş mu kontrol et
    if (!cleanEmail) {
      setError('E-posta adresi gerekli');
      setLoading(false);
      return;
    }

    // Şifre boş mu kontrol et
    if (!cleanPassword) {
      setError('Şifre gerekli');
      setLoading(false);
      return;
    }

    // Şifre uzunluğu kontrolü
    if (cleanPassword.length < 4) {
      setError('Şifre en az 4 karakter olmalı');
      setLoading(false);
      return;
    }

    // Email validation - çok basit kontrol: @ ve . içermeli
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Geçerli bir e-posta adresi girin (örnek: kullanici@email.com)');
      setLoading(false);
      return;
    }

    // @ işaretinden önce ve sonra karakter olmalı
    const atIndex = cleanEmail.indexOf('@');
    const dotAfterAt = cleanEmail.indexOf('.', atIndex);
    if (
      atIndex < 1 ||
      dotAfterAt < atIndex + 2 ||
      dotAfterAt >= cleanEmail.length - 1
    ) {
      setError('Geçerli bir e-posta adresi girin (örnek: kullanici@email.com)');
      setLoading(false);
      return;
    }

    try {
      const payload = { email: cleanEmail, password: cleanPassword };

      console.log('🔐 Auth request:', { endpoint, email: cleanEmail });

      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Auth error:', errorData);
        setError(errorData.error || 'Bir hata oluştu.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ Auth success:', {
        hasToken: !!data.token,
        hasUser: !!data.user,
      });

      if (data.success && data.token && data.user) {
        try {
          // localStorage'a kaydet
          localStorage.setItem('user_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));

          // State'i güncelle
          setUser(data.user);
          setIsLoggedIn(true);
          setError('');

          console.log('✅ Login successful, user saved to localStorage');
          return true;
        } catch (storageError) {
          console.error('❌ localStorage error:', storageError);
          setError(
            'Tarayıcı depolama hatası. Lütfen gizli mod değilseniz kontrol edin.'
          );
        }
      } else {
        console.error('❌ Invalid response:', data);
        setError(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleLogout = () => {
    try {
      console.log('🚪 Logging out...');
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsLoggedIn(false);
      setError('');
      console.log('✅ Logout successful');
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Yine de state'i temizle
      setUser(null);
      setIsLoggedIn(false);
      setError('');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (err) {
      console.error('Error updating user data:', err);
    }
  };

  return {
    isLoggedIn,
    user,
    loading,
    error,
    setError,
    handleAuth,
    handleLogout,
    updateUser,
  };
}
