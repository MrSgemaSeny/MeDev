import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Info, Briefcase, GraduationCap, Code, Globe, Box, GitBranch, CreditCard, Settings } from 'lucide-react';
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
    <aside className="w-[260px] shrink-0 border-r py-3 flex flex-col gap-1 surface-inset border-default">
      <div className="px-2">
        <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">Main</div>
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
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="px-2 mt-2">
        <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">Sections</div>
        {SECTIONS_NAV.map((item) => {
          const isActive = isProfileActive && item.to.includes('about'); 
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none ${
                isActive
                  ? 'bg-[var(--color-accent-muted)] text-accent'
                  : 'text-secondary hover:surface-tertiary hover:text-primary'
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
            `flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] transition-colors select-none ${
              isActive ? 'text-primary surface-tertiary' : 'text-secondary hover:surface-tertiary hover:text-primary'
            }`
          }
        >
          <CreditCard size={15} />
          Billing
        </NavLink>
        <button className="w-full flex items-center gap-2 py-1.5 px-3 rounded-md text-[13px] text-secondary hover:surface-tertiary hover:text-primary transition-colors cursor-pointer select-none border-none bg-transparent">
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  );
};
