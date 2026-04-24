import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';

export function ProtectedRoute() {
  const { data, isLoading, error } = useMe();

  if (isLoading) {
    return null;
  }

  if (error?.message === 'SESSION_EXPIRED' || !data?.data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}