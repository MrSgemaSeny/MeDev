import { useState, useEffect } from 'react';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { ResumeBuilder } from '../../features/resume/ResumeBuilder';

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--social-bg)] flex flex-col transition-colors duration-200">
      <header className="h-16 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-200">
        <div className="font-bold text-lg tracking-tight text-[var(--text-h)]">MeDev</div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <span className="text-sm text-[var(--text)] font-medium">@{username}</span>
          <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </header>
      
      <main className="flex-1 p-8 text-[var(--text-h)]">
        <div className="max-w-[1400px] mx-auto h-full">
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
