import { Link } from 'react-router-dom';
import { Search, Plus, Bell } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';

export const AppHeader = () => {
  return (
    <header className="h-[60px] surface-inset border-b border-default px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Logo/Brand */}
        <Link to="/dashboard" className="text-[14px] font-semibold text-primary tracking-wide flex items-center gap-2 select-none hover:text-[var(--color-text-primary)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[14px]">
            M
          </div>
          MeDev
        </Link>
        <span className="text-[14px] text-muted font-medium ml-2">Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-muted" />
          <input 
            type="text" 
            placeholder="Type / to search" 
            className="surface border border-default rounded-md pl-8 pr-3 py-1.5 text-[13px] text-primary w-[260px] outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-muted"
          />
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1.5 border-r border-muted pr-3 mr-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-secondary hover:surface-tertiary transition-colors border border-default cursor-pointer">
            <Plus size={15} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-secondary hover:surface-tertiary transition-colors border border-default cursor-pointer">
            <Bell size={15} />
          </button>
        </div>

        {/* Profile */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};
