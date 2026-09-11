import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  User,
  UploadCloud,
  FileText,
  ListTodo,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Box,
  GitBranch,
  CreditCard,
  Settings,
  Shield,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMobileNavStore } from './model/mobileNavStore';
import { useAuthStore } from '../../entities/user/model/store';
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher';
import { setTheme, isDarkMode } from '../../shared/lib/theme';

const MAIN_NAV = [
  { to: '/dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Главная', icon: LayoutDashboard },
  { to: '/profile/edit', labelKey: 'nav.profile', defaultLabel: 'Профиль', icon: User },
  { to: '/import', labelKey: 'nav.importData', defaultLabel: 'Импорт данных', icon: UploadCloud },
  { to: '/resume', labelKey: 'nav.resume', defaultLabel: 'Резюме', icon: FileText },
  { to: '/tracker', labelKey: 'nav.tracker', defaultLabel: 'Вакансии', icon: ListTodo },
];

const SECTIONS_NAV = [
  { to: '/profile/edit#experience', labelKey: 'nav.experience', defaultLabel: 'Опыт работы', hint: 'Компании', icon: Briefcase },
  { to: '/profile/edit#education', labelKey: 'nav.education', defaultLabel: 'Образование', hint: 'Вуз, курсы', icon: GraduationCap },
  { to: '/profile/edit#skills', labelKey: 'nav.skills', defaultLabel: 'Навыки', hint: 'Стек, тулы', icon: Code },
  { to: '/profile/edit#languages', labelKey: 'nav.languages', defaultLabel: 'Языки', hint: 'Уровни', icon: Globe },
  { to: '/profile/edit#projects', labelKey: 'nav.projects', defaultLabel: 'Проекты', hint: 'Портфолио', icon: Box },
  { to: '/profile/edit#github', labelKey: 'nav.github', defaultLabel: 'GitHub', hint: 'Репозитории', icon: GitBranch },
];

export const MobileNavDrawer = () => {
  const { t } = useTranslation();
  const { isOpen, close } = useMobileNavStore();
  const location = useLocation();
  const role = (useAuthStore as any)((s: any) => s.role);
  const logout = (useAuthStore as any)((s: any) => s.logout);
  const isProfileActive = location.pathname.startsWith('/profile');
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

    return () => {
      window.removeEventListener('medev-theme-changed', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.menu', 'Навигационное меню')}
    >
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="relative z-50 w-[320px] sm:w-[360px] max-w-[85vw] surface-inset border-r border-default flex flex-col pt-4 pb-6 px-3.5 shadow-2xl overflow-y-auto select-none transition-transform duration-300 ease-out text-white"
        style={{
          backgroundColor: 'var(--color-bg-inset)',
          borderColor: 'var(--color-border-default)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-2 pb-4 mb-3 border-b border-default">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-white">
              MeDev
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            aria-label={t('nav.closeMenu', 'Закрыть меню')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Flat Navigation List */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {/* Main Navigation Items */}
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary bg-[var(--color-bg-tertiary)] font-semibold'
                    : 'text-secondary hover:bg-[var(--color-bg-tertiary)]/60 hover:text-primary font-medium'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span>{t(item.labelKey, item.defaultLabel)}</span>
            </NavLink>
          ))}

          {/* Separator */}
          <div className="border-t border-default my-2 mx-1" />

          {/* Resume Sections */}
          {SECTIONS_NAV.map((item) => {
            const currentHash = location.hash.replace('#', '') || 'experience';
            const sectionId = item.to.split('#')[1];
            const isActive = isProfileActive && currentHash === sectionId;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary bg-[var(--color-bg-tertiary)] font-semibold'
                    : 'text-secondary hover:bg-[var(--color-bg-tertiary)]/60 hover:text-primary font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon size={17} className="shrink-0" />
                  <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>
                </div>
                <span className="text-[11px] text-muted font-normal shrink-0 ml-2">{item.hint}</span>
              </NavLink>
            );
          })}

          {/* Separator */}
          <div className="border-t border-default my-2 mx-1" />

          {/* Billing & Settings */}
          <NavLink
            to="/billing"
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'text-primary bg-[var(--color-bg-tertiary)] font-semibold'
                  : 'text-secondary hover:bg-[var(--color-bg-tertiary)]/60 hover:text-primary font-medium'
              }`
            }
          >
            <CreditCard size={17} className="shrink-0" />
            <span>{t('nav.billing', 'Тарифы')}</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'text-primary bg-[var(--color-bg-tertiary)] font-semibold'
                  : 'text-secondary hover:bg-[var(--color-bg-tertiary)]/60 hover:text-primary font-medium'
              }`
            }
          >
            <Settings size={17} className="shrink-0" />
            <span>{t('nav.settings', 'Настройки')}</span>
          </NavLink>

          {role === 'ADMIN' && (
            <NavLink
              to="/admin/dashboard"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary bg-[var(--color-bg-tertiary)] font-semibold'
                    : 'text-secondary hover:bg-[var(--color-bg-tertiary)]/60 hover:text-primary font-medium'
                }`
              }
            >
              <Shield size={17} className="shrink-0" />
              <span>{t('nav.adminPanel', 'Админ-панель')}</span>
            </NavLink>
          )}

          {/* Language & Theme Controls */}
          <div className="border-t border-default my-2 mx-1" />

          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium text-secondary">{t('header.language', 'Тіл / Язык')}:</span>
            <LanguageSwitcher inactiveClassName="text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5" />
          </div>

          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium text-secondary">{t('settings.theme', 'Тема')}:</span>
            <div
              className="inline-flex items-center rounded-full p-0.5 border shadow-sm transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-default)',
              }}
              role="group"
              aria-label="Theme selection"
            >
              <button
                type="button"
                onClick={() => setTheme(true, setIsDark)}
                aria-pressed={isDark}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Moon size={13} />
                <span>{t('settings.dark', 'Тёмная')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme(false, setIsDark)}
                aria-pressed={!isDark}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Sun size={13} />
                <span>{t('settings.light', 'Светлая')}</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-default my-2 mx-1" />

          <button
            type="button"
            onClick={() => {
              logout();
              close();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-tertiary)]/60 transition-colors text-left cursor-pointer font-medium"
          >
            <LogOut size={17} className="shrink-0" />
            <span>{t('header.logout', 'Выйти')}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
