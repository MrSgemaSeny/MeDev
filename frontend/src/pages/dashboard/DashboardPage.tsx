import { useState, useEffect } from 'react';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { ResumeBuilder } from '../../features/resume/ResumeBuilder';
import { LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      <div className="px-4 pt-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm dark:shadow-none flex items-center justify-between px-6 transition-all duration-300">
          <div className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            MeDev
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold hidden sm:block">@{username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 rounded-xl border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all bg-white/50 dark:bg-slate-900/50">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>
      </div>
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-2">
        <div className="max-w-[1600px] mx-auto h-full">
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
