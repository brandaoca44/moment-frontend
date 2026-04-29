import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';

export function ProtectedRoute() {
  const location = useLocation();
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <div style={{ padding: 24 }}>Carregando...</div>;
  }

  if (isError || !data?.data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}