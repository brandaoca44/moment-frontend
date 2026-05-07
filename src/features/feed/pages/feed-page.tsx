import { useEffect, useRef, useState } from 'react';
import { useFeed } from '../hooks/use-feed';
import { PostCard } from '../components/post-card';
import { CreatePost } from '../components/create-post';

type FeedType = 'global' | 'following';

export function FeedPage() {
  const [feedType, setFeedType] = useState<FeedType>('global');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFeed(feedType);

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <style>{`
        .feed-page {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
          font-family: 'DM Sans', sans-serif;
          animation: feedFadeIn 260ms var(--ease-premium) both;
        }

        .feed-page::before {
          content: '';
          position: fixed;
          top: -220px;
          left: 50%;
          width: 720px;
          height: 720px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.11), transparent 68%);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: -1;
          filter: blur(38px);
        }

        .feed-header {
          margin-bottom: 18px;
          padding: 4px 2px 0;
        }

        .feed-kicker {
          margin: 0 0 6px;
          color: var(--amethyst);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .feed-title {
          margin: 0;
          color: var(--text);
          font-family: 'Instrument Serif', serif;
          font-size: clamp(30px, 5vw, 40px);
          font-weight: 400;
          letter-spacing: -0.012em;
          line-height: 1.12;
        }

        .feed-subtitle {
          max-width: 520px;
          margin: 9px 0 0;
          color: var(--text-muted);
          font-size: 14.5px;
          line-height: 1.65;
        }

        .feed-tabs {
          position: sticky;
          top: 22px;
          z-index: 5;
          display: flex;
          gap: 6px;
          margin-bottom: 22px;
          padding: 6px;
          border-radius: 22px;
          background: var(--surface-glass);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .feed-tab {
          flex: 1;
          min-height: 44px;
          padding: 0 14px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 16px;
          font-size: 14.5px;
          font-weight: 850;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-muted);
          transition:
            transform 180ms var(--ease-premium),
            background 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .feed-tab:hover {
          color: var(--amethyst);
          background: var(--surface-elevated);
          border-color: var(--border-soft);
        }

        .feed-tab.active {
          color: #fff;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          border-color: transparent;
          box-shadow: var(--shadow-amethyst);
          transform: translateY(-1px);
        }

        .feed-composer-wrap {
          margin-bottom: 16px;
        }

        .feed-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 42px 0;
          gap: 14px;
        }

        .feed-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid var(--border-soft);
          border-top: 3px solid var(--amethyst);
          border-radius: 50%;
          animation: spin 0.82s linear infinite;
          box-shadow: 0 0 22px rgba(124, 58, 237, 0.14);
        }

        .feed-loading-text {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 650;
        }

        .feed-error-box {
          position: relative;
          overflow: hidden;
          background: var(--danger-bg);
          border: 1px solid var(--danger-border);
          border-radius: 20px;
          padding: 18px 20px;
          margin-bottom: 18px;
          box-shadow: var(--shadow-danger);
        }

        .feed-error-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 42%);
          pointer-events: none;
        }

        .feed-error-text {
          position: relative;
          margin: 0;
          font-size: 14px;
          font-weight: 750;
          color: var(--danger);
          text-align: center;
        }

        .feed-empty {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 64px 24px;
          gap: 10px;
          border: 1px solid var(--border-soft);
          border-radius: 28px;
          background: var(--surface-glass);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(18px);
        }

        .feed-empty::before {
          content: '';
          position: absolute;
          top: -120px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.18), transparent 68%);
          pointer-events: none;
        }

        .feed-empty-icon {
          position: relative;
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #fff;
          font-size: 22px;
          box-shadow: var(--shadow-amethyst);
        }

        .feed-empty-title {
          position: relative;
          margin: 4px 0 0;
          font-size: 18px;
          font-weight: 400;
          color: var(--text);
          font-family: 'Instrument Serif', serif;
          letter-spacing: -0.01em;
          text-align: center;
        }

        .feed-empty-sub {
          position: relative;
          max-width: 340px;
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.65;
        }

        .feed-posts-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feed-posts-list > * {
          transition:
            transform 190ms var(--ease-premium),
            filter 190ms ease;
        }

        .feed-posts-list > *:hover {
          transform: translateY(-2px);
        }

        .feed-loader {
          padding: 20px 0 44px;
        }

        .feed-end-text {
          position: relative;
          width: fit-content;
          margin: 0 auto;
          padding: 14px 18px;
          border: 1px solid var(--border-soft);
          border-radius: 999px;
          background: var(--surface-glass);
          box-shadow: var(--shadow-xs);
          color: var(--amethyst);
          text-align: center;
          font-size: 12.5px;
          font-weight: 850;
          letter-spacing: 0.04em;
          backdrop-filter: blur(14px);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes feedFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 760px) {
          .feed-header {
            margin-bottom: 16px;
          }

          .feed-tabs {
            top: 12px;
            border-radius: 20px;
          }

          .feed-tab {
            min-height: 42px;
          }
        }
      `}</style>

      <div className="feed-page">
        <header className="feed-header">
          <p className="feed-kicker">Moment</p>
          <h1 className="feed-title">O que está fazendo no momento?</h1>
          <p className="feed-subtitle">
            Compartilhe pequenos recortes do dia, sem barulho, sem disputa e sem pressa.
          </p>
        </header>

        <div className="feed-tabs" role="tablist" aria-label="Tipo de feed">
          <button
            type="button"
            className={`feed-tab${feedType === 'global' ? ' active' : ''}`}
            onClick={() => setFeedType('global')}
            aria-selected={feedType === 'global'}
          >
            Para você
          </button>
          <button
            type="button"
            className={`feed-tab${feedType === 'following' ? ' active' : ''}`}
            onClick={() => setFeedType('following')}
            aria-selected={feedType === 'following'}
          >
            Seguindo
          </button>
        </div>

        <div className="feed-composer-wrap">
          <CreatePost />
        </div>

        {isLoading && (
          <div className="feed-center">
            <div className="feed-spinner" />
            <p className="feed-loading-text">Carregando momentos...</p>
          </div>
        )}

        {isError && (
          <div className="feed-error-box">
            <p className="feed-error-text">Não foi possível carregar o feed. Tente novamente.</p>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="feed-empty">
            <span className="feed-empty-icon">✦</span>
            <p className="feed-empty-title">
              {feedType === 'following'
                ? 'Nenhum momento por aqui ainda.'
                : 'O feed está quieto por agora.'}
            </p>
            <p className="feed-empty-sub">
              {feedType === 'following'
                ? 'Siga pessoas para ver os momentos delas aqui, em um espaço mais leve.'
                : 'Seja o primeiro a compartilhar um pequeno momento do seu dia.'}
            </p>
          </div>
        )}

        <div className="feed-posts-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likesCount={post._count.likes}
              remontsCount={post._count.remonts}
              liked={false}
              remonted={false}
            />
          ))}
        </div>

        <div ref={loaderRef} className="feed-loader">
          {isFetchingNextPage && (
            <div className="feed-center">
              <div className="feed-spinner" />
            </div>
          )}
          {!hasNextPage && posts.length > 0 && (
            <p className="feed-end-text">Você viu todos os momentos</p>
          )}
        </div>
      </div>
    </>
  );
}
