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
import { useMobileNavStore } from './model/mobileNavStore';
import { useAuthStore } from '../../entities/user/model/store';

const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile/edit', label: 'Profile', icon: User },
  { to: '/import', label: 'Import Data', icon: UploadCloud },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/tracker', label: 'Job Tracker', icon: ListTodo },
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

export const MobileNavDrawer = () => {
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
      aria-label="Мобильная навигация"
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
            aria-label="Закрыть меню"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 flex flex-col gap-1 py-1">
          {/* Main Links */}
          <div>
            <div className="text-[11px] text-muted px-3 pt-1 pb-1 tracking-widest uppercase font-medium">
              Main
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
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Profile Sections */}
          <div className="mt-2">
            <div className="text-[11px] text-muted px-3 pt-2 pb-1 tracking-widest uppercase font-medium">
              Sections
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
                  <span>{item.label}</span>
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
              <span>Billing</span>
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
              <span>Settings</span>
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
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
