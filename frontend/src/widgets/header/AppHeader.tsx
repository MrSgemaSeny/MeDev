import { Search, Moon, Sun, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { toggleTheme, isDarkMode } from '../../shared/lib/theme';
import { useMobileNavStore } from '../sidebar/model/mobileNavStore';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';

export const AppHeader = () => {
  const { t } = useTranslation();
  const toggleNav = useMobileNavStore((s) => s.toggle);
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
      className="h-14 sm:h-16 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-6 border-b transition-colors select-none"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border-default)',
      }}
    >
      {/* Hamburger Menu & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleNav}
          aria-label={t('header.toggleSidebar', 'Открыть меню')}
          title={t('header.toggleSidebar', 'Открыть меню')}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-primary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <Link
          to="/dashboard"
          className="flex items-center text-lg sm:text-xl font-black tracking-tight text-primary select-none hover:opacity-90 transition-opacity"
        >
          <span>Me</span>
          <span className="text-[#238636]">Dev</span>
        </Link>
      </div>

      {/* Pill Search Input */}
      <div className="hidden md:block flex-1 max-w-md mx-2">
        <div className="relative flex items-center">
          <Search
            size={15}
            className="absolute left-3.5 pointer-events-none text-muted"
          />
          <input
            type="text"
            placeholder={t('header.search', 'Поиск по резюме, проектам и вакансиям...')}
            className="w-full h-9 pl-9 pr-4 rounded-full text-xs outline-none transition-all surface-inset border border-default focus:ring-2 focus:ring-[#2ea043] text-primary placeholder:text-muted"
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

