import { useMemo, useState } from 'react';
import { ReportButton } from '@/features/reports/report-button';
import { useMe } from '@/features/auth/hooks/use-me';
import { ExpandableImage } from '@/components/ui/expandable-image';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getExplorePosts, getSuggestions, type SuggestedUser } from '../api/explore';
import { searchMoment } from '../api/search';
import type { Post } from '@/features/feed/api/feed';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function Avatar({ user, size = 48 }: { user: { name: string; avatar: string | null }; size?: number }) {
  return user.avatar ? <img className="explore-avatar" style={{ width: size, height: size }} src={user.avatar} alt="" /> :
    <div className="explore-avatar explore-avatar-fallback" style={{ width: size, height: size }}>{initials(user.name)}</div>;
}

function UserCard({ user }: { user: SuggestedUser }) {
  return <Link className="explore-user" to={`/profile/${encodeURIComponent(user.username)}`}>
    <Avatar user={user} />
    <span className="explore-user-copy"><strong>{user.name}</strong><small>@{user.username}</small></span>
    <span className="explore-user-count">{user.mutualCount > 0 ? `${user.mutualCount} em comum` : `${user.followersCount} seguidores`}</span>
  </Link>;
}

function PostCard({ post }: { post: Post }) {
  const me = useMe().data?.data.user;
  return <article className="explore-post">
    <Link to={`/profile/${encodeURIComponent(post.user.username)}`} className="explore-post-author">
      <Avatar user={post.user} size={40} />
      <span><strong>{post.user.name}</strong><small>@{post.user.username}</small></span>
    </Link>
    {post.editedAt && <small title={new Date(post.editedAt).toLocaleString("pt-BR")}>Editado</small>}
    <p>{post.content}</p>
    {me?.id !== post.user.id && <ReportButton targetType="POST" targetId={post.id} />}
    {post.imageUrl && <ExpandableImage className="explore-post-image" src={post.imageUrl} alt="Imagem do momento" />}
    <footer><Link to={`/posts/${post.id}`}>Responder ({post._count.replies ?? 0})</Link><span>{post._count.likes} {post._count.likes === 1 ? 'curtida' : 'curtidas'}</span><span>{post._count.remonts} {post._count.remonts === 1 ? 'republicação' : 'republicações'}</span></footer>
  </article>;
}

export function ExplorePage() {
  const [term, setTerm] = useState('');
  const suggestions = useQuery({ queryKey: ['explore', 'suggestions'], queryFn: () => getSuggestions(20) });
  const posts = useQuery({ queryKey: ['explore', 'posts'], queryFn: getExplorePosts });
  const normalized = term.trim().toLowerCase();
  const isSearching = normalized.length >= 2;
  const searchQuery = useQuery({
    queryKey: ['explore', 'search', normalized],
    queryFn: () => searchMoment(normalized, 20),
    enabled: isSearching,
    staleTime: 15_000,
  });
  const users = useMemo<SuggestedUser[]>(() => isSearching
    ? (searchQuery.data?.users ?? []).map(user => ({ ...user, followersCount: 0, mutualCount: 0 }))
    : (suggestions.data?.data ?? []), [normalized, searchQuery.data, suggestions.data]);
  const publications = useMemo(() => isSearching ? (searchQuery.data?.posts ?? []) : (posts.data?.data ?? []), [isSearching, searchQuery.data, posts.data]);

  return <>
    <style>{`.explore-page{max-width:760px;margin:0 auto;font-family:'Inter',sans-serif}.explore-header{margin-bottom:20px}.explore-eyebrow{margin:0 0 5px;color:var(--amethyst);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.explore-title{margin:0;color:var(--text);font-family:'Instrument Serif',serif;font-size:42px;font-weight:400}.explore-subtitle{margin:8px 0 18px;color:var(--text-muted);font-size:14px}.explore-search{width:100%;box-sizing:border-box;padding:14px 18px;border:1px solid var(--border);border-radius:16px;background:var(--surface);color:var(--text);font:inherit;outline:0}.explore-search:focus{border-color:var(--amethyst);box-shadow:0 0 0 3px var(--amethyst-bg)}.explore-section{margin-top:25px}.explore-section h2{margin:0 0 12px;color:var(--text);font-size:17px}.explore-users{display:grid;gap:8px}.explore-user{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:16px;background:var(--surface);color:var(--text);text-decoration:none}.explore-user:hover{border-color:var(--amethyst-border)}.explore-avatar{flex-shrink:0;border-radius:50%;object-fit:cover}.explore-avatar-fallback{display:grid;place-items:center;background:linear-gradient(135deg,var(--amethyst),var(--amethyst-light));color:#fff;font-weight:800}.explore-user-copy{display:grid;gap:2px;min-width:0}.explore-user-copy strong,.explore-post-author strong{font-size:14px}.explore-user-copy small,.explore-post-author small{color:var(--text-muted);font-size:12px}.explore-user-count{margin-left:auto;color:var(--text-muted);font-size:12px}.explore-posts{display:grid;gap:12px}.explore-post{padding:17px;border:1px solid var(--border);border-radius:18px;background:var(--surface)}.explore-post-author{display:inline-flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}.explore-post-author>span{display:grid;gap:2px}.explore-post p{margin:13px 0;color:var(--text);line-height:1.6;white-space:pre-wrap}.explore-post-image{display:block;width:100%;max-height:360px;object-fit:cover;border-radius:13px}.explore-post footer{display:flex;flex-wrap:wrap;gap:18px;margin-top:13px;color:var(--text-muted);font-size:12px}.explore-empty{padding:28px;border:1px dashed var(--border);border-radius:16px;color:var(--text-muted);text-align:center}.explore-error{color:#b91c1c;font-size:13px}@media(max-width:640px){.explore-title{font-size:36px}.explore-user-count{display:none}}`}</style>
    <section className="explore-page">
      <header className="explore-header"><p className="explore-eyebrow">Descobrir</p><h1 className="explore-title">Explorar</h1><p className="explore-subtitle">Encontre pessoas e momentos que combinam com você.</p><input className="explore-search" value={term} onChange={event => setTerm(event.target.value)} placeholder="Buscar pessoas ou publicações" aria-label="Buscar pessoas ou publicações" /></header>
      <section className="explore-section"><h2>{isSearching ? 'Pessoas encontradas' : 'Pessoas para seguir'}</h2>{(isSearching ? searchQuery.isLoading : suggestions.isLoading) ? <div className="explore-empty">Buscando...</div> : (isSearching ? searchQuery.isError : suggestions.isError) ? <p className="explore-error">Não foi possível realizar a busca agora.</p> : users.length ? <div className="explore-users">{users.map(user => <UserCard key={user.id} user={user} />)}</div> : <div className="explore-empty">{normalized ? 'Digite pelo menos 2 caracteres para buscar.' : 'Nenhuma pessoa encontrada.'}</div>}</section>
      <section className="explore-section"><h2>{isSearching ? 'Resultados nas publicações' : 'Publicações em destaque'}</h2>{(isSearching ? searchQuery.isLoading : posts.isLoading) ? <div className="explore-empty">Buscando...</div> : (isSearching ? searchQuery.isError : posts.isError) ? <p className="explore-error">Não foi possível carregar publicações agora.</p> : publications.length ? <div className="explore-posts">{publications.map(post => <PostCard key={post.id} post={post} />)}</div> : <div className="explore-empty">{normalized ? 'Digite pelo menos 2 caracteres para buscar.' : 'Nenhuma publicação encontrada.'}</div>}</section>
    </section>
  </>;
}
