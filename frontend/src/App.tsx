import { AppRouter } from './app/router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { useEffect, useState } from 'react';
import { useAuthStore } from './entities/user/model/store';
import { api } from './shared/api/axios';

const queryClient = new QueryClient();

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    api.post('/auth/refresh')
      .then((res) => {
        const { accessToken, refreshToken, username, plan, role } = res.data;
        setAuth(accessToken, refreshToken, username, plan, role);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [setAuth, logout]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <span className="inline-block animate-spin rounded-full" style={{ width: 24, height: 24, border: '2px solid var(--color-border-default)', borderTopColor: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
