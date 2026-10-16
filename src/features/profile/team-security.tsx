import { useState, type ReactNode } from 'react';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { t,useLanguage } from '@/i18n';
import { StaffNotice } from './staff-badge';
type Status={eligible:boolean;role:string;enabled:boolean;verified:boolean;expiresAt:string|null;recoveryRemaining:number};
function useMfa(){return useQuery({queryKey:['staff-mfa'],queryFn:()=>api<{data:Status}>('/mfa/status'),retry:false,refetchInterval:30000,staleTime:0});}
export const useTeamSecurity=useMfa;
export function MfaGate({children}:{children:ReactNode}){
  useLanguage();const query=useMfa();
  if(query.isPending)return <p role="status">{t('Carregando...')}</p>;
  if(query.isError)return <p role="alert">{t(query.error.message)} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>;
  if(!query.data.data.eligible)return <Navigate to="/" replace/>;
  if(!query.data.data.verified)return <section className="settings-section"><h2>{t('Proteção da equipe')}</h2><p>{t('Confirme seu autenticador para acessar as ferramentas da equipe.')}</p><Link to="/settings?section=password&securityTab=mfa">{t('Configurar ou confirmar MFA')}</Link></section>;
  return children;
}
export function MfaPanel(){
  useLanguage();const query=useMfa();const client=useQueryClient();
  const [password,setPassword]=useState(''),[code,setCode]=useState('');
  const [setup,setSetup]=useState<{secret:string;qr:string}|null>(null),[codes,setCodes]=useState<string[]>([]),[message,setMessage]=useState('');
  const action=useMutation({gcTime:0,mutationFn:async(operation:string)=>{
    const result=await api<{data:{secret?:string;qr?:string;recoveryCodes?:string[]}}>(`/mfa/${operation}`,{method:'POST',body:JSON.stringify({password,...(operation!=='setup'?{code}:{})})});
    setPassword('');setCode('');setMessage('Configuração de segurança atualizada.');
    setSetup(result.data.secret&&result.data.qr?{secret:result.data.secret,qr:result.data.qr}:null);
    setCodes(result.data.recoveryCodes??[]);
    await client.invalidateQueries({queryKey:['staff-mfa']});
  }});
  const status=query.data?.data;if(!status?.eligible)return null;
  return <section className="settings-section mfa-panel"><header className="settings-section-header"><h2>{t('Proteção da equipe')}</h2><p>{t('Use senha e autenticador para acessar ferramentas privilegiadas. A confirmação dura até 15 minutos e está vinculada à sessão atual.')}</p></header><StaffNotice role={status.role}/>
    <p role="status">{t(status.verified?'MFA confirmado nesta sessão.':status.enabled?'Autenticador ativo. Confirme o acesso.':'Configure seu autenticador para começar.')}</p>
    {setup&&<div><img src={setup.qr} alt={t('QR de configuração do autenticador')}/><p>{t('Adicione ao seu aplicativo autenticador. O código de configuração expira em 10 minutos.')}</p><pre>{setup.secret}</pre></div>}
    <form onSubmit={event=>{event.preventDefault();action.mutate(status.enabled?'verify':setup?'enable':'setup');}}>
      <label>{t('Senha atual')}<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>{setPassword(e.target.value);action.reset();}}/></label>
      {(status.enabled||setup)&&<label>{t('Código do autenticador ou de recuperação')}<input autoComplete="one-time-code" required minLength={6} maxLength={30} value={code} onChange={e=>{setCode(e.target.value);action.reset();}}/></label>}
      <div className="mfa-actions"><button disabled={action.isPending}>{t(action.isPending?'Aguarde...':status.enabled?'Confirmar acesso':setup?'Ativar autenticador':'Configurar autenticador')}</button></div>
      {status.enabled&&<details><summary>{t('Opções de recuperação')}</summary><small>{t('Guarde os códigos em local privado. Desativar o MFA bloqueia as ferramentas da equipe até uma nova configuração.')}</small><p>{t('Códigos restantes')}: {status.recoveryRemaining}</p><div className="mfa-actions"><button type="button" disabled={action.isPending||!password||!code} onClick={()=>{if(confirm(t('Substituir todos os códigos de recuperação?')))action.mutate('recovery');}}>{t('Gerar novos códigos')}</button><button type="button" disabled={action.isPending||!password||!code} onClick={()=>{if(confirm(t('Desativar o MFA e bloquear as ferramentas da equipe?')))action.mutate('disable');}}>{t('Desativar MFA')}</button></div></details>}
    </form>{action.isError&&<p role="alert">{t(action.error.message)}</p>}{message&&<p role="status">{t(message)}</p>}
    {!!codes.length&&<div><strong>{t('Salve estes códigos agora. Eles são exibidos somente nesta etapa e cada um funciona uma vez.')}</strong><pre>{codes.join('\n')}</pre><button onClick={()=>setCodes([])}>{t('Já guardei os códigos')}</button></div>}
  </section>;
}
export function StaffManagementPanel(){
  useLanguage();const query=useMfa();
  if(query.data?.data.role!=='OWNER')return null;
  return <section className="settings-section mfa-panel">{query.data.data.verified?<StaffAdministration/>:<><h2>{t('Gerenciar equipe')}</h2><p>{t('Confirme seu autenticador para acessar as ferramentas da equipe.')}</p><Link to="/settings?section=password&securityTab=mfa">{t('Configurar ou confirmar MFA')}</Link></>}</section>;
}
function StaffAdministration(){
  const client=useQueryClient();const [username,setUsername]=useState(''),[role,setRole]=useState('COMMUNITY_MANAGER'),[reason,setReason]=useState('');
  const query=useQuery({queryKey:['staff-members'],queryFn:()=>api<{data:{members:{id:string;name:string;username:string;staffRole:string}[];events:{id:string;actorId:string;userId:string;role:string;previousRole:string;reason:string;createdAt:string}[]}}>('/staff'),retry:false});
  const save=useMutation({mutationFn:()=>api<{message:string}>('/staff/role',{method:'POST',body:JSON.stringify({username,role,reason})}),onSuccess:async()=>{setUsername('');setReason('');await client.invalidateQueries({queryKey:['staff-members']});}});
  return <section><h3>{t('Gerenciar equipe')}</h3><p>{t('Somente o Owner pode alterar funções. Community Manager reúne orientação, moderação e comunicação institucional. A alteração encerra as sessões da conta afetada.')}</p><form className="staff-role-form" onSubmit={event=>{event.preventDefault();if(confirm(t('Confirmar a alteração de acesso desta conta?')))save.mutate();}}><label>{t('Nome de usuário')}<input required maxLength={40} value={username} onChange={e=>setUsername(e.target.value)}/></label><label>{t('Função da equipe')}<select value={role} onChange={e=>setRole(e.target.value)}><option value="COMMUNITY_MANAGER">Community Manager</option><option value="MODERATOR">Moderator</option><option value="MOMENT_TEAM">Moment Team</option><option value="NONE">{t('Remover função')}</option></select></label><label>{t('Motivo')}<textarea required minLength={5} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/></label><button disabled={save.isPending}>{t('Atualizar função')}</button></form>{save.isError&&<p role="alert">{t(save.error.message)}</p>}{save.isSuccess&&<p role="status">{t(save.data.message)}</p>}{query.isError&&<p role="alert">{t(query.error.message)}</p>}<ul className="staff-members">{query.data?.data.members.map(member=><li key={member.id}><span>{member.name} · @{member.username}</span><strong>{member.staffRole==='COMMUNITY_MANAGER'?'Community Manager':member.staffRole==='MODERATOR'?'Moderator':'Moment Team'}</strong></li>)}</ul><details className="staff-audit"><summary>{t('Histórico de alterações')}</summary>{query.data?.data.events.map(event=><p key={event.id}>{new Date(event.createdAt).toLocaleString()} · {event.previousRole} → {event.role}<br/>{event.reason}<br/>{t('Responsável')}: {event.actorId} · {t('Conta')}: {event.userId}</p>)}</details></section>;
}
