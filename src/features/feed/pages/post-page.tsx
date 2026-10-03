import { relativeTime } from '@/i18n';
import { getLanguage } from '@/i18n';
import { t, useLanguage } from '@/i18n';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, MessageCircle, X } from 'lucide-react';
import { EmojiText } from '@/components/ui/emoji-text';
import { ReportButton } from '@/features/reports/report-button';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReply, deleteReply, getPost, getReplies, type Reply, type RemovedContent } from '../api/feed';
import { useMe } from '@/features/auth/hooks/use-me';
import { PostCard } from '../components/post-card';
import { ReplyLikeButton } from '../components/reply-like-button';
import './post-page.css';

function ReplyAvatar({ name, avatar }: { name?: string; avatar?: string | null }) {
  useLanguage();
  return avatar ? <img className="conversation-avatar" src={avatar} alt="" /> : <span className="conversation-avatar conversation-avatar-fallback" aria-hidden="true">{name?.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'M'}</span>;
}
function ReplyTime({ date }: { date: string }) {
  useLanguage();
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(timer); }, []);
  const label = relativeTime(date, now);
  const full = new Date(date).toLocaleString(getLanguage());
  return <time dateTime={date} title={full} aria-label={full} tabIndex={0}>{label}</time>;
}

type ReplyCardProps = { reply: Reply | RemovedContent; postId: string; ownerId: string; viewerId?: string; onReply?: (reply: Reply) => void; remove: (id: string) => void; removing: boolean; children?: ReactNode };
function FeedReplyCard({ reply, postId, ownerId, viewerId, onReply, remove, removing, children }: ReplyCardProps) {
  if ('removed' in reply) return <article className="reply-removed"><p>{t(reply.message)}</p></article>;
  return <article className="reply-card">
    <Link className="reply-avatar-link" to={`/profile/${encodeURIComponent(reply.user.username)}`} aria-label={`${t('Ver perfil de')} ${reply.user.name}`}><ReplyAvatar name={reply.user.name} avatar={reply.user.avatar} /></Link>
    <div className="reply-body">
      <header><div className="reply-identity"><Link to={`/profile/${encodeURIComponent(reply.user.username)}`} className="reply-author"><strong>{reply.user.name}</strong><span>@{reply.user.username}</span></Link><span className="reply-time-divider" aria-hidden="true">·</span><ReplyTime date={reply.createdAt} /></div>
        <ReportButton targetType="REPLY" targetId={reply.id} authorId={reply.user.id} canReport={viewerId !== reply.user.id} deletePending={removing} onDelete={viewerId === reply.user.id || viewerId === ownerId ? () => { if (window.confirm(t('Excluir esta resposta? Essa ação não pode ser desfeita.'))) remove(reply.id); } : undefined} />
      </header>
      {reply.replyToName && <p className="reply-context">{t('Respondendo a {name}', { name: reply.replyToName })}</p>}
      <p className="reply-text"><EmojiText text={reply.content} /></p>
      <div className="reply-actions"><ReplyLikeButton postId={postId} reply={reply} />{onReply && <button className="reply-respond" onClick={() => onReply(reply)}><MessageCircle size={14} aria-hidden="true" />{t('Responder')}</button>}</div>
      {children}
    </div>
  </article>;
}
function FeedReplyThread(props: ReplyCardProps & { commentsEnabled: boolean; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Reply | null>(null);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const threadId = useId();
  const client = useQueryClient();
  const children = useInfiniteQuery({
    queryKey: ['replies', props.postId, 'thread', props.reply.id],
    queryFn: ({ pageParam }) => getReplies(props.postId, pageParam, props.reply.id),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta.hasMore ? page.meta.nextCursor ?? undefined : undefined,
    enabled: open && !('removed' in props.reply),
  });
  useEffect(() => { if (target && open) input.current?.focus(); }, [target, open]);
  const send = useMutation({ mutationFn: () => createReply(props.postId, text.trim(), target!.id),
    onSuccess: async result => { setTarget(null); setText(''); setNotice(t(result.message)); await props.refresh(); },
    onError: () => { void client.invalidateQueries({ queryKey: ['post', props.postId] }); },
  });
  function respond(reply: Reply) { setTarget(reply); setOpen(true); setNotice(''); send.reset(); }
  const count = 'removed' in props.reply ? 0 : props.reply.repliesCount ?? 0;
  return <FeedReplyCard {...props} onReply={props.commentsEnabled ? respond : undefined}>
    {(count > 0 || open) && <button className="reply-thread-toggle" aria-expanded={open} aria-controls={threadId} onClick={() => setOpen(!open)}><ChevronDown size={14} aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : undefined }} />{open ? t('Recolher respostas') : t('Ver {count} respostas', { count })}</button>}
    {open && <div className="reply-thread" id={threadId}>
      {children.isPending && <p role="status">{t('Carregando respostas...')}</p>}
      {children.isError ? <p role="alert">{t('Não foi possível carregar as respostas.')} <button className="reply-thread-toggle" onClick={() => children.refetch()}>{t('Tentar novamente')}</button></p> : children.data?.pages.flatMap(page => page.data).map(reply => <FeedReplyCard {...props} key={reply.id} reply={reply} onReply={props.commentsEnabled ? respond : undefined} />)}
      {children.hasNextPage && <button className="reply-thread-toggle" disabled={children.isFetchingNextPage} onClick={() => children.fetchNextPage()}>{t('Ver mais respostas')}</button>}
      {target && props.commentsEnabled && <form className="reply-inline-composer" onSubmit={event => { event.preventDefault(); if (text.trim() && text.length <= 220 && !send.isPending) send.mutate(); }}>
        <div className="reply-context"><label htmlFor={inputId}>{t('Respondendo a {name}', { name: `@${target.user.username}` })}</label><button type="button" disabled={send.isPending} aria-label={t('Cancelar')} onClick={() => { setTarget(null); setText(''); }}><X size={16} /></button></div>
        <textarea id={inputId} ref={input} rows={2} maxLength={220} value={text} disabled={send.isPending} onChange={event => setText(event.target.value)} placeholder={t('Escreva uma resposta…')} />
        <div className="reply-controls"><small>{text.length}/220</small><button className="reply-submit" disabled={send.isPending || !text.trim()}>{send.isPending ? t('Enviando…') : t('Responder')}</button></div>
        {send.isError && <p role="alert">{t(send.error.message)}</p>}
      </form>}
      {notice && <p role="status">{notice}</p>}
    </div>}
  </FeedReplyCard>;
}

export function PostPage() {
  useLanguage();
  const { id = '' } = useParams();
  const client = useQueryClient();
  const me = useMe().data?.data?.user;
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = 'auto';
    textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 200)}px`;
  }, [text]);
  const postQuery = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) });
  const result = postQuery.isError ? undefined : postQuery.data?.data;
  const post = result && !('removed' in result) ? result : undefined;
  const replies = useInfiniteQuery({
    queryKey: ['replies', id], queryFn: ({ pageParam }) => getReplies(id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta.hasMore ? page.meta.nextCursor ?? undefined : undefined,
    enabled: !!post,
  });
  async function refresh() {
    await Promise.all(['post', 'replies', 'feed', 'user-posts', 'explore', 'notifications'].map(key => client.invalidateQueries({ queryKey: [key] })));
  }
  const send = useMutation({
    mutationFn: () => createReply(id, text.trim()),
    onSuccess: async result => { setText(''); setMessage(result.message); await refresh(); },
    onError: () => { void client.invalidateQueries({ queryKey: ['post', id] }); },
  });
  const remove = useMutation({ mutationFn: (replyId: string) => deleteReply(id, replyId), onSuccess: refresh });

  return <section className="conversation">
    <header className="conversation-heading"><Link to="/" aria-label={t("Voltar ao Início")} className="conversation-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14" /></svg></Link><h1>{t("Conversa")}</h1></header>
    {result && 'removed' in result && <p role="status">{t(result.message)}</p>}
    {postQuery.isPending && <p role="status">{t("Carregando momento...")}</p>}
    {postQuery.isError && <p role="alert">{t("Não foi possível abrir este momento. Ele pode ter sido excluído ou estar indisponível. ")}<button onClick={() => postQuery.refetch()}>{t("Tentar novamente")}</button></p>}
    {post && <>
      <PostCard key={post.id} post={post} likesCount={post._count.likes} remontsCount={post._count.remonts} repliesCount={post._count.replies} liked={post.liked ?? false} remonted={post.remonted ?? false} />
      {post.commentsEnabled ? <form className="reply-composer" onSubmit={event => { event.preventDefault(); if (post.commentsEnabled && text.trim() && text.length <= 220 && !send.isPending) send.mutate(); }}>
        <ReplyAvatar name={me?.name} avatar={me?.avatar} />
        <div className="reply-compose-body">
        <label className="conversation-sr-only" htmlFor="reply-text">{t("Responder ao momento")}</label>
        <textarea ref={textarea} rows={1} id="reply-text" value={text} onChange={event => { setText(event.target.value); setMessage(''); }} maxLength={220} disabled={send.isPending} placeholder={t("Escreva uma resposta…")} />
        {text.length > 0 && <div className="reply-controls"><small aria-label={t('{count} de 220 caracteres', { count: text.length })}>{text.length}/220</small><button className="reply-submit" disabled={send.isPending || !text.trim()}>{send.isPending ? t("Enviando…") : t("Responder")}</button></div>}
        {send.isError && <p role="alert">{t(send.error.message)}</p>}
        {message && <p role="status">{message}</p>}
        </div>
      </form> : <p className="comments-disabled" role="status">{t("Os comentários desta publicação estão desativados.")}</p>}
      <h2 className="conversation-replies-heading">{t("Respostas")}</h2>
      {replies.isPending && <p role="status">{t("Carregando respostas...")}</p>}
      {replies.isError && <p role="alert">{t("Não foi possível carregar as respostas. ")}<button onClick={() => replies.refetch()}>{t("Tentar novamente")}</button></p>}
      {remove.isError && <p role="alert">{t(remove.error.message)}</p>}
      <div className="conversation-replies">
      {replies.data?.pages.flatMap(page => page.data).map(reply => <FeedReplyThread key={reply.id} reply={reply} postId={id} ownerId={post.user.id} viewerId={me?.id} commentsEnabled={post.commentsEnabled} removing={remove.isPending} remove={replyId => remove.mutate(replyId)} refresh={refresh} />)}
      </div>
      {post.commentsEnabled && replies.data?.pages[0]?.data.length === 0 && <p>{t("Seja a primeira pessoa a responder.")}</p>}
      {replies.hasNextPage && <button disabled={replies.isFetchingNextPage} onClick={() => replies.fetchNextPage()}>{replies.isFetchingNextPage ? t("Carregando...") : t("Ver mais respostas")}</button>}
    </>}
  </section>;
}
