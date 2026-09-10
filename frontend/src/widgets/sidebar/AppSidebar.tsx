import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  FileText,
  Info,
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
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
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
  { to: '/profile/edit#about', labelKey: 'nav.about', defaultLabel: 'About', icon: Info },
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
  const toggleDesktopCollapsed = useMobileNavStore((s) => s.toggleDesktopCollapsed);
  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <aside
      className={`hidden md:flex shrink-0 border-r flex-col surface-inset border-default transition-all duration-300 ease-in-out select-none ${
        isDesktopCollapsed ? 'w-[68px]' : 'w-[250px] lg:w-[260px]'
      }`}
      style={{
        backgroundColor: 'var(--color-bg-inset)',
        borderColor: 'var(--color-border-default)',
      }}
    >
      {/* Brand Header */}
      <div
        className={`h-14 sm:h-16 shrink-0 flex items-center border-b border-default px-3 transition-colors ${
          isDesktopCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {isDesktopCollapsed ? (
          <button
            type="button"
            onClick={toggleDesktopCollapsed}
            title={t('nav.expandSidebar', 'Развернуть меню')}
            className="w-9 h-9 rounded-lg bg-[#238636]/15 text-[#238636] flex items-center justify-center hover:bg-[#238636]/25 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
          >
            <Terminal size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#238636] text-white flex items-center justify-center shadow-xs shrink-0">
                <Terminal size={17} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-primary leading-tight">MeDev</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#238636] animate-pulse"></span>
                </div>
                <span className="text-[10px] text-muted tracking-wider uppercase font-semibold leading-tight">
                  {t('nav.workspace', 'Developer Hub')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDesktopCollapsed}
              aria-label={t('nav.collapseSidebar', 'Свернуть меню')}
              title={t('nav.collapseSidebar', 'Свернуть меню')}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:surface-secondary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1">
        {!isDesktopCollapsed && (
          <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-wider uppercase font-semibold">
            {t('nav.main', 'Main')}
          </div>
        )}

        {MAIN_NAV.map((item) => {
          const label = t(item.labelKey, item.defaultLabel);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isDesktopCollapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg transition-all text-[13px] relative cursor-pointer ${
                  isDesktopCollapsed
                    ? 'w-10 h-10 mx-auto justify-center'
                    : 'gap-3 px-3 py-2 w-full font-medium'
                } ${
                  isActive
                    ? 'text-primary surface-tertiary shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#238636] before:rounded-r-full'
                    : 'text-secondary hover:surface-secondary hover:text-primary'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {!isDesktopCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className={`border-t border-default ${isDesktopCollapsed ? 'my-2 mx-1' : 'my-2 mx-2'}`} />

        {/* Section Navigation Items */}
        {!isDesktopCollapsed && (
          <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-wider uppercase font-semibold">
            {t('nav.sections', 'Sections')}
          </div>
        )}

        {SECTIONS_NAV.map((item) => {
          const currentHash = location.hash.replace('#', '') || 'about';
          const sectionId = item.to.split('#')[1];
          const isActive = isProfileActive && currentHash === sectionId;
          const label = t(item.labelKey, item.defaultLabel);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isDesktopCollapsed ? label : undefined}
              className={`flex items-center rounded-lg transition-all text-[13px] relative cursor-pointer ${
                isDesktopCollapsed
                  ? 'w-10 h-10 mx-auto justify-center'
                  : 'gap-3 px-3 py-1.5 w-full font-normal'
              } ${
                isActive
                  ? 'text-primary surface-tertiary shadow-xs font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#238636] before:rounded-r-full'
                  : 'text-secondary hover:surface-secondary hover:text-primary'
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              {!isDesktopCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto border-t border-default p-2 flex flex-col gap-1">
        <NavLink
          to="/billing"
          title={isDesktopCollapsed ? t('nav.billing', 'Billing') : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-all text-[13px] relative cursor-pointer ${
              isDesktopCollapsed
                ? 'w-10 h-10 mx-auto justify-center'
                : 'gap-3 px-3 py-2 w-full font-medium'
            } ${
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
          title={isDesktopCollapsed ? t('nav.settings', 'Settings') : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-all text-[13px] relative cursor-pointer ${
              isDesktopCollapsed
                ? 'w-10 h-10 mx-auto justify-center'
                : 'gap-3 px-3 py-2 w-full font-medium'
            } ${
              isActive
                ? 'text-primary surface-tertiary shadow-xs font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#238636] before:rounded-r-full'
                : 'text-secondary hover:surface-secondary hover:text-primary'
            }`
          }
        >
          <Settings size={17} className="shrink-0" />
          {!isDesktopCollapsed && <span className="truncate">{t('nav.settings', 'Settings')}</span>}
        </NavLink>

        {/* Bottom Toggle Button */}
        <button
          type="button"
          onClick={toggleDesktopCollapsed}
          title={
            isDesktopCollapsed
              ? t('nav.expandSidebar', 'Развернуть боковое меню')
              : t('nav.collapseSidebar', 'Свернуть боковое меню')
          }
          className={`flex items-center rounded-lg text-muted hover:text-primary hover:surface-secondary transition-colors cursor-pointer mt-1 ${
            isDesktopCollapsed ? 'w-10 h-10 mx-auto justify-center' : 'gap-3 px-3 py-2 w-full text-xs'
          }`}
        >
          {isDesktopCollapsed ? (
            <PanelLeftOpen size={17} className="shrink-0" />
          ) : (
            <>
              <PanelLeftClose size={17} className="shrink-0" />
              <span className="truncate text-muted">{t('nav.collapseSidebar', 'Свернуть панель')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
