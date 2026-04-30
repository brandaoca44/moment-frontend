import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';
import { useLogout } from '@/features/auth/hooks/use-logout';
import momentIcon from '@/assets/moment-icon.svg';

const AMETHYST = '#7c3aed';
const AMETHYST_LIGHT = '#a78bfa';
const AMETHYST_BG = '#f5f3ff';

// Ícones SVG inline
function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navItems = [
  { to: '/', label: 'Início', icon: <IconHome /> },
  { to: '/profile', label: 'Perfil', icon: <IconUser /> },
  { to: '/notifications', label: 'Notificações', icon: <IconBell /> },
  { to: '/explore', label: 'Explorar', icon: <IconSearch /> },
  { to: '/settings', label: 'Configurações', icon: <IconSettings /> },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { data } = useMe();
  const logout = useLogout();

  const user = data?.data?.user;

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }

  function getInitials(name?: string) {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  return (
    <div style={rootStyle}>

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <Link to="/" style={logoLinkStyle}>
          <img src={momentIcon} alt="Moment" style={{ width: 36, height: 36 }} />
          <span style={logoTextStyle}>Moment</span>
        </Link>

        {/* Navegação */}
        <nav style={navStyle}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                ...navLinkStyle,
                background: isActive ? AMETHYST_BG : 'transparent',
                color: isActive ? AMETHYST : '#4b5563',
                fontWeight: isActive ? 700 : 500,
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuário + Logout */}
        <div style={userSectionStyle}>
          <div style={userRowStyle}>
            <div style={avatarStyle}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span style={avatarInitialsStyle}>{getInitials(user?.name)}</span>
              )}
            </div>
            <div style={userInfoStyle}>
              <span style={userNameStyle}>{user?.name}</span>
              <span style={userUsernameStyle}>@{user?.username}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            style={logoutButtonStyle}
            title="Sair"
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main style={mainStyle}>
        <Outlet />
      </main>

      {/* Coluna direita — futuramente sugestões, trending etc */}
      <aside style={rightColumnStyle}>
        <div style={rightCardStyle}>
          <p style={rightCardTitleStyle}>✦ Em breve</p>
          <p style={rightCardTextStyle}>Sugestões de pessoas e momentos populares aparecerão aqui.</p>
        </div>
      </aside>
    </div>
  );
}

const rootStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '260px 1fr 300px',
  gridTemplateRows: '1fr',
  background: '#fbfaff',
  fontFamily: "'DM Sans', sans-serif",
};

const sidebarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '28px 16px',
  borderRight: '1px solid #ede9fe',
  background: '#ffffff',
  gap: 8,
};

const logoLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
  padding: '4px 12px 20px',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: AMETHYST,
  fontFamily: "'Lora', serif",
  letterSpacing: -0.5,
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
};

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 14,
  textDecoration: 'none',
  fontSize: 15,
  transition: 'all 0.15s ease',
};

const userSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 12px 4px',
  borderTop: '1px solid #ede9fe',
  marginTop: 8,
  gap: 8,
};

const userRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

const avatarStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${AMETHYST}, ${AMETHYST_LIGHT})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
};

const avatarInitialsStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

const userNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#1f2937',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const userUsernameStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const logoutButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid #ede9fe',
  background: '#fafafa',
  color: '#9ca3af',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'all 0.15s ease',
};

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  borderRight: '1px solid #ede9fe',
  padding: '32px 28px',
  maxWidth: 680,
  width: '100%',
  margin: '0 auto',
};

const rightColumnStyle: React.CSSProperties = {
  padding: '32px 20px',
  position: 'sticky',
  top: 0,
  height: '100vh',
};

const rightCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede9fe',
  borderRadius: 20,
  padding: '20px 18px',
};

const rightCardTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 14,
  fontWeight: 700,
  color: AMETHYST,
  fontFamily: "'DM Sans', sans-serif",
};

const rightCardTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#9ca3af',
  lineHeight: 1.6,
  fontFamily: "'DM Sans', sans-serif",
};
