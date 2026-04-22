'use client';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔐 Checking localStorage auth...');
        
        // localStorage'dan token ve user data'yı kontrol et
        const token = localStorage.getItem('user_token');
        const userData = localStorage.getItem('user_data');
        
        console.log('🔐 Token exists:', !!token);
        console.log('🔐 User data exists:', !!userData);
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Auth success from localStorage:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('❌ No auth data in localStorage');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        // Hatalı data varsa temizle
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // localStorage değişikliklerini dinle (başka sekmede giriş/çıkış yapılırsa)
    const handleStorageChange = (e) => {
      if (e.key === 'user_token' || e.key === 'user_data') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { user, isLoading, isAuthenticated: !!user };
};