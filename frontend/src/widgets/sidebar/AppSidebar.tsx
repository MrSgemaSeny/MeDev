import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, User, FileText, Info, Briefcase, GraduationCap, Code, Globe, Box, GitBranch, CreditCard, Settings, ListTodo, UploadCloud } from 'lucide-react';

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
  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 border-r py-3 flex-col gap-1 surface-inset border-default">
      <div className="px-2">
        <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">{t('nav.main', 'Main')}</div>
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none ${
                isActive ? 'text-primary surface-tertiary' : 'text-secondary hover:surface-tertiary hover:text-primary'
              }`
            }
          >
            <item.icon size={15} />
            {t(item.labelKey, item.defaultLabel)}
          </NavLink>
        ))}
      </div>

      <div className="px-2 mt-2">
        <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">{t('nav.sections', 'Sections')}</div>
        {SECTIONS_NAV.map((item) => {
          const currentHash = location.hash.replace('#', '') || 'about';
          const sectionId = item.to.split('#')[1];
          const isActive = isProfileActive && currentHash === sectionId;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none ${
                isActive ? 'text-primary surface-tertiary' : 'text-secondary hover:surface-tertiary hover:text-primary'
              }`}
            >
              <item.icon size={15} />
              {t(item.labelKey, item.defaultLabel)}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto px-2">
        <NavLink
          to="/billing"
          className={({ isActive }) =>
            `flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none mb-1 ${
              isActive ? 'text-primary surface-tertiary' : 'text-secondary hover:surface-tertiary hover:text-primary'
            }`
          }
        >
          <CreditCard size={15} />
          {t('nav.billing', 'Billing')}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none ${
              isActive ? 'text-primary surface-tertiary' : 'text-secondary hover:surface-tertiary hover:text-primary'
            }`
          }
        >
          <Settings size={15} />
          {t('nav.settings', 'Settings')}
        </NavLink>
      </div>
    </aside>
  );
};
