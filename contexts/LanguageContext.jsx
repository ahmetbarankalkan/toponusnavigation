'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '@/utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('tr');

  // Load language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language to localStorage
  const changeLanguage = newLang => {
    if (newLang === 'tr' || newLang === 'en') {
      setLanguage(newLang);
      localStorage.setItem('app_language', newLang);

      // Clear chat history when language changes
      localStorage.removeItem('assistant_chat_history');
    }
  };

  const t = key => getTranslation(language, key);

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t, translations }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
