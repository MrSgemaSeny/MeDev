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
    <div className="h-screen bg-[#0d1117] flex flex-col transition-colors duration-300 font-sans selection:bg-[#58a6ff]/30 overflow-hidden">
      <div className="shrink-0 z-50">
        <header className="h-[60px] bg-[#010409] border-b border-[#30363d] flex items-center justify-between px-4 sm:px-6">
          <div className="font-semibold text-base tracking-tight text-[#c9d1d9] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c9d1d9] flex items-center justify-center text-[#010409]">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            MeDev
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 rounded-md border border-[#f0f6fc1a] hover:bg-[#30363d] transition-colors text-[#c9d1d9] bg-[#21262d] h-8 px-3"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#8b949e]" /> : <Moon className="w-4 h-4 text-[#8b949e]" />}
            </Button>
            
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#c9d1d9] font-medium text-sm">
                {username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 rounded-md border border-[#f0f6fc1a] text-[#c9d1d9] hover:bg-[#30363d] transition-colors bg-[#21262d] h-8 px-3 ml-2">
              <LogOut className="w-4 h-4 text-[#8b949e]" />
            </Button>
          </div>
        </header>
      </div>
      
      <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="w-full h-full max-w-[1400px] mx-auto relative border border-[#30363d] bg-[#0d1117] rounded-md overflow-hidden flex flex-col shadow-sm">
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
