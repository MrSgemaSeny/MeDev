import { Search, Globe, Menu } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useTranslation } from 'react-i18next';
import { useMobileNavStore } from '../sidebar/model/mobileNavStore';

export const AppHeader = () => {
  const { t, i18n } = useTranslation();
  const toggleMobileNav = useMobileNavStore((s) => s.toggle);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language?.startsWith('ru') ? 'en' : 'ru');
  };

  return (
    <header
      className="h-14 sm:h-16 shrink-0 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 border-b border-[#30363d] bg-[#0d1117]"
    >
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label={t('header.openMenu', 'Открыть меню навигации')}
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
      >
        <Menu size={22} />
      </button>

      {/* Search Input (collapsed on mobile) */}
      <div className="hidden sm:block flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b949e]"
          />
          <input
            type="text"
            placeholder={t('header.search', 'Поиск...')}
            className="w-full h-9 pl-8 pr-3 rounded-full text-[16px] md:text-sm outline-none transition-all focus:ring-2 focus:ring-[#2ea043] bg-[#010409] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e]"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 ml-auto">
        {/* Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors hover:bg-white/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none text-[#8b949e] hover:text-[#c9d1d9] mr-0.5"
          aria-label={t('header.toggleLanguage', 'Toggle Language')}
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
