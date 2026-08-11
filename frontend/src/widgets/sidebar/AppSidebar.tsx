import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';
import { QuotaWidget } from '../../features/billing/components/QuotaWidget';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile/edit', label: 'Profile' },
  { to: '/resume', label: 'Resume' },
  { to: '/billing', label: 'Billing' },
];

export const AppSidebar = () => {
  const [hovered, setHovered] = useState(false);
  const username = useAuthStore((s) => s.username);

  return (
    <aside
      className="group h-full flex flex-col border-r transition-[width] duration-150"
      style={{
        width: hovered ? 200 : 48,
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-default)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center h-14 px-3 border-b shrink-0 overflow-hidden"
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        <span
          className="text-base font-semibold whitespace-nowrap"
          style={{ color: 'var(--color-text-primary)' }}
        >
          M
          <span className="group-hover:opacity-100 opacity-0 transition-opacity duration-150">
            eDev
          </span>
        </span>
      </div>

      <nav className="flex-1 py-2 flex flex-col gap-0.5 overflow-hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center h-9 px-3 mx-1 rounded-md text-sm whitespace-nowrap transition-colors duration-100"
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--color-btn-hover)' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            <span className="w-4 text-center shrink-0">{item.label.charAt(0)}</span>
            <span className="ml-3 group-hover:opacity-100 opacity-0 transition-opacity duration-150">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <QuotaWidget />
    </aside>
  );
};
