import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useMe } from '@/features/auth/hooks/use-me';
import { t, useLanguage, getLanguage } from '@/i18n';
import { ReportDialog } from '@/features/reports/report-button';
import type { TargetType } from '@/features/reports/api';
import './protection-mode.css';

type State={active:boolean;until:string|null};
function useProtection(){const me=useMe();return useQuery({queryKey:['protection',me.data?.data?.user?.id],queryFn:()=>api<{data:State}>('/protection'),enabled:!!me.data?.data?.user,refetchInterval:30000,refetchOnWindowFocus:true});}
export function ProtectionShortcut(){useLanguage();return <Link className="protection-shortcut" to="/settings?section=privacy"><ShieldCheck size={14} aria-hidden="true"/>{t('Modo Proteção')}</Link>;}
export function ProtectionPanel(){
  useLanguage();const query=useProtection();const client=useQueryClient();const [hours,setHours]=useState(24);const [params]=useSearchParams();const [report,setReport]=useState(false);
  const target=params.get('target'),id=params.get('id');
  const reportable=!!id&&['POST','REPLY','FORUM','STATION'].includes(target??'');
  const save=useMutation({mutationFn:(duration:number)=>api<{data:State}>('/protection',{method:'PATCH',body:JSON.stringify({hours:duration})}),onSuccess:async()=>{await Promise.all(['protection','notifications'].map(key=>client.invalidateQueries({queryKey:[key]})));}});
  const active=query.data?.data.active;
  return <section className="protection-panel"><header><ShieldCheck size={19} aria-hidden="true"/><div><h3>{t('Modo Proteção')}</h3><p>{t('Uma pausa nas interações, sem sair do Moment.')}</p></div></header>
    <p>{t('Pausa novos comentários nos seus Moments, menções e respostas diretas em conversas. Notificações sociais ficam recolhidas; avisos de sistema continuam disponíveis. O perfil e as publicações permanecem visíveis.')}</p>
    <p className="protection-note">{t('Disponível para Free e Premium. Não apaga conteúdo nem denúncias e não bloqueia contas automaticamente.')}</p>
    {query.isPending&&<p role="status">{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t('Não foi possível consultar sua proteção.')} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data&&<div className="protection-controls">{active?<><span role="status">{t('Proteção ativa até')} {new Date(query.data.data.until!).toLocaleString(getLanguage())}</span><button disabled={save.isPending} onClick={()=>save.mutate(0)}>{t('Desativar proteção')}</button></>:<><label>{t('Duração')}<select value={hours} onChange={event=>setHours(Number(event.target.value))} disabled={save.isPending}><option value={24}>{t('24 horas')}</option><option value={72}>{t('72 horas')}</option></select></label><button className="protection-activate" disabled={save.isPending} onClick={()=>save.mutate(hours)}>{t(save.isPending?'Salvando…':'Ativar proteção')}</button></>}</div>}
    {save.isError&&<p role="alert">{t(save.error.message)}</p>}
    <p className="protection-note">{t('Está sofrendo assédio? Denuncie as publicações envolvidas pelo menu de cada uma. A proteção não envia uma denúncia automaticamente.')}</p>
    {reportable&&<button className="protection-report" onClick={()=>setReport(true)}>{t('Denunciar esta publicação')}</button>}
    {report&&reportable&&<ReportDialog targetType={target as TargetType} targetId={id!} close={()=>setReport(false)}/>}
  </section>;
}
export function ProtectionStatus(){useLanguage();const query=useProtection();return query.data?.data.active?<div className="protection-status" role="status"><ShieldCheck size={15} aria-hidden="true"/><Link to="/settings?section=privacy">{t('Modo Proteção ativo')} · {t('Gerenciar')}</Link></div>:null;}
