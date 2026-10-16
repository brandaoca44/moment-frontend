import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Link2, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { StationDialog } from '@/features/stations/station-dialog';
import { ReportDialog } from '@/features/reports/report-button';
import './profile-links.css';
export type ProfileLink = {id:string;label:string;url:string};
export function ProfileLinksFields({links,onChange,limit,disabled}:{links:{label:string;url:string}[];onChange:(links:{label:string;url:string}[])=>void;limit:number;disabled:boolean}){
  return <fieldset className="profile-links-inline" disabled={disabled}><legend>{t('Links do perfil')}</legend><p className="profile-links-help">{t('O Free permite 1 link e o Premium permite até 3 links.')}</p><div className="profile-links-form">{links.map((link,index)=><div className="profile-link-editor" key={index}><label>{t('Nome do link')}<input required minLength={2} maxLength={60} value={link.label} onChange={event=>onChange(links.map((item,i)=>i===index?{...item,label:event.target.value}:item))}/></label><label>{t('Endereço do site')}<input type="url" required maxLength={1000} placeholder="https://" value={link.url} onChange={event=>onChange(links.map((item,i)=>i===index?{...item,url:event.target.value}:item))}/></label><button type="button" aria-label={`${t('Remover link')} ${index+1}`} onClick={()=>onChange(links.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div>)}</div>{links.length<limit&&<button type="button" className="settings-secondary-button" onClick={()=>onChange([...links,{label:'',url:''}])}><Plus size={14}/>{t('Adicionar link')}</button>}{links.length>limit&&<p role="alert">{t('Escolha 1 link para manter no Free antes de salvar. Os demais não aparecem no perfil público.')}</p>}<p className="profile-links-help">{t('Use o endereço HTTPS direto. Links passam pelas verificações de segurança do Moment.')}</p></fieldset>;
}
function domain(url:string){try{return new URL(url).hostname;}catch{return '';}}
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
