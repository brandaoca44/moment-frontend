import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useMe } from '@/features/auth/hooks/use-me';
import { t, useLanguage, getLanguage } from '@/i18n';
import './account-decisions.css';

export const sanctionKinds={WARNING:'Advertência',SUSPEND:'Suspensão temporária',BAN:'Banimento',VITRINE:'Restrição da Vitrine',JOBS:'Restrição de Vagas'};
type Decision={id:string;kind:keyof typeof sanctionKinds;reason:string;createdAt:string;expiresAt:string|null;revokedAt:string|null;events?:{note:string;createdAt:string}[];appeal:null|{content:string;status:string;decision:string|null;createdAt:string;reviewedAt:string|null}};
type Access={account:boolean;vitrine:boolean;jobs:boolean};
export function useAccountDecisions(){const me=useMe();return useQuery({queryKey:['account-decisions',me.data?.data?.user?.id],queryFn:()=>api<{data:{decisions:Decision[];access:Access}}>('/sanctions/me'),enabled:!!me.data?.data?.user,staleTime:0,refetchInterval:30000,refetchOnWindowFocus:true});}
function date(value:string){return new Date(value).toLocaleString(getLanguage());}
export function AccountDecisions(){
  useLanguage();const query=useAccountDecisions();
  return <section className="account-decisions"><header><span className="account-decisions-icon"><ShieldCheck size={20}/></span><div><h2>{t('Situação da conta')}</h2><p>{t('Consulte decisões de moderação e solicite uma revisão.')}</p></div></header>
    {query.isPending&&<p role="status">{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t('Não foi possível consultar as decisões.')} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data&&!query.data.data.access.account&&<p className="account-restriction-notice">{t('Seu acesso à rede está restrito. Esta área continua disponível para consultar o motivo e contestar. A restrição independe do plano da conta.')}</p>}
    {query.data?.data.decisions.length===0&&<div className="account-decisions-empty"><ShieldCheck size={22} aria-hidden="true"/><p>{t('Nenhuma decisão registrada na sua conta.')}</p></div>}
    {query.data?.data.decisions.map(row=><DecisionCard key={row.id} row={row}/>)}
    {!!query.data?.data.decisions.length&&<p className="account-decisions-note">{t('A revisão não suspende automaticamente a medida. Conteúdos e registros são preservados. Se outra restrição continuar ativa, o acesso pode permanecer limitado.')}</p>}
    <footer className="account-decisions-footer"><Link to="/support">{t('Suporte')}</Link><Link to="/privacy">{t('Privacidade')}</Link></footer>
  </section>;
}
function DecisionCard({row}:{row:Decision}){
  const client=useQueryClient();const [content,setContent]=useState('');
  const send=useMutation({mutationFn:()=>api(`/sanctions/${encodeURIComponent(row.id)}/appeal`,{method:'POST',body:JSON.stringify({content:content.trim()})}),onSuccess:async()=>{setContent('');await client.invalidateQueries({queryKey:['account-decisions']});}});
  const expired=!!row.expiresAt&&new Date(row.expiresAt).getTime()<=Date.now();
  return <article className="account-decision"><div className="account-decision-heading"><strong>{t(sanctionKinds[row.kind])}</strong><small>{t(row.revokedAt?'Revogada':expired?'Prazo encerrado':row.kind==='WARNING'?'Registrada':'Ativa')}</small></div><time>{date(row.createdAt)}</time><p>{row.reason}</p>{row.expiresAt&&<small>{t('Prazo')}: {date(row.expiresAt)}</small>}
    {row.appeal?<details className="decision-appeal"><summary>{t('Solicitação de revisão')} · {t(({PENDING:'Em análise',UPHELD:'Decisão mantida',REVOKED:'Decisão revogada'} as Record<string,string>)[row.appeal.status]??row.appeal.status)}</summary><p>{row.appeal.content}</p>{row.appeal.decision&&<p>{row.appeal.decision}</p>}</details>:!row.revokedAt&&<details className="decision-appeal"><summary>{t('Contestar decisão')}</summary><form onSubmit={event=>{event.preventDefault();if(content.trim().length>=10&&!send.isPending)send.mutate();}}><label>{t('Explique por que a decisão deve ser revista')}<textarea required minLength={10} maxLength={1500} rows={3} value={content} onChange={event=>setContent(event.target.value)} disabled={send.isPending}/></label><small>{t('Não envie senhas, documentos ou dados bancários.')}</small><button disabled={send.isPending||content.trim().length<10}>{t(send.isPending?'Enviando…':'Solicitar revisão')}</button></form></details>}
    {send.isError&&<p role="alert">{t(send.error.message)}</p>}
    {!row.appeal?.decision&&row.events?.[0]&&<p>{row.events[0].note}</p>}
  </article>;
}
type AdminDecision=Omit<Decision,'events'>&{evidence:string;actorId:string;reportId:string|null;user:{username:string}|null;events:{id:string;action:string;note:string;createdAt:string;actorId:string}[]};
export function SanctionsAdmin(){
  useLanguage();const client=useQueryClient();const [username,setUsername]=useState('');const [filter,setFilter]=useState('');const [pending,setPending]=useState(true);const [cursor,setCursor]=useState<string|undefined>();
  const params=new URLSearchParams({status:pending?'PENDING':'ALL'});if(filter)params.set('username',filter);if(cursor)params.set('cursor',cursor);
  const query=useQuery({queryKey:['sanctions-admin',params.toString()],queryFn:()=>api<{data:AdminDecision[];meta:{nextCursor:string|null}}>(`/sanctions/admin?${params}`)});
  const [kind,setKind]=useState('WARNING');const [days,setDays]=useState('3');
  const apply=useMutation({mutationFn:(form:HTMLFormElement)=>{const data=new FormData(form);return api('/sanctions/admin',{method:'POST',body:JSON.stringify({username:String(data.get('username')).replace(/^@/,''),kind,reason:data.get('reason'),evidence:data.get('evidence'),...(['SUSPEND','VITRINE','JOBS'].includes(kind)&&days?{days:Number(days)}:{}),...(String(data.get('reportId')??'').trim()?{reportId:String(data.get('reportId')).trim()}: {})})});},onSuccess:async()=>{await client.invalidateQueries({queryKey:['sanctions-admin']});}});
  return <details className="sanctions-admin report-card"><summary>{t('Medidas sobre contas e solicitações de revisão')}</summary><p>{t('Decisões humanas, com motivo e registro. Não use quantidade de denúncias como prova. Outro moderador deve revisar a decisão.')}</p>
    <details><summary>{t('Aplicar medida')}</summary><form className="sanctions-form" onSubmit={event=>{event.preventDefault();if(!apply.isPending&&window.confirm(t('Confirmar a medida e registrar o motivo no histórico?')))apply.mutate(event.currentTarget);}}><fieldset disabled={apply.isPending}><label>{t('Username do perfil')}<input name="username" required minLength={3} maxLength={31}/></label><label>{t('Medida')}<select value={kind} onChange={event=>setKind(event.target.value)}>{Object.entries(sanctionKinds).map(([key,value])=><option key={key} value={key}>{t(value)}</option>)}</select></label>{['SUSPEND','VITRINE','JOBS'].includes(kind)&&<label>{t('Duração')}<select value={days} onChange={event=>setDays(event.target.value)}>{kind!=='SUSPEND'&&<option value="">{t('Até revisão')}</option>}{[1,3,7,14,30].map(value=><option key={value} value={value}>{t('{count} dias',{count:value})}</option>)}</select></label>}<label>{t('Motivo informado ao titular')}<textarea name="reason" required minLength={10} maxLength={1000}/></label><label>{t('Evidências e contexto internos')}<textarea name="evidence" required minLength={10} maxLength={2000}/></label><label>{t('ID da denúncia vinculada (opcional)')}<input name="reportId" maxLength={100}/></label><small>{t('Não copie dados sensíveis de terceiros. O motivo é visível ao titular; as notas internas são restritas à moderação.')}</small><button>{t('Registrar medida')}</button></fieldset></form>{apply.isError&&<p role="alert">{t(apply.error.message)}</p>}{apply.isSuccess&&<p role="status">{t('Medida registrada.')}</p>}</details>
    <form className="sanctions-filter" onSubmit={event=>{event.preventDefault();setFilter(username.trim().replace(/^@/,''));setCursor(undefined);}}><input aria-label={t('Filtrar por username')} value={username} onChange={event=>setUsername(event.target.value)} placeholder={t('Filtrar por username')} maxLength={31}/><button>{t('Buscar')}</button></form><label className="sanctions-filter"><input type="checkbox" checked={pending} onChange={event=>{setPending(event.target.checked);setCursor(undefined);}}/>{t('Somente revisões pendentes')}</label>
    {query.isPending&&<p>{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t(query.error.message)}</p>}{query.data?.data.length===0&&<p>{t('Nenhum caso encontrado.')}</p>}{query.data?.data.map(row=><SanctionReview key={row.id} row={row}/>)}<div className="sanctions-filter">{cursor&&<button onClick={()=>setCursor(undefined)}>{t('Voltar ao início')}</button>}{query.data?.meta.nextCursor&&<button onClick={()=>setCursor(query.data!.meta.nextCursor!)}>{t('Próxima')}</button>}</div>
  </details>;
}
function SanctionReview({row}:{row:AdminDecision}){
  const client=useQueryClient();const [note,setNote]=useState('');
  const review=useMutation({mutationFn:(action:string)=>api(`/sanctions/admin/${encodeURIComponent(row.id)}/review`,{method:'POST',body:JSON.stringify({action,note:note.trim()})}),onSuccess:async()=>{setNote('');await Promise.all(['sanctions-admin','account-decisions'].map(key=>client.invalidateQueries({queryKey:[key]})));}});
  return <details className="account-decision"><summary>@{row.user?.username??t('Conta excluída')} · {t(sanctionKinds[row.kind])} · {date(row.createdAt)}</summary><p>{row.reason}</p><h4>{t('Evidências e contexto internos')}</h4><p>{row.evidence}</p>{row.reportId&&<small>{t('Denúncia')}: {row.reportId}</small>}{row.appeal&&<><h4>{t('Solicitação de revisão')}</h4><p>{row.appeal.content}</p><p>{t(({PENDING:'Em análise',UPHELD:'Decisão mantida',REVOKED:'Decisão revogada'} as Record<string,string>)[row.appeal.status])}</p>{row.appeal.decision&&<p>{row.appeal.decision}</p>}</>}
    <details><summary>{t('Histórico da decisão')}</summary>{row.events.map(event=><p key={event.id}>{event.action} · {date(event.createdAt)} · {event.note}</p>)}</details>
    {!row.revokedAt&&<form className="sanctions-form" onSubmit={event=>event.preventDefault()}><label>{t('Justificativa da revisão')}<textarea required minLength={10} maxLength={1000} value={note} onChange={event=>setNote(event.target.value)} disabled={review.isPending}/></label><div className="sanctions-filter">{row.appeal?.status==='PENDING'&&<button disabled={review.isPending||note.trim().length<10} onClick={()=>review.mutate('UPHOLD')}>{t('Manter decisão')}</button>}<button disabled={review.isPending||note.trim().length<10} onClick={()=>{if(window.confirm(t('Revogar esta medida? Outras restrições ativas serão mantidas.')))review.mutate('REVOKE');}}>{t('Revogar medida')}</button></div></form>}{row.revokedAt&&<p>{t('Revogada')}</p>}{review.isError&&<p role="alert">{t(review.error.message)}</p>}
  </details>;
}
