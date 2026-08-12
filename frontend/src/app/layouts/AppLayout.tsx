import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../widgets/sidebar/AppSidebar';
import { AppHeader } from '../../widgets/header/AppHeader';
import { AiChatWidget } from '../../features/ai-assistant/ui/AiChatWidget';
import { UpsellModal } from '../../shared/ui/UpsellModal';

export const AppLayout = () => {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-full" style={{ color: 'var(--color-text-primary)' }}>
          <div className="flex-1 overflow-y-auto relative">
            <Outlet />
          </div>
          <AiChatWidget />
          <UpsellModal />
        </main>
      </div>
    </div>
  );
};
