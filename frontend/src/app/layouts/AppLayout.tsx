import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../widgets/sidebar/AppSidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
