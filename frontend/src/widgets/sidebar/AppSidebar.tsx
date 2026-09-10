import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Box,
  GitBranch,
  CreditCard,
  Settings,
  ListTodo,
  UploadCloud,
} from 'lucide-react';
import { useMobileNavStore } from './model/mobileNavStore';

const MAIN_NAV = [
  { to: '/dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile/edit', labelKey: 'nav.profile', defaultLabel: 'Profile', icon: User },
  { to: '/import', labelKey: 'nav.importData', defaultLabel: 'Import Data', icon: UploadCloud },
  { to: '/resume', labelKey: 'nav.resume', defaultLabel: 'Resume', icon: FileText },
  { to: '/tracker', labelKey: 'nav.tracker', defaultLabel: 'Job Tracker', icon: ListTodo },
];

const SECTIONS_NAV = [
  { to: '/profile/edit#experience', labelKey: 'nav.experience', defaultLabel: 'Experience', icon: Briefcase },
  { to: '/profile/edit#education', labelKey: 'nav.education', defaultLabel: 'Education', icon: GraduationCap },
  { to: '/profile/edit#skills', labelKey: 'nav.skills', defaultLabel: 'Skills', icon: Code },
  { to: '/profile/edit#languages', labelKey: 'nav.languages', defaultLabel: 'Languages', icon: Globe },
  { to: '/profile/edit#projects', labelKey: 'nav.projects', defaultLabel: 'Projects', icon: Box },
  { to: '/profile/edit#github', labelKey: 'nav.github', defaultLabel: 'GitHub', icon: GitBranch },
];

export const AppSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isDesktopCollapsed = useMobileNavStore((s) => s.isDesktopCollapsed);
  const isProfileActive = location.pathname.startsWith('/profile');

  if (isDesktopCollapsed) {
    return null;
  }

  return (
    <aside
      className="hidden md:flex shrink-0 border-r flex-col surface-inset border-default w-[250px] lg:w-[260px] select-none"
      style={{
        backgroundColor: 'var(--color-bg-inset)',
        borderColor: 'var(--color-border-default)',
      }}
    >
      {/* Brand Header */}
      <div className="h-14 sm:h-16 shrink-0 flex items-center border-b border-default px-4">
        <span className="font-bold text-base tracking-tight text-primary">MeDev</span>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1">
        <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-wider uppercase font-semibold">
          {t('nav.main', 'Main')}
        </div>

        {MAIN_NAV.map((item) => {
          const label = t(item.labelKey, item.defaultLabel);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 w-full font-medium rounded-lg transition-all text-[13px] relative cursor-pointer ${
                  isActive
                    ? 'text-primary surface-tertiary shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#238636] before:rounded-r-full'
                    : 'text-secondary hover:surface-secondary hover:text-primary'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className="border-t border-default my-2 mx-2" />

        {/* Section Navigation Items */}
        <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-wider uppercase font-semibold">
          {t('nav.sections', 'Sections')}
        </div>

        {SECTIONS_NAV.map((item) => {
          const currentHash = location.hash.replace('#', '') || 'experience';
          const sectionId = item.to.split('#')[1];
          const isActive = isProfileActive && currentHash === sectionId;
          const label = t(item.labelKey, item.defaultLabel);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-1.5 w-full font-normal rounded-lg transition-all text-[13px] relative cursor-pointer ${
                isActive
                  ? 'text-primary surface-tertiary shadow-xs font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#238636] before:rounded-r-full'
                  : 'text-secondary hover:surface-secondary hover:text-primary'
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto border-t border-default p-2 flex flex-col gap-1">
        <NavLink
          to="/billing"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 w-full font-medium rounded-lg transition-all text-[13px] relative cursor-pointer ${
              isActive
                ? 'text-primary surface-tertiary shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#238636] before:rounded-r-full'
                : 'text-secondary hover:surface-secondary hover:text-primary'
            }`
          }
        >
          <CreditCard size={17} className="shrink-0" />
          {!isDesktopCollapsed && <span className="truncate">{t('nav.billing', 'Billing')}</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-all text-[13px] relative cursor-pointer gap-3 px-3 py-2 w-full font-medium ${
              isActive
                ? 'text-primary surface-tertiary shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#238636] before:rounded-r-full'
                : 'text-secondary hover:surface-secondary hover:text-primary'
            }`
          }
        >
          <Settings size={17} className="shrink-0" />
          <span className="truncate">{t('nav.settings', 'Settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
};
