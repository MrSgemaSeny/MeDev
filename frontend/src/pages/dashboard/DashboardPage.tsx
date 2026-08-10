import { useState, useEffect } from 'react';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { ResumeBuilder } from '../../features/resume/ResumeBuilder';
import { LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medev-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medev-theme', theme);
  }, [theme]);

  return (
    <div
      className="h-screen flex flex-col transition-colors duration-300 font-sans overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      <div className="shrink-0 z-50">
        <header
          className="h-[60px] flex items-center justify-between px-4 sm:px-6"
          style={{
            backgroundColor: 'var(--color-header-bg)',
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          <div className="font-semibold text-base tracking-tight flex items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-text-secondary)', color: 'var(--color-header-bg)' }}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            MeDev
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 rounded-md transition-colors h-8 px-3"
              style={{
                backgroundColor: 'var(--color-btn-bg)',
                borderColor: 'var(--color-btn-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2 rounded-md transition-colors h-8 px-3 ml-2"
              style={{
                backgroundColor: 'var(--color-btn-bg)',
                borderColor: 'var(--color-btn-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <LogOut className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </Button>
          </div>
        </header>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8">
        <div
          className="w-full h-full max-w-[1400px] mx-auto relative rounded-md overflow-hidden flex flex-col"
          style={{
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-primary)',
            boxShadow: '0 1px 3px var(--color-shadow)',
          }}
        >
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
