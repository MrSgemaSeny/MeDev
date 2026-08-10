import { AppRouter } from './app/router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
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
