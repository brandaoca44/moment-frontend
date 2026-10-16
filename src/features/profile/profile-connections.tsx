import { useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { StaffBadge } from './staff-badge';
import './profile-connections.css';

type Person={id:string;name:string;username:string;avatar:string|null;staffRole:string};
type Page={data:Person[];meta:{nextCursor:string|null}};
export function ProfileConnections({userId,kind,count}:{userId:string;kind:'followers'|'following';count:string}){
  useLanguage();
  const dialog=useRef<HTMLDialogElement>(null);
  const query=useInfiniteQuery({
    queryKey:['profile-connections',userId,kind],enabled:false,initialPageParam:undefined as string|undefined,
    queryFn:({pageParam})=>api<Page>(`/users/${encodeURIComponent(userId)}/connections?${new URLSearchParams({kind,...(pageParam?{cursor:pageParam}:{})})}`),
    getNextPageParam:page=>page.meta.nextCursor??undefined,
  });
  const title=t(kind==='followers'?'seguidores':'seguindo');
  return <>
    <button className="profile-counter profile-connections-trigger" onClick={()=>{dialog.current?.showModal();void query.refetch();}}><strong>{count}</strong><span>{title}</span></button>
    <dialog className="profile-connections" ref={dialog} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.current?.close();}}} aria-label={title}>
      <header><h2>{title}</h2><button autoFocus type="button" aria-label={t('Fechar')} onClick={()=>dialog.current?.close()}><X size={18}/></button></header>
      {query.isFetching&&!query.data&&<p role="status">{t('Carregando...')}</p>}
      {query.isError&&<p role="alert">{t('Não foi possível carregar a lista.')} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>}
      {query.data&&query.data.pages[0].data.length===0&&<p>{t('Nenhum perfil por aqui ainda.')}</p>}
      <ul>{query.data?.pages.flatMap(page=>page.data).map(person=><li key={person.id}><Link to={`/profile/${encodeURIComponent(person.username)}`} onClick={()=>dialog.current?.close()}><span className="connection-avatar">{person.avatar?<img src={person.avatar} alt=""/>:person.name.slice(0,1).toUpperCase()}</span><span><strong>{person.name}</strong><small>@{person.username}</small></span></Link><StaffBadge role={person.staffRole}/></li>)}</ul>
      {query.hasNextPage&&<button className="connections-more" disabled={query.isFetching} onClick={()=>query.fetchNextPage()}>{t(query.isFetching?'Carregando...':'Ver mais')}</button>}
    </dialog>
  </>;
}
