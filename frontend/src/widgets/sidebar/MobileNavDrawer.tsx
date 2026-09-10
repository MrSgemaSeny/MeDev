import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  User,
  UploadCloud,
  FileText,
  ListTodo,
  Info,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Box,
  GitBranch,
  CreditCard,
  Settings,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMobileNavStore } from './model/mobileNavStore';
import { useAuthStore } from '../../entities/user/model/store';

const MAIN_NAV = [
  { to: '/dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile/edit', labelKey: 'nav.profile', defaultLabel: 'Profile', icon: User },
  { to: '/import', labelKey: 'nav.importData', defaultLabel: 'Import Data', icon: UploadCloud },
  { to: '/resume', labelKey: 'nav.resume', defaultLabel: 'Resume', icon: FileText },
  { to: '/tracker', labelKey: 'nav.tracker', defaultLabel: 'Job Tracker', icon: ListTodo },
];

const SECTIONS_NAV = [
  { to: '/profile/edit#about', labelKey: 'nav.about', defaultLabel: 'About', icon: Info },
  { to: '/profile/edit#experience', labelKey: 'nav.experience', defaultLabel: 'Experience', icon: Briefcase },
  { to: '/profile/edit#education', labelKey: 'nav.education', defaultLabel: 'Education', icon: GraduationCap },
  { to: '/profile/edit#skills', labelKey: 'nav.skills', defaultLabel: 'Skills', icon: Code },
  { to: '/profile/edit#languages', labelKey: 'nav.languages', defaultLabel: 'Languages', icon: Globe },
  { to: '/profile/edit#projects', labelKey: 'nav.projects', defaultLabel: 'Projects', icon: Box },
  { to: '/profile/edit#github', labelKey: 'nav.github', defaultLabel: 'GitHub', icon: GitBranch },
];

export const MobileNavDrawer = () => {
  const { t } = useTranslation();
  const { isOpen, close } = useMobileNavStore();
  const location = useLocation();
  const role = (useAuthStore as any)((s: any) => s.role);
  const isProfileActive = location.pathname.startsWith('/profile');

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
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.mobileNavAria', 'Мобильная навигация')}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] surface-inset border-r border-default flex flex-col pt-[max(1rem,var(--sat))] pb-[max(1rem,var(--sab))] px-3 shadow-2xl overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-inset)',
          borderColor: 'var(--color-border-default)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-default">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-primary">MeDev</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
              Menu
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-secondary hover:text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            aria-label={t('nav.closeMenu', 'Закрыть меню')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 flex flex-col gap-1 py-1">
          {/* Main Links */}
          <div>
            <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-widest uppercase font-medium">
              {t('nav.main', 'Main')}
            </div>
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-md text-sm transition-colors select-none ${
                    isActive
                      ? 'text-primary surface-tertiary font-medium'
                      : 'text-secondary hover:surface-tertiary hover:text-primary'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{t(item.labelKey, item.defaultLabel)}</span>
              </NavLink>
            ))}
          </div>

          {/* Profile Sections */}
          <div className="mt-2">
            <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">
              {t('nav.sections', 'Sections')}
            </div>
            {SECTIONS_NAV.map((item) => {
              const currentHash = location.hash.replace('#', '') || 'about';
              const sectionId = item.to.split('#')[1];
              const isActive = isProfileActive && currentHash === sectionId;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm transition-colors select-none ${
                    isActive
                      ? 'text-primary surface-tertiary font-medium'
                      : 'text-secondary hover:surface-tertiary hover:text-primary'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{t(item.labelKey, item.defaultLabel)}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Secondary & Footer Links */}
          <div className="mt-auto pt-4 border-t border-default flex flex-col gap-1">
            <NavLink
              to="/billing"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm transition-colors select-none ${
                  isActive
                    ? 'text-primary surface-tertiary font-medium'
                    : 'text-secondary hover:surface-tertiary hover:text-primary'
                }`
              }
            >
              <CreditCard size={18} />
              <span>{t('nav.billing', 'Billing')}</span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm transition-colors select-none ${
                  isActive
                    ? 'text-primary surface-tertiary font-medium'
                    : 'text-secondary hover:surface-tertiary hover:text-primary'
                }`
              }
            >
              <Settings size={18} />
              <span>{t('nav.settings', 'Settings')}</span>
            </NavLink>

            {role === 'ADMIN' && (
              <NavLink
                to="/admin/dashboard"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-md text-sm transition-colors select-none ${
                    isActive
                      ? 'text-primary surface-tertiary font-medium'
                      : 'text-[var(--color-accent)] hover:surface-tertiary'
                  }`
                }
              >
                <Shield size={18} />
                <span>{t('nav.adminPanel', 'Admin Panel')}</span>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
