import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';
export function ModeratorRoute() {
  const { data } = useMe();
  return data?.data?.user?.canModerate ? <Outlet /> : <Navigate to="/" replace />;
}
