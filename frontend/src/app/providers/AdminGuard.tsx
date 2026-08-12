import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';

export const AdminGuard = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
