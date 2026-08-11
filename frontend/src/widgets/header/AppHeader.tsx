import React from 'react';
import { UserProfileDropdown } from './UserProfileDropdown';

export const AppHeader: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-end px-6 border-b shrink-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-default)' }}>
      <UserProfileDropdown />
    </header>
  );
};
