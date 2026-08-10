import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';

const LoginPage = lazy(() => import('../../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PortfolioPage = lazy(() => import('../../pages/portfolio/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const PricingPage = lazy(() => import('../../pages/billing/PricingPage').then(m => ({ default: m.PricingPage })));
const SuccessPage = lazy(() => import('../../pages/billing/SuccessPage').then(m => ({ default: m.SuccessPage })));
const CancelPage = lazy(() => import('../../pages/billing/CancelPage').then(m => ({ default: m.CancelPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0d1117]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#30363d] border-t-[#238636]"></div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return !accessToken ? children : <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/pricing',
    element: (
      <PrivateRoute>
        <PricingPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/billing/success',
    element: (
      <PrivateRoute>
        <SuccessPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/billing/cancel',
    element: (
      <PrivateRoute>
        <CancelPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/u/:username',
    element: <PortfolioPage />,
  },
], { basename: import.meta.env.BASE_URL });

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
