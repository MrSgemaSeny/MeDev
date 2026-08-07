import { AppRouter } from './app/router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
