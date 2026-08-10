import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../widgets/sidebar/AppSidebar';
import { AiChatWidget } from '../../features/ai-assistant/ui/AiChatWidget';

export const AppLayout = () => {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <AppSidebar />
      <main className="flex-1 overflow-y-auto" style={{ color: 'var(--color-text-primary)' }}>
        <Outlet />
        <AiChatWidget />
      </main>
    </div>
  );
};
