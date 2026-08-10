import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      <main>
        <Outlet />
      </main>
    </div>
  );
};
