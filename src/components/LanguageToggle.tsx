import React from 'react';
import { useLanguage } from '@/lib/i18n';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center justify-center p-1.5 rounded-xl text-sm transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10 cursor-pointer ${className}`}
      title={language === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
      aria-label={language === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
    >
      <span className="text-lg">🌐</span>
    </button>
  );
};
