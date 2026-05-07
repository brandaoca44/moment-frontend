import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';
import { useLogout } from '@/features/auth/hooks/use-logout';
import momentIcon from '@/assets/moment-icon.svg';

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 1 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H3a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 4.72 8.6a1.8 1.8 0 0 0-.36-1.98l-.04-.04A2.1 2.1 0 1 1 7.3 3.61l.04.04a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.4 2.35V2a2.1 2.1 0 1 1 4.2 0v.06a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1H22a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
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
    } finally {
      navigate('/login', { replace: true });
    }
  }

  function getInitials(name?: string) {
    if (!name) return '?';

    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  return (
    <>
      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app-root {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr) 306px;
          background:
            radial-gradient(circle at top left, rgba(167, 139, 250, 0.11), transparent 32%),
            radial-gradient(circle at 82% 8%, rgba(124, 58, 237, 0.08), transparent 28%),
            transparent;
        }

        .app-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.055), transparent 42%, rgba(255,255,255,0.035)),
            radial-gradient(circle at bottom center, rgba(167, 139, 250, 0.06), transparent 34%);
          z-index: -1;
        }

        .app-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 28px 18px;
          border-right: 1px solid var(--glass-border);
          background:
            linear-gradient(180deg, var(--surface-glass), rgba(255,255,255,0.02));
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          gap: 12px;
          box-shadow: var(--shadow-sm);
        }

        .app-logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 4px 12px 24px;
        }

        .app-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          box-shadow: var(--shadow-amethyst);
          transition: transform 190ms var(--ease-premium), box-shadow 190ms ease;
        }

        .app-logo-link:hover .app-logo-icon {
          transform: translateY(-1px) scale(1.02);
        }

        .app-logo-text {
          font-size: 30px;
          font-weight: 400;
          color: var(--amethyst);
          font-family: 'Instrument Serif', serif;
          letter-spacing: -0.02em;
          line-height: 1.08;
        }

        .app-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
          flex: 1;
        }

        .app-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 18px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 750;
          color: var(--text-soft);
          border: 1px solid transparent;
          overflow: hidden;
          transition:
            background 210ms ease,
            border-color 210ms ease,
            transform 190ms var(--ease-premium),
            color 210ms ease,
            box-shadow 210ms ease;
        }

        .app-nav-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(167, 139, 250, 0.18), transparent 45%);
          opacity: 0;
          transition: opacity 210ms ease;
        }

        .app-nav-link span,
        .app-nav-link svg {
          position: relative;
          z-index: 1;
        }

        .app-nav-link:hover {
          transform: translateY(-1px);
          background: var(--surface-elevated);
          border-color: var(--border-soft);
          color: var(--amethyst);
          box-shadow: var(--shadow-xs);
        }

        .app-nav-link:hover::before,
        .app-nav-link.active::before {
          opacity: 1;
        }

        .app-nav-link.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(167, 139, 250, 0.08));
          border-color: rgba(167, 139, 250, 0.28);
          color: var(--amethyst);
          box-shadow: var(--shadow-amethyst);
        }

        .app-user-section {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 14px;
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          background: var(--surface-elevated);
          box-shadow: var(--shadow-xs);
          gap: 10px;
          overflow: hidden;
        }

        .app-user-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(167, 139, 250, 0.14), transparent 46%);
          pointer-events: none;
        }

        .app-user-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .app-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: var(--shadow-amethyst);
          border: 2px solid var(--glass-highlight);
        }

        .app-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .app-user-name {
          font-size: 14px;
          font-weight: 850;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-user-username {
          font-size: 12px;
          font-weight: 650;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-logout-btn {
          position: relative;
          z-index: 1;
          width: 38px;
          height: 38px;
          border-radius: 15px;
          border: 1px solid var(--border-soft);
          background: var(--surface-glass);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition:
            transform 180ms var(--ease-premium),
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .app-logout-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: var(--amethyst-border);
          color: var(--amethyst);
          background: var(--amethyst-bg);
          box-shadow: var(--shadow-xs);
        }

        .app-logout-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .app-main {
          min-height: 100vh;
          border-right: 1px solid var(--border-soft);
          padding: 36px 28px;
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
        }

        .app-right-column {
          padding: 36px 22px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .app-right-card {
          position: relative;
          overflow: hidden;
          background: var(--card-bg);
          border: 1px solid var(--border-soft);
          border-radius: 26px;
          padding: 22px 20px;
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .app-right-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(167, 139, 250, 0.16), transparent 42%);
          pointer-events: none;
        }

        .app-right-card-title {
          position: relative;
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 900;
          color: var(--amethyst);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .app-right-card-text {
          position: relative;
          margin: 0;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-muted);
          line-height: 1.7;
        }

        @media (max-width: 1120px) {
          .app-root {
            grid-template-columns: 240px minmax(0, 1fr);
          }

          .app-right-column {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .app-root {
            display: block;
          }

          .app-sidebar {
            position: sticky;
            top: 0;
            z-index: 20;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-soft);
            padding: 14px 14px 12px;
          }

          .app-logo-link {
            padding: 0 4px 12px;
          }

          .app-logo-icon {
            width: 34px;
            height: 34px;
          }

          .app-logo-text {
            font-size: 21px;
          }

          .app-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
          }

          .app-nav::-webkit-scrollbar {
            display: none;
          }

          .app-nav-link {
            white-space: nowrap;
            padding: 11px 13px;
            border-radius: 16px;
          }

          .app-user-section {
            display: none;
          }

          .app-main {
            border-right: none;
            padding: 24px 16px;
            max-width: 100%;
          }
        }
      `}</style>

      <div className="app-root">
        <aside className="app-sidebar">
          <Link to="/" className="app-logo-link">
            <img src={momentIcon} alt="Moment" className="app-logo-icon" />
            <span className="app-logo-text">Moment</span>
          </Link>

          <nav className="app-nav" aria-label="Navegação principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'app-nav-link active' : 'app-nav-link'
                }
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="app-user-section">
            <div className="app-user-row">
              <div className="app-avatar">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>

              <div className="app-user-info">
                <span className="app-user-name">{user?.name}</span>
                <span className="app-user-username">@{user?.username}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="app-logout-btn"
              title="Sair"
              type="button"
            >
              <IconLogout />
            </button>
          </div>
        </aside>

        <main className="app-main">
          <Outlet />
        </main>

        <aside className="app-right-column">
          <div className="app-right-card">
            <p className="app-right-card-title">Em breve</p>
            <p className="app-right-card-text">
              Sugestões de pessoas e momentos populares aparecerão aqui de forma leve e cuidadosa.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
