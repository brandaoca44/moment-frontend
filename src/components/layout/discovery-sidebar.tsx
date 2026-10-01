import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Sparkles, Users, ChevronRight, Compass } from 'lucide-react';
import { getSuggestions, type SuggestedUser } from '@/features/explore/api/explore';
import { followUser } from '@/features/profile/api/profile';
import { stations } from '@/features/stations/api';
import { getLanguage, t, useLanguage } from '@/i18n';
import './discovery-sidebar.css';

function SuggestedPerson({ user }: { user: SuggestedUser }) {
  const client = useQueryClient();
  const action = useMutation({ mutationFn: () => followUser(user.id), onSuccess: async () => {
    await Promise.all([client.invalidateQueries({ queryKey: ['explore', 'suggestions'] }), client.invalidateQueries({ queryKey: ['profile'] }), client.invalidateQueries({ queryKey: ['feed'] })]);
  } });
  return <li className="discovery-person"><Link to={`/profile/${encodeURIComponent(user.username)}`} className="discovery-person-link">
    {user.avatar ? <img src={user.avatar} alt="" loading="lazy" /> : <span className="discovery-avatar">{user.name.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('')}</span>}
    <span className="discovery-copy"><strong>{user.name}</strong><small>@{user.username}</small></span></Link>
    <button className="discovery-follow" disabled={action.isPending || action.isSuccess} aria-label={t('Seguir {name}', { name: user.name })} onClick={() => action.mutate()}>{t(action.isSuccess ? 'Seguindo' : 'Seguir')}</button>
    {action.isError && <small className="discovery-error" role="alert">{action.error.message}</small>}
  </li>;
}
export function DiscoverySidebar() {
  useLanguage();
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width:1121px)').matches);
  const [term, setTerm] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const query = window.matchMedia('(min-width:1121px)');
    const change = () => setDesktop(query.matches);
    query.addEventListener('change', change);
    const shortcut = (e: KeyboardEvent) => { if (query.matches && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus(); } };
    window.addEventListener('keydown', shortcut);
    return () => { query.removeEventListener('change', change); window.removeEventListener('keydown', shortcut); };
  }, []);
  const people = useQuery({ queryKey: ['explore', 'suggestions'], queryFn: () => getSuggestions(20), enabled: desktop });
  const discoveries = useQuery({ queryKey: ['stations', 'sidebar'], queryFn: () => stations('discover'), enabled: desktop });
  return <div className="discovery-sidebar">
    <form className="discovery-search" role="search" onSubmit={event => { event.preventDefault(); navigate(`/explore?q=${encodeURIComponent(term.trim())}`); }}><Search size={17} aria-hidden="true" /><input ref={search} value={term} onChange={event => setTerm(event.target.value)} placeholder={t('Buscar momentos e pessoas')} aria-label={t('Buscar momentos e pessoas')} /><kbd aria-hidden="true">Ctrl K</kbd></form>
    <section className="discovery-card" aria-labelledby="discover-stations-title"><header><Sparkles size={18} aria-hidden="true" /><h2 id="discover-stations-title">{t('Estações para descobrir')}</h2></header><p>{t('Encontre pessoas com os mesmos interesses.')}</p>
      {discoveries.isPending ? <p role="status">{t('Carregando...')}</p> : discoveries.isError ? <p role="alert">{t('Não foi possível carregar as sugestões.')} <button className="discovery-retry" onClick={() => discoveries.refetch()}>{t('Tentar novamente')}</button></p> : <ul className="discovery-stations">{discoveries.data.data.slice(0,5).map(station => {
        const count = station.membersCount ?? station._count?.members ?? 0;
        return <li key={station.id}><Link to={`/communities/${encodeURIComponent(station.id)}`}>
          {station.coverUrl ? <img src={station.coverUrl} alt="" loading="lazy" /> : <span className="discovery-station-art"><Compass size={23} /></span>}
          <span className="discovery-copy"><strong>{station.name}</strong><small>{t(station.category)} · {count === 1 ? t('1 membro') : t('{count} membros', { count: new Intl.NumberFormat(getLanguage()).format(count) })}</small></span><ChevronRight size={16} aria-hidden="true" /></Link></li>;
      })}</ul>}
      {discoveries.isSuccess && discoveries.data.data.length === 0 && <p>{t('Nenhuma estação por aqui ainda.')}</p>}
      <Link className="discovery-all" to="/communities">{t('Explorar estações')}<ChevronRight size={14} /></Link>
    </section>
    <section className="discovery-card" aria-labelledby="discover-people-title"><header><Users size={18} aria-hidden="true" /><h2 id="discover-people-title">{t('Sugestões para você')}</h2><Link to="/explore">{t('Ver todos')}</Link></header>
      {people.isPending ? <p role="status">{t('Carregando...')}</p> : people.isError ? <p role="alert">{t('Não foi possível carregar as sugestões.')} <button className="discovery-retry" onClick={() => people.refetch()}>{t('Tentar novamente')}</button></p> : <ul>{people.data.data.slice(0,3).map(user => <SuggestedPerson key={user.id} user={user} />)}</ul>}
      {people.isSuccess && people.data.data.length === 0 && <p>{t('Novas conexões aparecerão aqui.')}</p>}
    </section>
  </div>;
}
