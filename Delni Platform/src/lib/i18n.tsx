import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations, Language, TranslationKey } from './translations';
import { startEnglish, stopEnglish } from './autoTranslate';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The page is first rendered in Arabic, exactly as the server renders it; the visitor's language is applied right
  // after (React does not correct attributes such as dir that differ between the server page and the first render)
  const [language, setLanguageState] = useState<Language>('ar');
  const loaded = useRef(false);

  useEffect(() => {
    let chosen: Language = 'ar';
    try {
      // ?lang=en or ?lang=ar in the address opens the page in that language
      const fromUrl = new URLSearchParams(window.location.search).get('lang');
      const saved = localStorage.getItem('app_language');
      if (fromUrl === 'ar' || fromUrl === 'en') chosen = fromUrl;
      else if (saved === 'ar' || saved === 'en') chosen = saved;
    } catch {
      // storage blocked: Arabic
    }
    loaded.current = true;
    setLanguageState(chosen);
  }, []);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
    if (typeof window !== 'undefined' && loaded.current) {
      try {
        localStorage.setItem('app_language', language);
      } catch {
        // storage blocked: the language still applies to this visit
      }
    }
    // English mode covers every Arabic text left on the page (dashboards, alerts, server messages)
    if (language === 'en') startEnglish();
    else stopEnglish();
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const val = translations[language]?.[key] || translations['ar']?.[key];
    return val || fallback || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir }}>
      <div dir={dir} className={dir === 'rtl' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
