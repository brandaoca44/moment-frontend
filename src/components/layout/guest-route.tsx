import { t, useLanguage } from '@/i18n';
import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';

export function GuestRoute() {
  useLanguage();
  const { data, isLoading, isError } = useMe();
  if (isLoading) return <div role="status" style={{ padding: 24 }}>{t("Carregando...")}</div>;
  if (!isError && data?.data?.user) return <Navigate to="/" replace />;
  return <Outlet />;
}
