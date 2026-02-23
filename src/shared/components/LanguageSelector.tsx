/**
 * Language Selector Component
 * Toggle between Korean and English languages
 */

import { useLanguage } from '@shared/hooks/useLanguage';
import type { Language } from '@shared/types/common';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className = '' }: LanguageSelectorProps) => {
  const { currentLanguage, changeLanguage, isKorean, isEnglish } = useLanguage();

  const handleLanguageChange = async (lang: Language) => {
    if (lang !== currentLanguage) {
      await changeLanguage(lang);
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full border border-border-default bg-bg-secondary p-1 ${className}`}>
      {/* Korean Button */}
      <button
        onClick={() => handleLanguageChange('ko')}
        className={`
          inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200
          ${
            isKorean
              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-md shadow-orange-500/30'
              : 'text-text-tertiary hover:text-text-secondary'
          }
        `}
        aria-label="Switch to Korean"
        aria-pressed={isKorean}
      >
        <span>KOR</span>
      </button>

      {/* English Button */}
      <button
        onClick={() => handleLanguageChange('en')}
        className={`
          inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200
          ${
            isEnglish
              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-md shadow-orange-500/30'
              : 'text-text-tertiary hover:text-text-secondary'
          }
        `}
        aria-label="Switch to English"
        aria-pressed={isEnglish}
      >
        <span>ENG</span>
      </button>
    </div>
  );
};
