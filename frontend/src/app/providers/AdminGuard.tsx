import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';

export const AdminGuard = () => {
  const { accessToken, username } = useAuthStore();
  const isAuthenticated = !!accessToken;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (username !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
