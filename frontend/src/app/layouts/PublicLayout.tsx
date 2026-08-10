import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
