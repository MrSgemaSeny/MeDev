import { Search, Bell } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';

export const AppHeader = () => {
  return (
    <header
      className="h-14 shrink-0 flex items-center gap-4 px-6 border-b"
      style={{ backgroundColor: 'var(--color-header-bg)', borderColor: 'var(--color-border-default)' }}
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-8 pr-3 rounded-md text-sm outline-none transition-[border-color,box-shadow]"
            style={{
              backgroundColor: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-text-muted)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <button
        className="h-8 w-8 flex items-center justify-center rounded-md transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-btn-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-label="Notifications"
      >
        <Bell size={16} />
      </button>

      <UserProfileDropdown variant="header" />
    </header>
  );
};
