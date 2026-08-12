import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Info, Briefcase, GraduationCap, Code, Globe, Box, GitBranch, CreditCard, Settings } from 'lucide-react';
import { UserProfileDropdown } from '../header/UserProfileDropdown';
import { QuotaWidget } from '../../features/billing/components/QuotaWidget';

const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile/edit', label: 'Profile', icon: User },
  { to: '/resume', label: 'Resume', icon: FileText },
];

const SECTIONS_NAV = [
  { to: '/profile/edit#about', label: 'About', icon: Info },
  { to: '/profile/edit#experience', label: 'Experience', icon: Briefcase },
  { to: '/profile/edit#education', label: 'Education', icon: GraduationCap },
  { to: '/profile/edit#skills', label: 'Skills', icon: Code },
  { to: '/profile/edit#languages', label: 'Languages', icon: Globe },
  { to: '/profile/edit#projects', label: 'Projects', icon: Box },
  { to: '/profile/edit#github', label: 'GitHub', icon: GitBranch },
];

export const AppSidebar = () => {
  const location = useLocation();
  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <aside className="w-[200px] shrink-0 border-r py-5 flex flex-col gap-[2px] bg-surface-1 border-default">
      <div className="px-4 pb-4 text-[13px] font-semibold text-primary tracking-[0.05em] uppercase">
        MeDev
      </div>

      <div className="px-2">
        <div className="text-[10px] text-muted px-[10px] pt-2 pb-1 tracking-[0.08em] uppercase font-medium">Main</div>
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] transition-colors select-none ${
                isActive ? 'text-primary bg-surface-2' : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`
            }
          >
            <item.icon size={15} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="px-2 mt-2">
        <div className="text-[10px] text-muted px-[10px] pt-2 pb-1 tracking-[0.08em] uppercase font-medium">Sections</div>
        {SECTIONS_NAV.map((item) => {
          // For now, highlight the first section if we're on profile just to match the mockup
          const isActive = isProfileActive && item.to.includes('about'); 
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] transition-colors select-none ${
                isActive
                  ? 'bg-[var(--color-accent-muted)] text-accent'
                  : 'text-secondary hover:bg-surface-2 hover:text-primary'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto px-2">
        <div className="mb-4">
          <QuotaWidget />
        </div>
        <NavLink
          to="/billing"
          className={({ isActive }) =>
            `flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] transition-colors select-none ${
              isActive ? 'text-primary bg-surface-2' : 'text-secondary hover:bg-surface-2 hover:text-primary'
            }`
          }
        >
          <CreditCard size={15} />
          Billing
        </NavLink>
        <div className="flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] text-secondary hover:bg-surface-2 hover:text-primary transition-colors cursor-pointer select-none">
          <Settings size={15} />
          Settings
        </div>
        <div className="mt-2 pt-2 border-t border-muted px-[0.625rem]">
          <UserProfileDropdown />
        </div>
      </div>
    </aside>
  );
};
