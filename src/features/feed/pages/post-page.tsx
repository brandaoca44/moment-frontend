import { useState } from 'react';
import { ReportButton } from '@/features/reports/report-button';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReply, deleteReply, getPost, getReplies } from '../api/feed';
import { useMe } from '@/features/auth/hooks/use-me';
import { PostCard } from '../components/post-card';
import { ReplyLikeButton } from '../components/reply-like-button';
import './post-page.css';

export function PostPage() {
  const { id = '' } = useParams();
  const client = useQueryClient();
  const me = useMe().data?.data?.user;
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const postQuery = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) });
  const post = postQuery.isError ? undefined : postQuery.data?.data;
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
  });
  const remove = useMutation({ mutationFn: (replyId: string) => deleteReply(id, replyId), onSuccess: refresh });

  return <section className="conversation">
    <Link to="/">Voltar ao Início</Link>
    <h1>Conversa</h1>
    {postQuery.isPending && <p role="status">Carregando momento...</p>}
    {postQuery.isError && <p role="alert">Não foi possível abrir este momento. Ele pode ter sido excluído ou estar indisponível. <button onClick={() => postQuery.refetch()}>Tentar novamente</button></p>}
    {post && <>
      <PostCard key={post.id} post={post} likesCount={post._count.likes} remontsCount={post._count.remonts} repliesCount={post._count.replies} liked={post.liked ?? false} remonted={post.remonted ?? false} />
      <form className="reply-composer" onSubmit={event => { event.preventDefault(); if (text.trim() && text.length <= 220 && !send.isPending) send.mutate(); }}>
        <label htmlFor="reply-text">Responder ao momento</label>
        <textarea id="reply-text" value={text} onChange={event => { setText(event.target.value); setMessage(''); }} maxLength={220} disabled={send.isPending} placeholder="Puxe uma conversa..." />
        <div className="reply-controls"><small>{text.length}/220</small><button disabled={send.isPending || !text.trim()}>{send.isPending ? 'Enviando...' : 'Responder'}</button></div>
        {send.isError && <p role="alert">{send.error.message}</p>}
        {message && <p role="status">{message}</p>}
      </form>
      <h2>Respostas</h2>
      {replies.isPending && <p role="status">Carregando respostas...</p>}
      {replies.isError && <p role="alert">Não foi possível carregar as respostas. <button onClick={() => replies.refetch()}>Tentar novamente</button></p>}
      {remove.isError && <p role="alert">{remove.error.message}</p>}
      {replies.data?.pages.flatMap(page => page.data).map(reply => <article className="reply-card" key={reply.id}>
        <header><Link to={`/profile/${encodeURIComponent(reply.user.username)}`}><strong>{reply.user.name}</strong> @{reply.user.username}</Link><time dateTime={reply.createdAt}>{new Date(reply.createdAt).toLocaleString('pt-BR')}</time></header>
        <p>{reply.content}</p>
        <div className="reply-actions">
        <ReplyLikeButton postId={id} reply={reply} />
        {me?.id !== reply.user.id && <ReportButton targetType="REPLY" targetId={reply.id} />}
        {(me?.id === reply.user.id || me?.id === post.user.id) && <button type="button" disabled={remove.isPending} onClick={() => { if (window.confirm('Excluir esta resposta? Essa ação não pode ser desfeita.')) remove.mutate(reply.id); }}>Excluir resposta</button>}
        </div>
      </article>)}
      {replies.data?.pages[0]?.data.length === 0 && <p>Seja a primeira pessoa a responder.</p>}
      {replies.hasNextPage && <button disabled={replies.isFetchingNextPage} onClick={() => replies.fetchNextPage()}>{replies.isFetchingNextPage ? 'Carregando...' : 'Ver mais respostas'}</button>}
    </>}
  </section>;
}
