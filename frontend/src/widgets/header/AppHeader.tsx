import React, { useState } from 'react';
import { UserProfileDropdown } from './UserProfileDropdown';
import { Search } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b shrink-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-default)' }}>
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-secondary" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, skills, resumes..."
            className="w-full h-10 pl-10 pr-4 rounded-md text-sm transition-colors outline-none focus:ring-1 focus:ring-green-600"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
            }}
          />
        </div>
      </div>

      {/* Profile Dropdown */}
      <div className="ml-4">
        <UserProfileDropdown />
      </div>
    </header>
  );
};
