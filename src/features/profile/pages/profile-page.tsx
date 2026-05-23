import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-me';
import { useFollowUser, useProfile, useUserPosts } from '../hooks/use-profile';
import type { ProfilePost } from '../api/profile';

function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

function formatPostDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));
}

function formatCount(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function ProfilePostCard({ post }: { post: ProfilePost }) {
  return (
    <article className="profile-post-card">
      <header className="profile-post-header">
        <div className="profile-post-avatar">
          {post.author.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} />
          ) : (
            getInitials(post.author.name)
          )}
        </div>

        <div className="profile-post-author">
          <strong>{post.author.name}</strong>
          <span>@{post.author.username}</span>
        </div>

        <time className="profile-post-date" dateTime={post.createdAt}>
          {formatPostDate(post.createdAt)}
        </time>
      </header>

      {post.content && <p className="profile-post-content">{post.content}</p>}

      {post.image && (
        <img src={post.image} alt="Imagem do momento" className="profile-post-image" />
      )}

      <footer className="profile-post-footer">
        <span className="profile-post-stat" aria-label={`${post._count.likes} loveds`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          {formatCount(post._count.likes)}
        </span>

        <span className="profile-post-stat" aria-label={`${post._count.remonts} remonts`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          {formatCount(post._count.remonts)}
        </span>
      </footer>
    </article>
  );
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: meData, isLoading: meLoading } = useMe();
  const me = meData?.data?.user;

  const targetUsername = useMemo(() => username ?? me?.username ?? '', [me?.username, username]);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(targetUsername);

  const profile = profileData?.data.user;
  const isOwnProfile = Boolean(me?.id && profile?.id && me.id === profile.id);

  const followMutation = useFollowUser(targetUsername, profile?.id);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
  } = useUserPosts(profile?.id ?? '');

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loaderRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '160px', threshold: 0.1 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];
  const isInitialLoading = meLoading || profileLoading || !targetUsername;

  return (
    <>
      <style>{`
        .profile-page {
          position: relative;
          max-width: 660px;
          margin: 0 auto;
          font-family: 'DM Sans', sans-serif;
          animation: fadeIn 240ms ease both;
        }

        .profile-page::before {
          content: '';
          position: fixed;
          top: -220px;
          left: 50%;
          width: 720px;
          height: 720px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(124, 58, 237, 0.11), transparent 70%);
          filter: blur(42px);
          pointer-events: none;
          z-index: -1;
        }

        .profile-shell {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .profile-header {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 30px;
          border: 1px solid var(--glass-border);
          background:
            radial-gradient(circle at top right, rgba(167, 139, 250, 0.18), transparent 34%),
            linear-gradient(135deg, var(--surface-glass), var(--surface-elevated));
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .profile-header::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 33px;
          border: 1px solid var(--glass-highlight);
          pointer-events: none;
        }

        .profile-top-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .profile-identity {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          min-width: 0;
        }

        .profile-avatar {
          width: 88px;
          height: 88px;
          border-radius: 999px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          border: 4px solid rgba(255, 255, 255, 0.72);
          box-shadow: var(--shadow-amethyst);
          color: #fff;
          font-size: 30px;
          font-weight: 900;
        }

        .profile-avatar img,
        .profile-post-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .profile-names {
          min-width: 0;
          padding-top: 3px;
        }

        .profile-kicker {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--amethyst);
        }

        .profile-name {
          margin: 0;
          color: var(--text);
          font-family: 'Instrument Serif', serif;
          font-size: 36px;
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.018em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-username {
          margin: 7px 0 0;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 700;
        }

        .profile-since {
          margin: 12px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 700;
        }

        .profile-action-row {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .profile-button {
          min-height: 42px;
          padding: 0 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 220ms ease,
            background 220ms ease,
            border-color 220ms ease,
            color 220ms ease;
        }

        .profile-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .profile-button:disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }

        .profile-button.primary {
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #fff;
          box-shadow: var(--shadow-amethyst);
        }

        .profile-button.secondary {
          border-color: var(--border-soft);
          background: var(--surface-elevated);
          color: var(--text-soft);
          box-shadow: var(--shadow-xs);
        }

        .profile-button.secondary:hover:not(:disabled) {
          border-color: var(--amethyst-border);
          background: var(--amethyst-bg);
          color: var(--amethyst);
        }

        .profile-button.danger-hover:hover:not(:disabled) {
          border-color: var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger);
        }

        .profile-meta-row {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid var(--border-soft);
        }

        .profile-counters {
          display: flex;
          gap: 26px;
          flex-wrap: wrap;
        }

        .profile-counter {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-counter strong {
          color: var(--text);
          font-size: 19px;
          font-weight: 900;
          line-height: 1;
        }

        .profile-counter span {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .profile-mutual {
          width: fit-content;
          border-radius: 999px;
          padding: 7px 12px;
          border: 1px solid var(--amethyst-border);
          background: var(--amethyst-bg);
          color: var(--amethyst);
          font-size: 12px;
          font-weight: 900;
        }

        .profile-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 6px 2px 0;
        }

        .profile-section-title h2 {
          margin: 0;
          color: var(--text);
          font-family: 'Instrument Serif', serif;
          font-size: 30px;
          font-weight: 400;
          line-height: 1.12;
          letter-spacing: -0.01em;
        }

        .profile-section-title span {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 800;
        }

        .profile-posts-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .profile-post-card {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          border-radius: 26px;
          border: 1px solid var(--glass-border);
          background: var(--surface-glass);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition:
            transform 180ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .profile-post-card:hover {
          transform: translateY(-2px);
          border-color: var(--amethyst-border);
          box-shadow: var(--shadow-md);
        }

        .profile-post-header {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .profile-post-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          flex-shrink: 0;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: var(--shadow-xs);
        }

        .profile-post-author {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .profile-post-author strong {
          color: var(--text);
          font-size: 14px;
          font-weight: 900;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-post-author span,
        .profile-post-date {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .profile-post-date {
          margin-left: auto;
          flex-shrink: 0;
          text-transform: lowercase;
        }

        .profile-post-content {
          margin: 0;
          color: var(--text);
          font-size: 15px;
          line-height: 1.72;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .profile-post-image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          display: block;
          border-radius: 20px;
          border: 1px solid var(--border-soft);
        }

        .profile-post-footer {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-top: 2px;
        }

        .profile-post-stat {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 800;
        }

        .profile-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 220px;
          padding: 44px 22px;
          text-align: center;
          border-radius: 28px;
          border: 1px solid var(--border-soft);
          background: var(--surface-glass);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .profile-state.compact {
          min-height: 140px;
          padding: 34px 20px;
        }

        .profile-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border);
          border-top-color: var(--amethyst);
          border-radius: 999px;
          animation: spin 0.8s linear infinite;
        }

        .profile-state-icon {
          color: var(--amethyst-light);
          font-size: 30px;
          line-height: 1;
        }

        .profile-state-title {
          margin: 0;
          color: var(--text);
          font-family: 'Instrument Serif', serif;
          font-size: 30px;
          font-weight: 400;
          line-height: 1.14;
          letter-spacing: -0.01em;
        }

        .profile-state-text {
          max-width: 420px;
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.65;
        }

        .profile-error {
          border-color: var(--danger-border);
          background: var(--danger-bg);
        }

        .profile-error .profile-state-title {
          color: var(--danger);
        }

        .profile-loader {
          min-height: 40px;
          padding: 6px 0 34px;
        }

        .profile-end-text {
          margin: 0;
          padding: 16px 0 26px;
          color: var(--amethyst-light);
          text-align: center;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        @media (max-width: 760px) {
          .profile-page {
            max-width: 100%;
          }

          .profile-header {
            padding: 24px;
            border-radius: 30px;
          }

          .profile-top-row {
            flex-direction: column;
          }

          .profile-action-row,
          .profile-button {
            width: 100%;
          }

          .profile-button {
            min-height: 46px;
          }
        }

        @media (max-width: 520px) {
          .profile-header {
            padding: 22px;
          }

          .profile-identity {
            gap: 14px;
          }

          .profile-avatar {
            width: 68px;
            height: 68px;
            font-size: 23px;
          }

          .profile-name {
            font-size: 30px;
            white-space: normal;
          }

          .profile-meta-row {
            margin-top: 22px;
          }

          .profile-counters {
            width: 100%;
            justify-content: space-between;
            gap: 12px;
          }

          .profile-section-title h2,
          .profile-state-title {
            font-size: 27px;
          }

          .profile-post-card {
            border-radius: 24px;
            padding: 18px;
          }
        }
      `}</style>

      <div className="profile-page">
        {isInitialLoading && (
          <div className="profile-state compact">
            <div className="profile-spinner" />
            <p className="profile-state-text">Carregando perfil...</p>
          </div>
        )}

        {profileError && !isInitialLoading && (
          <div className="profile-state profile-error">
            <span className="profile-state-icon">✦</span>
            <h1 className="profile-state-title">Usuário não encontrado</h1>
            <p className="profile-state-text">
              O perfil <strong>@{targetUsername}</strong> não existe ou foi removido.
            </p>
          </div>
        )}

        {profile && (
          <div className="profile-shell">
            <header className="profile-header">
              <div className="profile-top-row">
                <div className="profile-identity">
                  <div className="profile-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      getInitials(profile.name)
                    )}
                  </div>

                  <div className="profile-names">
                    <p className="profile-kicker">Perfil</p>
                    <h1 className="profile-name">{profile.name}</h1>
                    <p className="profile-username">@{profile.username}</p>
                    <p className="profile-since">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      Desde {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="profile-action-row">
                  {isOwnProfile ? (
                    <Link to="/settings" className="profile-button secondary">
                      Editar perfil
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={followMutation.isPending}
                      onClick={() =>
                        followMutation.mutate({
                          targetUserId: profile.id,
                          isFollowing: profile.isFollowing ?? false,
                        })
                      }
                      className={`profile-button ${profile.isFollowing ? 'secondary danger-hover' : 'primary'}`}
                    >
                      {followMutation.isPending
                        ? 'Aguarde...'
                        : profile.isFollowing
                          ? 'Seguindo'
                          : 'Seguir'}
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-meta-row">
                <div className="profile-counters" aria-label="Estatísticas do perfil">
                  <div className="profile-counter">
                    <strong>{formatCount(profile._count.posts)}</strong>
                    <span>momentos</span>
                  </div>

                  <div className="profile-counter">
                    <strong>{formatCount(profile._count.followers)}</strong>
                    <span>seguidores</span>
                  </div>

                  <div className="profile-counter">
                    <strong>{formatCount(profile._count.follows)}</strong>
                    <span>seguindo</span>
                  </div>
                </div>

                {!isOwnProfile && profile.isFollowedBy && (
                  <span className="profile-mutual">Segue você</span>
                )}
              </div>
            </header>

            <section className="profile-section-title" aria-label="Momentos do perfil">
              <h2>Momentos</h2>
              <span>{formatCount(profile._count.posts)}</span>
            </section>

            {postsLoading && (
              <div className="profile-state compact">
                <div className="profile-spinner" />
              </div>
            )}

            {postsError && !postsLoading && (
              <div className="profile-state profile-error compact">
                <h2 className="profile-state-title">Não foi possível carregar os momentos</h2>
                <p className="profile-state-text">Tente atualizar a página em alguns segundos.</p>
              </div>
            )}

            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="profile-state">
                <span className="profile-state-icon">✦</span>
                <h2 className="profile-state-title">Ainda silencioso por aqui.</h2>
                <p className="profile-state-text">
                  {isOwnProfile
                    ? 'Quando você compartilhar seu primeiro momento, ele vai aparecer neste espaço.'
                    : `${profile.name} ainda não publicou nenhum momento.`}
                </p>
              </div>
            )}

            {posts.length > 0 && (
              <div className="profile-posts-list">
                {posts.map((post) => (
                  <ProfilePostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <div ref={loaderRef} className="profile-loader">
              {isFetchingNextPage && (
                <div className="profile-state compact">
                  <div className="profile-spinner" />
                </div>
              )}

              {!hasNextPage && posts.length > 0 && (
                <p className="profile-end-text">✦ Todos os momentos ✦</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
