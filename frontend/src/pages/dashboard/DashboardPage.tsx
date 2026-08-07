import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
        <div className="font-bold text-lg tracking-tight">MeDev</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">Hello, @{username}</span>
          <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </header>
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">Dashboard</h1>
          <p className="text-zinc-500 mb-8">
            Your developer profile is ready to be built. We will add the Drag-and-Drop resume builder here soon!
          </p>
          
          <div className="bg-white border border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-lg font-medium text-zinc-900">Builder under construction</h2>
            <p className="text-sm text-zinc-500 mt-1">Check back later for the full drag-and-drop experience.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
