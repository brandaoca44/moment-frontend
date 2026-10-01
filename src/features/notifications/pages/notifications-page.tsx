import { relativeTime } from '@/i18n';
import { getLanguage } from '@/i18n';
import { systemMessage } from '@/i18n/system-message';
import { t, useLanguage } from '@/i18n';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  type MomentNotification,
} from '@/features/notifications/api/notifications';

import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications';

const NOTIFICATIONS_LIMIT = 30;

function HeartIcon() {
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
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function RemontIcon() {
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
      <path d="m17 1 4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />

      <path d="m7 23-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function UserPlusIcon() {
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
      <path d="M15 21a6 6 0 0 0-12 0" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function MentionIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function BellIcon() {
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

function CheckIcon() {
  useLanguage();
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

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

function formatNotificationDate(value: string) { return relativeTime(value); }

type NotificationPresentation = {
  icon: ReactNode;
  label: string;
  className: string;
};

function getNotificationPresentation(
  type: string,
): NotificationPresentation {
  const normalized = type.toUpperCase();
  if (normalized === 'REPLY') {
    return { icon: <MentionIcon />, label: t("respondeu ao seu momento"), className: 'notification-kind-mention' };
  }

  if (
    normalized === 'LIKE' ||
    normalized === 'LOVED' ||
    normalized === 'LOVE'
  ) {
    return {
      icon: <HeartIcon />,
      label: t("curtiu seu momento"),
      className: 'notification-kind-loved',
    };
  }

  if (
    normalized === 'REMONT' ||
    normalized === 'REPOST'
  ) {
    return {
      icon: <RemontIcon />,
      label: t("republicou seu momento"),
      className: 'notification-kind-remont',
    };
  }

  if (
    normalized === 'FOLLOW' ||
    normalized === 'FOLLOWED'
  ) {
    return {
      icon: <UserPlusIcon />,
      label: t("começou a seguir você"),
      className: 'notification-kind-follow',
    };
  }

  if (
    normalized === 'MENTION' ||
    normalized === 'MENTIONED'
  ) {
    return {
      icon: <MentionIcon />,
      label: t("mencionou você em um Moment"),
      className: 'notification-kind-mention',
    };
  }

  return {
    icon: <BellIcon />,
    label: t("interagiu com você"),
    className: 'notification-kind-default',
  };
}

function NotificationSkeleton() {
  useLanguage();
  return (
    <div className="notification-skeleton">
      <div className="notification-skeleton-avatar" />

      <div className="notification-skeleton-body">
        <div className="notification-skeleton-line notification-skeleton-line-main" />
        <div className="notification-skeleton-line notification-skeleton-line-small" />
      </div>
    </div>
  );
}

type NotificationItemProps = {
  notification: MomentNotification;
  isMarkingRead: boolean;
  onMarkAsRead: (notificationId: string) => void;
};

function NotificationItem({
  notification,
  isMarkingRead,
  onMarkAsRead,
}: NotificationItemProps) {
  useLanguage();
  if (notification.type === 'SYSTEM') return (
    <article className={notification.read ? 'notification-item' : 'notification-item notification-item-unread'}>
      <div className="notification-content">
        <strong>Moment</strong>
        <p>{systemMessage(notification.message ?? '')}</p>
        <small>{new Date(notification.createdAt).toLocaleString(getLanguage())}</small>
        {notification.href?.startsWith('/') && !notification.href.startsWith('//') && <p><Link to={notification.href} onClick={() => onMarkAsRead(notification.id)}>{t("Ver detalhes")}</Link></p>}
        {!notification.read && <button disabled={isMarkingRead} onClick={() => onMarkAsRead(notification.id)}>{t("Marcar como lida")}</button>}
      </div>
    </article>
  );
  const presentation = getNotificationPresentation(
    notification.type,
  );

  const profileUrl = `/profile/${encodeURIComponent(
    notification.actor.username,
  )}`;

  function handleMarkRead() {
    if (!notification.read && !isMarkingRead) {
      onMarkAsRead(notification.id);
    }
  }

  return (
    <article
      className={
        notification.read
          ? 'notification-item'
          : 'notification-item notification-item-unread'
      }
    >
      {!notification.read && (
        <span
          className="notification-unread-dot"
          aria-label={t("Não lida")}
        />
      )}

      <Link
        to={profileUrl}
        className="notification-avatar-link"
        aria-label={`${t("Abrir perfil de")} ${notification.actor.name}`}
      >
        <div className="notification-avatar">
          {notification.actor.avatar ? (
            <img
              src={notification.actor.avatar}
              alt=""
              className="notification-avatar-image"
            />
          ) : (
            <span>
              {getInitials(notification.actor.name)}
            </span>
          )}
        </div>

        <div
          className={`notification-kind ${presentation.className}`}
        >
          {presentation.icon}
        </div>
      </Link>

      <div className="notification-content">
        <div className="notification-copy">
          <p className="notification-message">
            <Link
              to={profileUrl}
              className="notification-actor"
            >
              {notification.actor.name}
            </Link>{' '}
            <span>{presentation.label}</span>
          </p>

          <span className="notification-time">
            {formatNotificationDate(notification.createdAt)}
          </span>
        </div>

        {notification.postId && <Link to={`/posts/${notification.postId}`}>{t("Ver conversa")}</Link>}
        {notification.post?.content && (
          <div className="notification-post-preview">
            <p>
              {notification.post.content.length > 150
                ? `${notification.post.content.slice(0, 150)}…`
                : notification.post.content}
            </p>

            {notification.post.imageUrl && (
              <img
                src={notification.post.imageUrl}
                alt=""
                className="notification-post-image"
              />
            )}
          </div>
        )}

        {!notification.read && (
          <button
            type="button"
            className="notification-read-button"
            disabled={isMarkingRead}
            onClick={handleMarkRead}
          >
            <CheckIcon />
            {isMarkingRead
              ? 'Marcando...'
              : t("Marcar como lida")}
          </button>
        )}
      </div>
    </article>
  );
}

export function NotificationsPage() {
  useLanguage();
  const notificationsQuery =
    useNotifications(NOTIFICATIONS_LIMIT);

  const markAsRead =
    useMarkNotificationAsRead(NOTIFICATIONS_LIMIT);

  const markAllAsRead =
    useMarkAllNotificationsAsRead(NOTIFICATIONS_LIMIT);

  const notifications =
    notificationsQuery.data?.data ?? [];

  const unreadCount =
    notificationsQuery.data?.meta.unreadCount ?? 0;

  function handleMarkAsRead(notificationId: string) {
    markAsRead.mutate(notificationId);
  }

  function handleMarkAllAsRead() {
    if (unreadCount === 0 || markAllAsRead.isPending) {
      return;
    }

    markAllAsRead.mutate();
  }

  return (
    <>
      <style>{`
        .notifications-page {
          position: relative;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          font-family: var(--font-ui);
        }

        .notifications-page::before {
          content: '';
          position: absolute;
          width: 520px;
          max-width: 100vw;
          height: 300px;
          top: -130px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(
            circle,
            rgba(var(--accent-rgb, 124, 58, 237), 0.11),
            transparent 68%
          );
          filter: blur(30px);
          pointer-events: none;
          z-index: -1;
        }

        .notifications-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .notifications-eyebrow {
          margin: 0 0 6px;
          color: var(--amethyst);
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .notifications-title {
          margin: 0;
          color: var(--text);
          font-family: var(--font-ui);
          font-size: clamp(38px, 6vw, 52px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.02em;
        }

        .notifications-subtitle {
          max-width: 460px;
          margin: 8px 0 0;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.65;
        }

        .notifications-read-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid var(--border-soft);
          border-radius: 15px;
          background: var(--surface-elevated);
          color: var(--text-soft);
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: var(--shadow-xs);
          transition:
            transform 180ms var(--ease-premium),
            color 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .notifications-read-all:hover:not(:disabled) {
          transform: translateY(-1px);
          color: var(--amethyst);
          border-color: var(--amethyst-border);
          background: var(--amethyst-bg);
          box-shadow: var(--shadow-sm);
        }

        .notifications-read-all:disabled {
          opacity: 0.48;
          cursor: default;
        }

        .notifications-summary {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 12px;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 750;
        }

        .notifications-summary-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: var(--amethyst);
          box-shadow: 0 0 0 5px var(--amethyst-bg);
        }

        .notifications-list {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border-soft);
          border-radius: 28px;
          background: var(--card-background, var(--card-bg));
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .notification-item {
          position: relative;
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr);
          gap: 14px;
          padding: 20px;
          border-bottom: 1px solid var(--border-soft);
          background: transparent;
          transition:
            background 180ms ease,
            transform 180ms var(--ease-premium);
        }

        .notification-item:last-child {
          border-bottom: 0;
        }

        .notification-item:hover {
          background: var(--panel-background, var(--surface-glass));
        }

        .notification-item-unread {
          background:
            linear-gradient(
              90deg,
              rgba(var(--accent-rgb, 124, 58, 237), 0.075),
              rgba(var(--accent-soft-rgb, 167, 139, 250), 0.025)
            );
        }

        .notification-unread-dot {
          position: absolute;
          top: 24px;
          right: 20px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--amethyst);
          box-shadow: 0 0 0 4px var(--amethyst-bg);
        }

        .notification-avatar-link {
          position: relative;
          width: 54px;
          height: 54px;
          text-decoration: none;
        }

        .notification-avatar {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50%;
          border: 2px solid var(--glass-highlight);
          background:
            linear-gradient(
              135deg,
              var(--amethyst),
              var(--amethyst-light)
            );
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: var(--shadow-xs);
        }

        .notification-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .notification-kind {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 3px solid var(--card-bg);
          background: var(--amethyst);
          color: #fff;
        }

        .notification-kind svg {
          width: 12px;
          height: 12px;
        }

        .notification-kind-loved {
          background: var(--amethyst);
        }

        .notification-kind-remont {
          background: var(--amethyst-light);
        }

        .notification-kind-follow {
          background: var(--text-soft);
        }

        .notification-kind-mention {
          background: var(--amethyst);
        }

        .notification-kind-default {
          background: var(--text-muted);
        }

        .notification-content {
          min-width: 0;
          padding-right: 16px;
        }

        .notification-copy {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
        }

        .notification-message {
          margin: 2px 0 0;
          color: var(--text-soft);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.55;
        }

        .notification-actor {
          color: var(--text);
          font-weight: 850;
          text-decoration: none;
        }

        .notification-actor:hover {
          color: var(--amethyst);
        }

        .notification-time {
          flex-shrink: 0;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .notification-post-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 12px 13px;
          border: 1px solid var(--border-soft);
          border-radius: 16px;
          background: var(--panel-background, var(--surface-glass));
        }

        .notification-post-preview p {
          flex: 1;
          min-width: 0;
          margin: 0;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.55;
        }

        .notification-post-image {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          object-fit: cover;
        }

        .notification-read-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--amethyst);
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
        }

        .notification-read-button:hover:not(:disabled) {
          text-decoration: underline;
        }

        .notification-read-button:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .notifications-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 330px;
          padding: 42px 24px;
          border: 1px solid var(--border-soft);
          border-radius: 28px;
          background: var(--card-background, var(--card-bg));
          text-align: center;
          box-shadow: var(--shadow-sm);
        }

        .notifications-state-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          border: 1px solid var(--amethyst-border);
          border-radius: 20px;
          background: var(--amethyst-bg);
          color: var(--amethyst);
          box-shadow: var(--shadow-xs);
        }

        .notifications-state h2 {
          margin: 0;
          color: var(--text);
          font-family: var(--font-ui);
          font-size: 29px;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .notifications-state p {
          max-width: 380px;
          margin: 8px 0 0;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.65;
        }

        .notifications-retry {
          margin-top: 18px;
          padding: 10px 15px;
          border: 1px solid var(--amethyst-border);
          border-radius: 14px;
          background: var(--amethyst-bg);
          color: var(--amethyst);
          font-family: inherit;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .notification-skeleton {
          display: flex;
          gap: 14px;
          padding: 20px;
          border-bottom: 1px solid var(--border-soft);
        }

        .notification-skeleton:last-child {
          border-bottom: 0;
        }

        .notification-skeleton-avatar {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--surface-elevated);
          animation: notificationPulse 1.4s ease-in-out infinite;
        }

        .notification-skeleton-body {
          flex: 1;
          padding-top: 5px;
        }

        .notification-skeleton-line {
          height: 11px;
          border-radius: 999px;
          background: var(--surface-elevated);
          animation: notificationPulse 1.4s ease-in-out infinite;
        }

        .notification-skeleton-line-main {
          width: 72%;
        }

        .notification-skeleton-line-small {
          width: 34%;
          margin-top: 11px;
        }

        @keyframes notificationPulse {
          0%, 100% {
            opacity: 0.45;
          }

          50% {
            opacity: 0.9;
          }
        }

        @media (max-width: 640px) {
          .notifications-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .notifications-title {
            font-size: 40px;
          }

          .notifications-read-all {
            width: 100%;
          }

          .notification-item {
            grid-template-columns: 50px minmax(0, 1fr);
            gap: 12px;
            padding: 17px 15px;
          }

          .notification-avatar-link {
            width: 48px;
            height: 48px;
          }

          .notification-avatar {
            width: 45px;
            height: 45px;
          }

          .notification-content {
            padding-right: 4px;
          }

          .notification-copy {
            display: block;
          }

          .notification-time {
            display: block;
            margin-top: 4px;
          }

          .notification-unread-dot {
            top: 20px;
            right: 14px;
          }

          .notification-post-preview {
            margin-top: 10px;
          }
        }
      `}</style>

      <section className="notifications-page">
        <header className="notifications-header">
          <div>
            <p className="notifications-eyebrow">
              {t(" Seu espaço ")}</p>

            <h1 className="notifications-title">
              {t(" Notificações ")}</h1>

            <p className="notifications-subtitle">
              {t(" Pequenos sinais das pessoas que fazem parte dos seus momentos. ")}</p>
          </div>

          <button
            type="button"
            className="notifications-read-all"
            onClick={handleMarkAllAsRead}
            disabled={
              unreadCount === 0 ||
              markAllAsRead.isPending
            }
          >
            <CheckIcon />

            {markAllAsRead.isPending
              ? 'Marcando...'
              : t("Marcar todas como lidas")}
          </button>
        </header>

        {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          notifications.length > 0 && (
            <div className="notifications-summary">
              {unreadCount > 0 && (
                <span className="notifications-summary-dot" />
              )}

              <span>
                {unreadCount > 0
                  ? `${unreadCount} ${
                      unreadCount === 1
                        ? t("notificação não lida")
                        : t("notificações não lidas")
                    }`
                  : t("Você está em dia com seus momentos")}
              </span>
            </div>
          )}

        {notificationsQuery.isLoading && (
          <div className="notifications-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="notifications-state">
            <div className="notifications-state-icon">
              <BellIcon />
            </div>

            <h2>{t("Algo ficou em silêncio.")}</h2>

            <p>
              {t(" Não conseguimos carregar suas notificações agora. Tente novamente em alguns instantes. ")}</p>

            <button
              type="button"
              className="notifications-retry"
              onClick={() => notificationsQuery.refetch()}
            >
              {t(" Tentar novamente ")}</button>
          </div>
        )}

        {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          notifications.length === 0 && (
            <div className="notifications-state">
              <div className="notifications-state-icon">
                <BellIcon />
              </div>

              <h2>{t("Ainda está tranquilo por aqui.")}</h2>

              <p>
                {t(" Quando alguém seguir você, curtir, republicar ou mencionar um dos seus momentos, você verá por aqui. ")}</p>
            </div>
          )}

        {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          notifications.length > 0 && (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isMarkingRead={
                    markAsRead.isPending &&
                    markAsRead.variables === notification.id
                  }
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
      </section>
    </>
  );
}
