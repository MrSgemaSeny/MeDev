import { Search, Globe, Moon, Sun } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { toggleTheme } from '../../shared/lib/theme';

export const AppHeader = () => {
  const { i18n } = useTranslation();
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Keep theme in sync if changed from settings or elsewhere
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleToggleTheme = () => {
    toggleTheme(setIsDark);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language?.startsWith('ru') ? 'en' : 'ru');
  };

  return (
    <header
      className="h-16 shrink-0 flex items-center gap-4 px-6 border-b"
      style={{ backgroundColor: 'var(--color-header-bg)', borderColor: 'var(--color-border-default)' }}
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-9 pl-8 pr-3 rounded-full text-sm outline-none transition-all focus:ring-2"
            style={{
              backgroundColor: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={handleToggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle Theme"
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 mr-1"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle Language"
          title={i18n.language?.startsWith('ru') ? 'Switch to English' : 'Переключить на Русский'}
        >
          <Globe size={18} />
        </button>

        {/* Profile Avatar */}
        <UserProfileDropdown variant="header" />
      </div>
    </header>
  );
};
