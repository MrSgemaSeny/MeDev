import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { ResumeBuilder } from '../../features/resume/ResumeBuilder';

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="font-bold text-lg tracking-tight">MeDev</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 font-medium">@{username}</span>
          <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </header>
      
      <main className="flex-1 p-8">
        <div className="max-w-[1400px] mx-auto h-full">
          <ResumeBuilder />
        </div>
      </main>
    </div>
  );
}
