import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

/**
 * Switches the whole platform between Arabic and English (like the language switch in the mobile app).
 * The label names the language the button switches to. "dark" sits on the green site header, "light" on the dashboards.
 */
export const LanguageToggle: React.FC<{ className?: string; variant?: 'dark' | 'light' }> = ({ className = '', variant = 'dark' }) => {
  const { language, toggleLanguage } = useLanguage();
  const toEnglish = language === 'ar';
  const look =
    variant === 'dark'
      ? 'h-9 rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20'
      : 'h-9 rounded-xl border border-border bg-white text-slate-700 hover:text-primary hover:border-primary shadow-2xs';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      data-no-translate
      lang={toEnglish ? 'en' : 'ar'}
      className={`inline-flex items-center gap-1.5 px-3 text-xs font-bold transition cursor-pointer shrink-0 ${look} ${className}`}
      title={toEnglish ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-label={toEnglish ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{toEnglish ? 'English' : 'العربية'}</span>
    </button>
  );
};
