import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Link2, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { StationDialog } from '@/features/stations/station-dialog';
import { ReportDialog } from '@/features/reports/report-button';
import './profile-links.css';
export type ProfileLink = {id:string;label:string;url:string};
function domain(url:string){try{return new URL(url).hostname;}catch{return '';}}
export function ProfileLinksSettings(){
  useLanguage();
  const query=useQuery({queryKey:['profile-links'],queryFn:()=>api<{data:ProfileLink[]}>('/users/me/links')});
  return <section className="settings-section profile-links-settings"><header className="settings-section-header"><h2 className="settings-section-title">{t('Links do perfil')}</h2><p className="settings-section-subtitle">{t('Até três links públicos para seu trabalho. Disponível no Free e Premium.')}</p></header>
    <p className="profile-links-help">{t('Use o link HTTPS direto do seu site. Destinos perigosos, conteúdo adulto e encurtadores são bloqueados quando identificados. Não é necessário aprovar seu domínio antes.')}</p>
    {query.isPending&&<p role="status">{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t(query.error.message)} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data&&<LinksForm initial={query.data.data}/>}
  </section>;
}
function LinksForm({initial}:{initial:ProfileLink[]}){
  const client=useQueryClient();const [links,setLinks]=useState(initial.map(({label,url})=>({label,url})));
  const save=useMutation({mutationFn:()=>api<{data:ProfileLink[]}>('/users/me/links',{method:'PATCH',body:JSON.stringify({links})}),onSuccess:async()=>{await Promise.all([client.invalidateQueries({queryKey:['profile']}),client.invalidateQueries({queryKey:['profile-links']})]);}});
  return <form className="profile-links-form" onSubmit={event=>{event.preventDefault();save.mutate();}}><fieldset disabled={save.isPending}>
    {links.map((link,index)=><div className="profile-link-editor" key={index}><label>{t('Nome do link')}<input required minLength={2} maxLength={60} value={link.label} onChange={event=>{save.reset();setLinks(items=>items.map((item,i)=>i===index?{...item,label:event.target.value}:item));}}/></label><label>{t('Endereço do site')}<input type="url" required maxLength={1000} placeholder="https://" value={link.url} onChange={event=>{save.reset();setLinks(items=>items.map((item,i)=>i===index?{...item,url:event.target.value}:item));}}/></label><button type="button" aria-label={`${t('Remover link')} ${index+1}`} onClick={()=>{save.reset();setLinks(items=>items.filter((_,i)=>i!==index));}}><Trash2 size={16}/></button></div>)}
    <div className="profile-link-actions">{links.length<3&&<button type="button" onClick={()=>{save.reset();setLinks(items=>[...items,{label:'',url:''}]);}}><Plus size={15}/>{t('Adicionar link')}</button>}<button type="submit">{t(save.isPending?'Salvando…':'Salvar links')}</button></div>
    </fieldset>{save.isError&&<p role="alert">{t(save.error.message)}</p>}{save.isSuccess&&<p className="profile-links-help" role="status">{t('Links do perfil salvos.')}</p>}
  </form>;
}
function LeaveMoment({id,close}:{id:string;close:()=>void}){
  const query=useQuery({queryKey:['profile-link-open',id],queryFn:()=>api<{data:{label:string;url:string;reputationChecked:boolean;contentChecked:boolean}}>(`/users/links/${encodeURIComponent(id)}/open`),staleTime:0,gcTime:0,retry:false});
  const checked=query.isSuccess&&!query.isFetching?query.data.data:undefined;
  return <div className="profile-link-exit"><p>{t('Este site é administrado por terceiros e possui suas próprias regras de privacidade e condições de uso. Confira o endereço antes de continuar.')}</p>{query.isFetching&&<p role="status">{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t(query.error.message)}</p>}{checked&&<><strong>{checked.label}</strong><span className="profile-link-domain">{domain(checked.url)}</span><p className="profile-links-help">{t('A presença do link não significa recomendação ou garantia do Moment.')}</p>{(!checked.reputationChecked||!checked.contentChecked)&&<p className="profile-links-help">{t('A verificação deste destino é parcial. Confira o domínio antes de continuar.')}</p>}</>}<div className="profile-link-actions"><button onClick={close}>{t('Voltar')}</button>{checked&&<a href={checked.url} target="_blank" rel="noopener noreferrer nofollow ugc" referrerPolicy="no-referrer" onClick={close}>{t('Abrir site')}<ExternalLink size={14}/></a>}</div></div>;
}
export function ProfileLinks({links,own}:{links:ProfileLink[];own:boolean}){
  useLanguage();const [report,setReport]=useState<string|null>(null);
  if(!links.length)return null;
  return <div className="profile-public-links" aria-label={t('Links do perfil')}>{links.map(link=><div className="profile-public-link" key={link.id}><Link2 size={15}/><div><StationDialog label={link.label} title={t('Você está saindo do Moment')}>{close=><LeaveMoment id={link.id} close={close}/>}</StationDialog><small>{domain(link.url)}</small></div>{!own&&<button className="profile-link-report" onClick={()=>setReport(link.id)} aria-label={`${t('Denunciar link')}: ${link.label}`}>{t('Denunciar')}</button>}</div>)}{report&&<ReportDialog targetType="LINK" targetId={report} close={()=>setReport(null)}/>}</div>;
}
