import { relativeTime } from '@/i18n';
import { getLanguage } from '@/i18n';
import { t, useLanguage } from '@/i18n';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { EmojiText } from '@/components/ui/emoji-text';
import { ReportButton } from '@/features/reports/report-button';
import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePost, setPostComments } from '../api/feed';

import { ExpandableImage } from '@/components/ui/expandable-image';

import type { Post } from '../api/feed';

import { useToggleLike } from '../hooks/use-toggle-like';

import { useToggleRemont } from '../hooks/use-toggle-remont';

import { useDeletePost } from '../hooks/use-delete-post';

import { useMe } from '@/features/auth/hooks/use-me';



function timeAgo(value: string) { return relativeTime(value); }

function Avatar({ name, avatar, size = 42 }: { name: string; avatar: string | null; size?: number }) {
  useLanguage();

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

      <EmojiText key={i} text={part} />

    )

  );

}



type Props = {
  recommended?: boolean;

  post: Pick<Post, 'id' | 'content' | 'imageUrl' | 'createdAt' | 'editedAt' | 'user' | 'source' | 'commentsEnabled'>;

  repliesCount?: number;
  likesCount: number;

  remontsCount: number;

  liked: boolean;

  remonted: boolean;

  pinned?: boolean;

  onTogglePin?: () => void;

  pinPending?: boolean;

};



export function PostCard({ post, repliesCount = 0, likesCount, remontsCount, liked, remonted, pinned = false, onTogglePin, pinPending = false, recommended = false }: Props) {
  useLanguage();

  const { data: meData } = useMe();

  const toggleLike = useToggleLike();

  const toggleRemont = useToggleRemont();

  const deletePost = useDeletePost();

  const [isHoveringLike, setIsHoveringLike] = useState(false);

  const [isHoveringRemont, setIsHoveringRemont] = useState(false);

  const [localLiked, setLocalLiked] = useState(liked);

  const [localRemonted, setLocalRemonted] = useState(remonted);

  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const [localRemontsCount, setLocalRemontsCount] = useState(remontsCount);



  const queryClient = useQueryClient();
  const dismiss = useMutation({ mutationFn: () => api(`/recommendations/dismiss/${encodeURIComponent(post.id)}`, { method: 'POST' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed', 'global'] }) });
  const comments = useMutation({
    mutationFn: () => setPostComments(post.id, !post.commentsEnabled),
    onSuccess: async response => {
      const keys = ['feed', 'user-posts', 'profile-posts', 'explore', 'post'];
      await Promise.all(keys.map(key => queryClient.cancelQueries({ queryKey: [key] })));
      const patch = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(patch);
        if (!value || typeof value !== 'object') return value;
        const record = value as Record<string, unknown>;
        if (record.id === post.id && typeof record.content === 'string') return { ...record, commentsEnabled: response.data.commentsEnabled };
        return Object.fromEntries(Object.entries(record).map(([key, child]) => [key, ['pages', 'data', 'posts'].includes(key) ? patch(child) : child]));
      };
      for (const key of keys) queryClient.setQueriesData({ queryKey: [key] }, patch);
      await Promise.all(keys.map(key => queryClient.invalidateQueries({ queryKey: [key] })));
    },
  });

  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState(post.content);

  const [saved, setSaved] = useState<{ content: string; editedAt?: string | null } | null>(null);

  const edit = useMutation({

    mutationFn: () => updatePost(post.id, draft.trim()),

    onSuccess: (response) => {

      setSaved(response.data);

      setEditing(false);

      for (const key of ['feed', 'user-posts', 'profile-posts', 'profile', 'explore', 'post']) {

        void queryClient.invalidateQueries({ queryKey: [key] });

      }

    },

  });

  const displayed = saved ?? post;



  const isOwn = meData?.data?.user?.id === post.user.id;



  const handleDelete = () => {

    if (deletePost.isPending) return;

    if (!window.confirm(t("Excluir este post? Essa ação não pode ser desfeita."))) return;

    deletePost.mutate(post.id);

  };



  const handleLike = () => {

    if (toggleLike.isPending) return;



    const previousLiked = localLiked;

    const previousCount = localLikesCount;



    setLocalLiked(!previousLiked);

    setLocalLikesCount(Math.max(0, previousCount + (previousLiked ? -1 : 1)));



    toggleLike.mutate(post.id, {

      onSuccess: (result) => {

        setLocalLiked(result.data.liked);

        setLocalLikesCount(result.data.likesCount);

      },

      onError: () => {

        setLocalLiked(previousLiked);

        setLocalLikesCount(previousCount);

      },

    });

  };



  const handleRemont = () => {

    if (toggleRemont.isPending) return;

    if (isOwn && !localRemonted) {

      window.alert(t("Você não pode republicar sua própria publicação."));

      return;

    }

    if (!localRemonted && !window.confirm(t("Republicar este momento no seu perfil?"))) {

      return;

    }



    const previousRemonted = localRemonted;

    const previousCount = localRemontsCount;



    setLocalRemonted(!previousRemonted);

    setLocalRemontsCount(

      Math.max(0, previousCount + (previousRemonted ? -1 : 1)),

    );



    toggleRemont.mutate(post.id, {

      onSuccess: (result) => {

        setLocalRemonted(result.data.remonted);

        setLocalRemontsCount(result.data.remontsCount);

      },

      onError: (error) => {

        setLocalRemonted(previousRemonted);

        setLocalRemontsCount(previousCount);

        window.alert(error instanceof Error ? error.message : t("Não foi possível republicar esta publicação."));

      },

    });

  };



  return (

    <>

      <style>{`

        .post-edit-text { width: 100%; min-height: 110px; box-sizing: border-box; resize: vertical; padding: 10px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); color: var(--text); font: inherit; }

        .post-edit-controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }

        .post-edit-error { color: var(--danger); overflow-wrap: anywhere; }

        .post-card {

          width: 100%;

          min-width: 0;

          max-width: 100%;

          background: var(--surface);

          border: 1px solid var(--border);

          border-radius: 20px;

          padding: 16px 18px;

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



        .post-header-actions {

          display: flex;

          flex-wrap: wrap;

          max-width: 100%;

          align-items: center;

          gap: 8px;

        }



        .post-delete-btn {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 30px;

          height: 30px;

          padding: 0;

          border: 0;

          border-radius: 10px;

          background: transparent;

          color: var(--text-muted);

          cursor: pointer;

        }



        .post-delete-btn:hover:not(:disabled) {

          background: var(--danger-bg);

          color: var(--danger);

        }



        .post-user-info { display: flex; min-width: 0; max-width: 100%; align-items: center; gap: 6px; flex-wrap: wrap; overflow-wrap: anywhere; }



        .post-name {

          font-size: 15px;

          font-weight: 700;

          color: var(--text);

          font-family: var(--font-ui);

        }



        .post-username {

          font-size: 14px;

          color: var(--text-muted);

          font-family: var(--font-ui);

        }



        .post-dot { color: var(--border); font-size: 14px; }



        .post-time {

          font-size: 13px;

          color: var(--text-muted);

          font-family: var(--font-ui);

        }



        .post-own-badge {

          font-size: 11px;

          font-weight: 600;

          color: var(--amethyst);

          background: var(--amethyst-bg);

          border-radius: 100px;

          padding: 2px 10px;

          font-family: var(--font-ui);

        }



        .post-text {

          margin: 0 0 12px;

          font-size: 15px;

          color: var(--text-soft);

          line-height: 1.65;

          font-family: var(--font-ui);

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



        .post-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }



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

          font-family: var(--font-ui);

          transition: all 0.15s ease;

          background: transparent;

          color: var(--text-muted);

        }



        .post-action-btn.post-like-active {

          color: #ff1493;

          background: rgba(255, 20, 147, 0.10);

        }



        .post-action-btn.post-remont-active {

          color: var(--amethyst);

          background: var(--amethyst-bg);

        }



        .post-like-icon.post-like-pop {

          animation: postLikePop 280ms var(--ease-premium);

        }



        .post-like-icon.post-like-liked {

          fill: #ff1493;

          stroke: #ff1493;

        }



        @keyframes postLikePop {

          0% { transform: scale(0.78); }

          65% { transform: scale(1.18); }

          100% { transform: scale(1); }

        }



        @media (max-width: 520px) {

          .post-card {

            padding: 16px;

            border-radius: 16px;

          }



          .post-card-inner {

            gap: 10px;

          }



          .post-action-btn {

            gap: 4px;

            padding: 6px 9px;

            font-size: 13px;

          }

        }

      `}</style>



      <article className="post-card">

        <div className="post-card-inner">

          <Link to={`/profile/${encodeURIComponent(post.user.username)}`} aria-label={`${t("Ver perfil de")} ${post.user.name}`} style={{ flexShrink: 0, alignSelf: 'flex-start', textDecoration: 'none' }}>
            <Avatar name={post.user.name} avatar={post.user.avatar} />
          </Link>



          <div className="post-content-wrap">

            <div className={`post-header${!isOwn ? ' post-header-with-menu' : ''}`}>

              <div className="post-user-info">

                <Link className="post-name" style={{ textDecoration: 'none' }} to={`/profile/${encodeURIComponent(post.user.username)}`}>{post.user.name}</Link>

                <Link className="post-username" style={{ textDecoration: 'none' }} to={`/profile/${encodeURIComponent(post.user.username)}`}>@{post.user.username}</Link>

                <span className="post-dot">·</span>

                <span className="post-time">{timeAgo(post.createdAt)}</span>
                {post.source && <span className="post-time" title={t("Identificação aproximada informada pelo navegador")}> · {post.source === 'Moment for Android' ? t("Enviado por Android") : post.source === 'Moment for iPhone' ? t("Enviado por iPhone") : post.source === 'Moment Desktop' ? t("Enviado por computador") : t("Enviado pela web")}</span>}

                {displayed.editedAt && <span className="post-time" title={`${t("Editado em")} ${new Date(displayed.editedAt).toLocaleString(getLanguage())}`}>{t("· Editado")}</span>}

              </div>

              <div className="post-header-actions">
                {!isOwn && <ReportButton targetType="POST" targetId={post.id} authorId={post.user.id} menuActions={recommended ? [{ label: t('Não tenho interesse'), disabled: dismiss.isPending, onSelect: () => dismiss.mutate() }] : []} />}
                {dismiss.isError && <small role="alert">{t('Não foi possível salvar. Tente novamente.')}</small>}
                {isOwn && <ReportButton targetType="POST" targetId={post.id} canReport={false} menuActions={[{ label: comments.isPending ? t("Salvando…") : post.commentsEnabled ? t("Desativar comentários") : t("Ativar comentários"), disabled: comments.isPending, onSelect: () => comments.mutate() }]} />}

                {isOwn && <span className="post-own-badge">{t("seu post")}</span>}

                {isOwn && <button type="button" className="post-action-btn" disabled={edit.isPending} onClick={() => { setDraft(displayed.content); edit.reset(); setEditing(true); }}>{t("Editar")}</button>}

                {isOwn && (

                  <button

                    type="button"

                    className="post-delete-btn"

                    onClick={handleDelete}

                    disabled={deletePost.isPending}

                    title={t("Excluir post")}

                    aria-label={t("Excluir post")}

                  >

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">

                      <path d="M3 6h18" />

                      <path d="M8 6V4h8v2" />

                      <path d="M19 6l-1 15H6L5 6" />

                      <path d="M10 11v6M14 11v6" />

                    </svg>

                  </button>

                )}

                {isOwn && onTogglePin && (

                  <button

                    type="button"

                    className="post-delete-btn"

                    onClick={onTogglePin}

                    disabled={pinPending}

                    title={pinned ? t("Desfixar post") : t("Fixar no perfil")}

                    aria-label={pinned ? t("Desfixar post") : t("Fixar no perfil")}

                    style={{ color: pinned ? '#eab308' : 'var(--text-muted)' }}

                  >

                    <svg width="16" height="16" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">

                      <path d="M5 3v18l7-4 7 4V3z" />

                    </svg>

                  </button>

                )}

              </div>

            </div>



            {comments.isError && <p role="alert" className="post-edit-error">{t(comments.error.message)}</p>}
            {comments.isSuccess && <p role="status" className="post-time">{post.commentsEnabled ? t("Comentários ativados.") : t("Comentários desativados.")}</p>}
            {editing ? <form onSubmit={(event) => { event.preventDefault(); if (draft.trim() && draft.length <= 220 && !edit.isPending) edit.mutate(); }}>

              <textarea className="post-edit-text" aria-label={t("Editar momento")} value={draft} maxLength={220} disabled={edit.isPending} onChange={event => setDraft(event.target.value)} autoFocus />

              <div className="post-edit-controls">

                <small>{draft.length}/220</small>

                <button type="submit" disabled={edit.isPending || !draft.trim() || draft.trim() === displayed.content}>{edit.isPending ? t("Salvando...") : t("Salvar")}</button>

                <button type="button" disabled={edit.isPending} onClick={() => setEditing(false)}>{t("Cancelar")}</button>

              </div>

              {edit.isError && <p role="alert" className="post-edit-error">{t(edit.error.message)}</p>}

            </form> : <p className="post-text">{renderContent(displayed.content)}</p>}



            {post.imageUrl && (

              <div className="post-image-wrap">

                <ExpandableImage src={post.imageUrl} alt={t("Imagem do momento")} className="post-image" />

              </div>

            )}



            <div className="post-actions">


              <button

                className={`post-action-btn${localLiked ? ' post-like-active' : ''}`}

                style={{

                  color: localLiked ? '#ff1493' : 'var(--text-muted)',

                  background: isHoveringLike ? 'rgba(255,20,147,0.10)' : 'transparent',

                }}

                onMouseEnter={() => setIsHoveringLike(true)}

                onMouseLeave={() => setIsHoveringLike(false)}

                onClick={handleLike}

                disabled={toggleLike.isPending}

                title={localLiked ? t("Descurtir") : t("Curtir")}

                aria-label={localLiked ? t("Descurtir") : t("Curtir")}

                aria-pressed={localLiked}

              >

                <svg className={`post-like-icon${localLiked ? ' post-like-liked post-like-pop' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill={localLiked ? '#ff1493' : 'none'} stroke={localLiked ? '#ff1493' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />

                </svg>

                <span>{localLikesCount}</span>

              </button>

              <Link className="post-action-btn" style={{ textDecoration: 'none' }} to={`/posts/${post.id}`} aria-label={`Responder, ${repliesCount} respostas`} title={t("Responder")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 3V11.5a10 10 0 0 1 20 0Z" /></svg>
                <span>{repliesCount}</span>
              </Link>



              <button

                className={`post-action-btn${localRemonted ? ' post-remont-active' : ''}`}

                style={{

                  color: localRemonted ? 'var(--amethyst)' : 'var(--text-muted)',

                  background: isHoveringRemont ? 'var(--amethyst-bg)' : 'transparent',

                }}

                onMouseEnter={() => setIsHoveringRemont(true)}

                onMouseLeave={() => setIsHoveringRemont(false)}

                onClick={handleRemont}

                disabled={toggleRemont.isPending}

                title={localRemonted ? t("Desfazer republicação") : t("Republicar")}

                aria-label={localRemonted ? t("Desfazer republicação") : t("Republicar")}

              >

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                  <polyline points="17 1 21 5 17 9" />

                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />

                  <polyline points="7 23 3 19 7 15" />

                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />

                </svg>

                <span>{localRemontsCount}</span>

              </button>

            </div>

          </div>

        </div>

      </article>

    </>

  );

}
