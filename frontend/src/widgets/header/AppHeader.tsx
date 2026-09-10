import { Search, Moon, Sun, Menu } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { toggleTheme, isDarkMode } from '../../shared/lib/theme';
import { useMobileNavStore } from '../sidebar/model/mobileNavStore';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';

export const AppHeader = () => {
  const { t } = useTranslation();
  const toggleMobileNav = useMobileNavStore((s) => s.toggle);
  const [isDark, setIsDark] = useState(isDarkMode);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.isDark !== undefined) {
        setIsDark(e.detail.isDark);
      } else {
        setIsDark(isDarkMode());
      }
    };

    window.addEventListener('medev-theme-changed', handleThemeChange);

    const observer = new MutationObserver(() => {
      setIsDark(isDarkMode());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('medev-theme-changed', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const handleToggleTheme = () => {
    toggleTheme(setIsDark);
  };

  return (
    <header
      className="h-14 sm:h-16 shrink-0 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 border-b transition-colors"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border-default)',
      }}
    >
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label={t('header.openMenu', 'Открыть меню навигации')}
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-secondary hover:text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
      >
        <Menu size={22} />
      </button>

      {/* Search Input (collapsed on mobile) */}
      <div className="hidden sm:block flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder={t('header.search', 'Поиск...')}
            className="w-full h-9 pl-8 pr-3 rounded-full text-[16px] md:text-sm outline-none transition-all focus:ring-2 focus:ring-[#2ea043]"
            style={{
              backgroundColor: 'var(--color-bg-inset)',
              borderColor: 'var(--color-border-default)',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 ml-auto">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={t('header.toggleTheme', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему')}
          title={isDark ? 'Light Theme' : 'Dark Theme'}
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Language Switcher */}
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>

        {/* Profile Avatar */}
        <UserProfileDropdown variant="header" />
      </div>
    </header>
  );
};

