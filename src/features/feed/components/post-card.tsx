import { useState } from 'react';
import type { Post } from '../api/feed';
import { useToggleLike } from '../hooks/use-toggle-like';
import { useToggleRemont } from '../hooks/use-toggle-remont';
import { useMe } from '@/features/auth/hooks/use-me';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function Avatar({ name, avatar, size = 42 }: { name: string; avatar: string | null; size?: number }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: avatar ? 'transparent' : 'linear-gradient(135deg, var(--amethyst), var(--amethyst-light))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      border: '2px solid var(--amethyst-border)',
    }}>
      {avatar ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#fff', fontSize: size * 0.35, fontWeight: 700 }}>{initials}</span>
      )}
    </div>
  );
}

function renderContent(content: string) {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} style={{ color: 'var(--amethyst)', fontWeight: 600 }}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

type Props = {
  post: Post;
  likesCount: number;
  remontsCount: number;
  liked: boolean;
  remonted: boolean;
};

export function PostCard({ post, likesCount, remontsCount, liked, remonted }: Props) {
  const { data: meData } = useMe();
  const toggleLike = useToggleLike();
  const toggleRemont = useToggleRemont();
  const [isHoveringLike, setIsHoveringLike] = useState(false);
  const [isHoveringRemont, setIsHoveringRemont] = useState(false);

  const isOwn = meData?.data?.user?.id === post.user.id;

  return (
    <>
      <style>{`
        .post-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px 22px;
          transition: box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .post-card:hover {
          box-shadow: 0 4px 20px rgba(124,58,237,0.08);
        }

        .post-card-inner { display: flex; gap: 14px; }
        .post-content-wrap { flex: 1; min-width: 0; }

        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 4px;
        }

        .post-user-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

        .post-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
        }

        .post-username {
          font-size: 14px;
          color: var(--text-muted);
          font-family: 'DM Sans', sans-serif;
        }

        .post-dot { color: var(--border); font-size: 14px; }

        .post-time {
          font-size: 13px;
          color: var(--text-muted);
          font-family: 'DM Sans', sans-serif;
        }

        .post-own-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--amethyst);
          background: var(--amethyst-bg);
          border-radius: 100px;
          padding: 2px 10px;
          font-family: 'DM Sans', sans-serif;
        }

        .post-text {
          margin: 0 0 12px;
          font-size: 15px;
          color: var(--text-soft);
          line-height: 1.65;
          font-family: 'DM Sans', sans-serif;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .post-image-wrap {
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid var(--border);
        }

        .post-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }

        .post-actions { display: flex; gap: 8px; margin-top: 4px; }

        .post-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          background: transparent;
          color: var(--text-muted);
        }
      `}</style>

      <article className="post-card">
        <div className="post-card-inner">
          <Avatar name={post.user.name} avatar={post.user.avatar} />

          <div className="post-content-wrap">
            <div className="post-header">
              <div className="post-user-info">
                <span className="post-name">{post.user.name}</span>
                <span className="post-username">@{post.user.username}</span>
                <span className="post-dot">·</span>
                <span className="post-time">{timeAgo(post.createdAt)}</span>
              </div>
              {isOwn && <span className="post-own-badge">seu post</span>}
            </div>

            <p className="post-text">{renderContent(post.content)}</p>

            {post.imageUrl && (
              <div className="post-image-wrap">
                <img src={post.imageUrl} alt="imagem do post" className="post-image" />
              </div>
            )}

            <div className="post-actions">
              <button
                className="post-action-btn"
                style={{
                  color: liked ? '#e11d48' : 'var(--text-muted)',
                  background: isHoveringLike ? 'rgba(225,29,72,0.07)' : 'transparent',
                }}
                onMouseEnter={() => setIsHoveringLike(true)}
                onMouseLeave={() => setIsHoveringLike(false)}
                onClick={() => toggleLike.mutate(post.id)}
                disabled={toggleLike.isPending}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#e11d48' : 'none'} stroke={liked ? '#e11d48' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{likesCount}</span>
              </button>

              <button
                className="post-action-btn"
                style={{
                  color: remonted ? 'var(--amethyst)' : 'var(--text-muted)',
                  background: isHoveringRemont ? 'var(--amethyst-bg)' : 'transparent',
                }}
                onMouseEnter={() => setIsHoveringRemont(true)}
                onMouseLeave={() => setIsHoveringRemont(false)}
                onClick={() => toggleRemont.mutate(post.id)}
                disabled={toggleRemont.isPending}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span>{remontsCount}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
