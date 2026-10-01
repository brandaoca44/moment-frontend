import { DiscoverySidebar } from './discovery-sidebar';
import { t, useLanguage } from '@/i18n';
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { useState } from 'react';
import { LegalLinks } from '@/features/legal/legal-pages';
import { StationShortcuts } from '@/features/stations/station-shortcuts';

import { useMe } from '@/features/auth/hooks/use-me';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';

import momentIcon from '@/assets/moment-icon.svg';

const NOTIFICATIONS_LIMIT = 30;

function IconHome() {
  useLanguage();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function IconUser() {
  useLanguage();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function IconBell() {
  useLanguage();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconSearch() {
  useLanguage();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function IconSettings() {
  useLanguage();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 1 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H3a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 4.72 8.6a1.8 1.8 0 0 0-.36-1.98l-.04-.04A2.1 2.1 0 1 1 7.3 3.61l.04.04a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.4 2.35V2a2.1 2.1 0 1 1 4.2 0v.06a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.66 1.1H22a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

function IconLogout() {
  useLanguage();
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function IconMore() {
  useLanguage();
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

const navItems = [
  {
    to: '/',
    get label() { return t("Início"); },
    icon: <IconHome />,
  },
  {
    to: '/profile',
    get label() { return t("Perfil"); },
    icon: <IconUser />,
  },
  {
    to: '/communities',
    get label() { return t("Estações"); },
    icon: <IconUser />,
  },
  {
    to: '/notifications',
    get label() { return t("Notificações"); },
    icon: <IconBell />,
    notifications: true,
  },
  {
    to: '/explore',
    get label() { return t("Explorar"); },
    icon: <IconSearch />,
  },
  {
    to: '/settings',
    get label() { return t("Configurações"); },
    icon: <IconSettings />,
  },
];

function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function AppLayout() {
  useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data } = useMe();
  const logout = useLogout();

  const notificationsQuery =
    useNotifications(NOTIFICATIONS_LIMIT);

  const user = data?.data?.user;

  const unreadCount =
    notificationsQuery.data?.meta.unreadCount ?? 0;

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      navigate('/login', {
        replace: true,
      });
    }
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
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr) 306px;
          background:
            radial-gradient(
              circle at top left,
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.11),
              transparent 32%
            ),
            radial-gradient(
              circle at 82% 8%,
              rgba(var(--accent-rgb, 124, 58, 237), 0.08),
              transparent 28%
            ),
            transparent;
          overflow-x: hidden;
        }

        .app-root::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,0.055),
              transparent 42%,
              rgba(255,255,255,0.035)
            ),
            radial-gradient(
              circle at bottom center,
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.06),
              transparent 34%
            );
        }

        .app-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 28px 18px;
          border-right: 1px solid var(--glass-border);
          background:
            linear-gradient(
              180deg,
              var(--surface-glass),
              rgba(255,255,255,0.02)
            );
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          box-shadow: var(--shadow-sm);
          min-width: 0;
        }

        .app-logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 12px 24px;
          text-decoration: none;
        }

        .app-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          box-shadow: var(--shadow-amethyst);
          transition:
            transform 190ms var(--ease-premium),
            box-shadow 190ms ease;
        }

        .app-logo-link:hover .app-logo-icon {
          transform: translateY(-1px) scale(1.02);
        }

        .app-mobile-menu-toggle {
          display: none;
        }

        .app-logo-text {
          color: var(--amethyst);
          font-family: var(--font-ui);
          font-size: 30px;
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.08;
        }

        .app-nav {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 7px;
        }

        .app-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 13px 16px;
          overflow: hidden;
          border: 1px solid transparent;
          border-radius: 18px;
          color: var(--text-soft);
          font-family: var(--font-ui);
          font-size: 15px;
          font-weight: 750;
          text-decoration: none;
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
          background:
            radial-gradient(
              circle at top left,
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.18),
              transparent 45%
            );
          opacity: 0;
          transition: opacity 210ms ease;
        }

        .app-nav-icon,
        .app-nav-label,
        .app-notification-badge {
          position: relative;
          z-index: 1;
        }

        .app-nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .app-nav-label {
          min-width: 0;
        }

        .app-nav-link:hover {
          transform: translateY(-1px);
          border-color: var(--border-soft);
          background: var(--surface-elevated);
          color: var(--amethyst);
          box-shadow: var(--shadow-xs);
        }

        .app-nav-link:hover::before,
        .app-nav-link.active::before {
          opacity: 1;
        }

        .app-nav-link.active {
          border-color: rgba(var(--accent-soft-rgb, 167, 139, 250), 0.28);
          background:
            linear-gradient(
              135deg,
              rgba(var(--accent-rgb, 124, 58, 237), 0.14),
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.08)
            );
          color: var(--amethyst);
          box-shadow: var(--shadow-amethyst);
        }

        .app-notification-badge {
          min-width: 21px;
          height: 21px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          padding: 0 6px;
          border: 2px solid var(--surface-elevated);
          border-radius: 999px;
          background:
            linear-gradient(
              135deg,
              var(--amethyst),
              var(--amethyst-light)
            );
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
          box-shadow: var(--shadow-amethyst);
        }

        .app-user-section {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 8px;
          padding: 14px;
          overflow: hidden;
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          background: var(--surface-elevated);
          box-shadow: var(--shadow-xs);
        }

        .app-user-section::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at top left,
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.14),
              transparent 46%
            );
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
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 2px solid var(--glass-highlight);
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              var(--amethyst),
              var(--amethyst-light)
            );
          box-shadow: var(--shadow-amethyst);
        }

        .app-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .app-avatar-initials {
          color: #fff;
          font-size: 14px;
          font-weight: 900;
        }

        .app-user-info {
          font-family: var(--font-ui);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .app-user-name {
          overflow: hidden;
          color: var(--text);
          font-size: 14px;
          font-weight: 750;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .app-user-username {
          overflow: hidden;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .app-logout-btn {
          position: relative;
          z-index: 1;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--border-soft);
          border-radius: 15px;
          background: var(--panel-background, var(--surface-glass));
          color: var(--text-muted);
          cursor: pointer;
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
          background: var(--amethyst-bg);
          color: var(--amethyst);
          box-shadow: var(--shadow-xs);
        }

        .app-logout-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .app-main {
          width: 100%;
          min-width: 0;
          max-width: 760px;
          min-height: 100vh;
          margin: 0 auto;
          padding: 36px 28px;
          border-right: 1px solid var(--border-soft);
          overflow-x: hidden;
        }

        .app-right-column {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 36px 22px;
        }

        .app-right-card {
          position: relative;
          padding: 22px 20px;
          overflow: hidden;
          border: 1px solid var(--border-soft);
          border-radius: 26px;
          background: var(--card-background, var(--card-bg));
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .app-right-card::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at top right,
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.16),
              transparent 42%
            );
        }

        .app-right-card-title {
          position: relative;
          margin: 0 0 8px;
          color: var(--amethyst);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .app-right-card-text {
          position: relative;
          margin: 0;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
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
            padding: 14px 14px 12px;
            border-right: none;
            border-bottom: 1px solid var(--border-soft);
          }

          .app-logo-link {
            padding: 0 4px 12px;
          }

          .app-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .app-mobile-menu-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            border: 1px solid var(--border-soft);
            border-radius: 13px;
            background: var(--surface-elevated);
            color: var(--text-soft);
            cursor: pointer;
          }

          .app-logo-icon {
            width: 34px;
            height: 34px;
          }

          .app-logo-text {
            font-size: 21px;
          }

          .app-nav {
            display: none;
          }

          .app-nav.mobile-open {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 8px 0 2px;
          }

          .app-nav-link {
            width: 100%;
            padding: 10px 12px;
            border-radius: 16px;
            white-space: nowrap;
          }

          .app-notification-badge {
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 9px;
          }

          .app-user-section {
            display: none;
          }

          .app-main {
            max-width: 100%;
            padding: 24px 16px;
            border-right: none;
          }
        }

        @media (max-width: 520px) {
          .app-sidebar {
            padding: 10px 10px 8px;
          }

          .app-logo-link {
            gap: 8px;
            padding-bottom: 8px;
          }

          .app-mobile-menu-toggle {
            width: 36px;
            height: 36px;
            border-radius: 12px;
          }

          .app-logo-icon {
            width: 30px;
            height: 30px;
            border-radius: 10px;
          }

          .app-logo-text {
            font-size: 19px;
          }

          .app-nav {
            gap: 4px;
          }

          .app-nav.mobile-open {
            gap: 4px;
          }

          .app-nav-link {
            gap: 8px;
            padding: 9px 10px;
            border-radius: 13px;
            font-size: 14px;
          }

          .app-main {
            padding: 16px 10px 24px;
          }
        }
      `}</style>

      <div className="app-root">
        <aside className="app-sidebar">
          <div className="app-mobile-header">
            <Link
              to="/"
              className="app-logo-link"
            >
              <img
                src={momentIcon}
                alt="Moment"
                className="app-logo-icon"
              />

              <span className="app-logo-text">
                Moment
              </span>
            </Link>

            <button
              type="button"
              className="app-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? t("Fechar menu") : t("Abrir menu")}
            >
              <IconMore />
            </button>
          </div>

          <nav
            id="mobile-navigation"
            className={`app-nav${isMobileMenuOpen ? ' mobile-open' : ''}`}
            aria-label={t("Navegação principal")}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'app-nav-link active'
                    : 'app-nav-link'
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="app-nav-icon">
                  {item.icon}
                </span>

                <span className="app-nav-label">
                  {item.label}
                </span>

                {item.notifications &&
                  unreadCount > 0 && (
                    <span
                      className="app-notification-badge"
                      aria-label={`${unreadCount} notificações não lidas`}
                    >
                      {unreadCount > 99
                        ? '99+'
                        : unreadCount}
                    </span>
                  )}
              </NavLink>
            ))}
            {user?.canModerate && <NavLink to="/moderation" className="app-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t("Moderação")}</NavLink>}
            <StationShortcuts close={() => setIsMobileMenuOpen(false)} />
            <LegalLinks />
          </nav>

          <div className="app-user-section">
            <div className="app-user-row">
              <div className="app-avatar">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="app-avatar-image"
                  />
                ) : (
                  <span className="app-avatar-initials">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>

              <div className="app-user-info">
                <span className="app-user-name">
                  {user?.name}
                </span>

                <span className="app-user-username">
                  @{user?.username}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="app-logout-btn"
              onClick={handleLogout}
              disabled={logout.isPending}
              title={t("Sair")}
              aria-label={t("Sair")}
            >
              <IconLogout />
            </button>
          </div>
        </aside>

        <main className="app-main">
          <Outlet />
        </main>

        <aside className="app-right-column">
          <DiscoverySidebar />
        </aside>
      </div>
    </>
  );
}
