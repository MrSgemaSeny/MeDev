import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../widgets/sidebar/AppSidebar';
import { MobileNavDrawer } from '../../widgets/sidebar/MobileNavDrawer';
import { AppHeader } from '../../widgets/header/AppHeader';
import { AiChatWidget } from '../../features/ai-assistant/ui/AiChatWidget';
import { UpsellModal } from '../../shared/ui/UpsellModal';
import { OnboardingWizard } from '../../features/onboarding/ui/OnboardingWizard';

export const AppLayout = () => {
  return (
    <div className="flex h-[100dvh] overflow-hidden overflow-x-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AppSidebar />
      <MobileNavDrawer />
      <main className="flex-1 flex flex-col h-[100dvh] min-w-0 overflow-x-hidden" style={{ color: 'var(--color-text-primary)' }}>
        <AppHeader />
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative p-3 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
        <AiChatWidget />
        <UpsellModal />
        <OnboardingWizard />
      </main>
    </div>
  );
};
