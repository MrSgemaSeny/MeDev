import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'segmented';
}

const LANGUAGES = [
  { code: 'ru', label: 'RU', fullLabel: 'Русский' },
  { code: 'en', label: 'EN', fullLabel: 'English' },
] as const;

export const LanguageSwitcher = ({ className = '', variant = 'pill' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medev_lang', code);
      localStorage.setItem('i18nextLng', code);
      document.documentElement.lang = code;
      window.dispatchEvent(new CustomEvent('medev-language-changed', { detail: { lang: code } }));
    }
  };

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'ru';

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-lg border transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-default)',
        }}
      >
        {LANGUAGES.map(({ code, fullLabel }) => {
          const isActive = currentLang === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleLanguageChange(code)}
              className={`px-4 py-2 min-h-[40px] sm:min-h-[36px] rounded-md text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white shadow-sm font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {fullLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 border shadow-sm transition-colors ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-inset)',
        borderColor: 'var(--color-border-default)',
      }}
      role="group"
      aria-label="Language selection"
    >
      {LANGUAGES.map(({ code, label }) => {
        const isActive = currentLang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => handleLanguageChange(code)}
            aria-pressed={isActive}
            className={`text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1 rounded-full transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
