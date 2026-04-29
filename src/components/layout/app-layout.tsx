import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';
import { useLogout } from '@/features/auth/hooks/use-logout';

const AMETHYST = '#7c3aed';

export function AppLayout() {
  const navigate = useNavigate();
  const { data } = useMe();
  const logout = useLogout();

  const user = data?.data?.user;

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111827' }}>
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>Moment</Link>

        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Feed</Link>
          <Link to="/notifications" style={navLinkStyle}>Notificações</Link>
          <Link to="/profile" style={navLinkStyle}>Perfil</Link>
        </nav>

        <div style={rightStyle}>
          <span style={{ color: '#6b7280' }}>@{user?.username}</span>
          <button onClick={handleLogout} disabled={logout.isPending} style={logoutButtonStyle}>
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  height: 68,
  borderBottom: '1px solid #e5e7eb',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle: React.CSSProperties = {
  color: AMETHYST,
  fontWeight: 900,
  fontSize: 24,
  textDecoration: 'none',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 20,
};

const navLinkStyle: React.CSSProperties = {
  color: '#374151',
  textDecoration: 'none',
  fontWeight: 600,
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const logoutButtonStyle: React.CSSProperties = {
  height: 36,
  borderRadius: 10,
  border: `1px solid ${AMETHYST}`,
  background: '#fff',
  color: AMETHYST,
  fontWeight: 700,
  padding: '0 14px',
  cursor: 'pointer',
};