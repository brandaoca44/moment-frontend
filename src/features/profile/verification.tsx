import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { profileCategories } from './profile-categories';
import { categoryOptions } from './profile-categories';
import { usePlan } from '@/features/plans/use-plan';
import { Link, useSearchParams } from 'react-router-dom';
import './verification.css';
export const protectedCategories=['lawyer','doctor','pharmacist','nutritionist','nurse','engineer','architect','psychologist','accountant','regulated_professional','public_figure','politician'];
const creativeRoles=['Apresentador','Artista','Cantor','Ator','Escritor','Compositor','Esportista','Comunicador'];
export const requiresProfileVerification=(category:string,specialty?:string)=>protectedCategories.includes(category)&&!(category==='public_figure'&&creativeRoles.some(role=>role.toLocaleLowerCase('pt-BR')===specialty?.trim().toLocaleLowerCase('pt-BR')));
type Verification={id:string;category:string;specialty:string;region:string;status:string;reason:string|null;expiresAt:string|null;user?:{username:string;name:string};events?:{action:string;reason:string;createdAt:string}[]};
const statusLabels:Record<string,string>={PENDING:'Em análise',APPROVED:'Aprovada',REJECTED:'Não aprovada',REVOKED:'Revogada',EXPIRED:'Prazo encerrado',REPLACED:'Substituída'};
export function VerificationSettings(){
  useLanguage();const client=useQueryClient();
  const [params]=useSearchParams();
  const requestRef=useRef<HTMLDetailsElement>(null);
  const plan=usePlan();
  const query=useQuery({queryKey:['verification','me'],queryFn:()=>api<{data:Verification[]}>('/verification/me')});
  const requestedCategory=params.get('verifyCategory')??'';
  const requestedSpecialty=(params.get('verifySpecialty')??'').slice(0,80);
  const [category,setCategory]=useState(protectedCategories.includes(requestedCategory)?requestedCategory:'lawyer');
  const [specialty,setSpecialty]=useState(requestedSpecialty);
  useEffect(()=>{if(protectedCategories.includes(requestedCategory)){setCategory(requestedCategory);setSpecialty(requestedSpecialty);if(requestRef.current){requestRef.current.open=true;requestRef.current.scrollIntoView({behavior:'smooth',block:'start'});requestRef.current.querySelector('select')?.focus({preventScroll:true});}}},[requestedCategory,requestedSpecialty,query.data,plan.data]);
  const send=useMutation({gcTime:0,mutationFn:(form:HTMLFormElement)=>{
    const data=Object.fromEntries(new FormData(form));
    return api('/verification',{method:'POST',body:JSON.stringify(data)});
  },onSuccess:async()=>{await client.invalidateQueries({queryKey:['verification']});}});
  const pending=query.data?.data.some(row=>row.status==='PENDING');
  if(!plan.data?.data.premium)return <section className="settings-section verification-settings" style={{marginTop:20}}><header className="verification-heading"><ShieldCheck size={22}/><div><h2>{t('Verificação de perfil')}</h2><p>{t('A divulgação de atuação e sua verificação são exclusivas do Premium.')}</p></div></header><p className="verification-guidance">{t('No Free, você não precisa solicitar verificação, pois a divulgação da área de atuação está bloqueada. Conheça o Premium para acessar essa função.')}</p><Link to="/settings?section=plan">{t('Seu plano')}</Link></section>;
  return <section className="settings-section verification-settings" style={{marginTop:20}}><header className="verification-heading"><ShieldCheck size={22}/><div><h2>{t('Verificação de perfil')}</h2><p>{t('Comprove sua profissão ou atuação pública para divulgá-la no perfil Premium.')}</p></div></header>
    <p className="verification-guidance">{t('A verificação é uma medida de segurança para prevenir golpes, fraudes e pessoas se passando por você. A aprovação libera somente a categoria e o cargo ou especialidade solicitados e comprovados. Outras categorias continuam bloqueadas e exigem uma nova análise.')}</p>
    <p className="verification-guidance">{t('Atividades artísticas e criativas são autodeclaradas no Perfil Premium, sem solicitação. Cargos públicos e profissões que exigem registro ou habilitação precisam de análise. Diploma não substitui registro ativo nem comprovação de especialidade.')}</p>
    <p className="verification-guidance">{t('A equipe consulta registros profissionais e fontes institucionais oficiais. Não envie CPF, senhas, fotos de documentos ou dados bancários. A aprovação não representa apoio do Moment às suas publicações.')}</p>
    {query.isPending&&<p role="status">{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t('Não foi possível carregar.')} <button onClick={()=>query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data?.data.map(row=><article className="verification-status" key={row.id}><div><strong>{t(profileCategories[row.category as keyof typeof profileCategories]??row.category)}</strong><span>{t(statusLabels[row.status]??row.status)}</span></div><p>{row.specialty} · {row.region}</p>{row.reason&&<p>{row.reason}</p>}{row.status==='APPROVED'&&row.expiresAt&&<small>{t('Validade')}: {new Date(row.expiresAt).toLocaleDateString()}</small>}</article>)}
    {!pending&&query.data&&<details ref={requestRef} className="verification-request"><summary>{t('Solicitar verificação')}<ChevronDown size={16}/></summary><form onSubmit={event=>{event.preventDefault();if(!send.isPending)send.mutate(event.currentTarget);}}><fieldset disabled={send.isPending}>
      <label>{t('Categoria do perfil')}<select name="category" value={category} onChange={event=>{setCategory(event.target.value);setSpecialty('');}}>{protectedCategories.map(key=><option key={key} value={key}>{t(profileCategories[key as keyof typeof profileCategories])}</option>)}</select></label>
      <label>{t('Nome no registro oficial')}<input name="legalName" required minLength={3} maxLength={120} autoComplete="name"/></label>
      <label>{t('Profissão, cargo ou especialidade')}<input key={category} name="specialty" value={specialty} onChange={event=>setSpecialty(event.target.value)} list="verification-specialties" required minLength={2} maxLength={80}/><datalist id="verification-specialties">{categoryOptions[category as keyof typeof categoryOptions]?.specialties.filter(value=>requiresProfileVerification(category,value)).map(value=><option key={value} value={value}>{t(value)}</option>)}</datalist></label>
      <label>{t('Estado ou região')}<input name="region" required minLength={2} maxLength={60}/></label>
      <label>{t('Registro profissional ou referência institucional')}<input name="registration" required minLength={2} maxLength={100}/></label>
      <small>{t('Ex.: OAB/UF, CRM/UF ou referência de nomeação em órgão oficial. O cargo e a especialidade também precisam constar na fonte consultada.')}</small>
      <label>{t('Link da fonte oficial')}<input name="source" type="url" pattern="https://.*" required maxLength={2000} placeholder="https://"/></label>
      <p className="verification-guidance">{t('Os dados de comprovação são criptografados e restritos à equipe. São apagados em até 30 dias, ou até 30 dias após a decisão. Solicitações sem decisão expiram em 30 dias. Apenas categoria, atuação e região aprovadas aparecem no perfil.')}</p>
      <label className="verification-consent"><input type="checkbox" required/>{t('Confirmo que os dados são meus e autorizo a consulta da fonte oficial para esta análise.')}</label>
      <button>{t(send.isPending?'Enviando...':'Enviar solicitação')}</button>
    </fieldset></form></details>}
    {pending&&<p className="verification-guidance">{t('Sua solicitação está em análise. O resultado aparecerá aqui e nas notificações.')}</p>}
    {send.isError&&<p role="alert">{t(send.error.message)}</p>}{send.isSuccess&&<p role="status">{t('Solicitação enviada para análise.')}</p>}
  </section>;
}
export function VerificationAdmin(){
  useLanguage();const [open,setOpen]=useState(false);const [cursor,setCursor]=useState<string|undefined>();
  const query=useQuery({queryKey:['verification','admin',cursor],queryFn:()=>api<{data:Verification[];meta:{nextCursor:string|null}}>(`/verification/admin${cursor?`?cursor=${encodeURIComponent(cursor)}`:''}`),enabled:open});
  return <details className="report-card verification-admin" onToggle={event=>setOpen(event.currentTarget.open)}><summary>{t('Verificações profissionais e de figuras públicas')}</summary><p>{t('Confira a titularidade, a situação do registro e a correspondência exata do cargo ou especialidade na fonte oficial. Não aprove a própria conta nem casos com conflito de interesse. Não copie dados sensíveis na justificativa pública.')}</p>{query.isPending&&open&&<p>{t('Carregando...')}</p>}{query.isError&&<p role="alert">{t(query.error.message)}</p>}{query.data?.data.length===0&&<p>{t('Nenhuma solicitação disponível.')}</p>}{open&&query.data?.data.map(row=><VerificationReview key={row.id} row={row}/>)}<div className="verification-review-actions">{cursor&&<button onClick={()=>setCursor(undefined)}>{t('Voltar ao início')}</button>}{query.data?.meta.nextCursor&&<button onClick={()=>setCursor(query.data!.meta.nextCursor!)}>{t('Próxima')}</button>}</div></details>;
}
function VerificationReview({row}:{row:Verification}){
  const client=useQueryClient();const [evidence,setEvidence]=useState<{legalName:string;registration:string;source:string}|null>(null);const [reason,setReason]=useState('');const [ownershipConfirmed,setOwnershipConfirmed]=useState(false);
  const view=useMutation({gcTime:0,mutationFn:async()=>{const result=await api<{data:NonNullable<typeof evidence>}>(`/verification/admin/${row.id}/evidence`,{method:'POST'});setEvidence(result.data);}});
  const decision=useMutation({mutationFn:(action:string)=>api(`/verification/admin/${row.id}/decision`,{method:'POST',body:JSON.stringify({action,reason,ownershipConfirmed})}),onSuccess:async()=>{setEvidence(null);await Promise.all(['verification','profile','premium-profile'].map(key=>client.invalidateQueries({queryKey:[key]})));}});
  return <details className="verification-review" onToggle={event=>{if(!event.currentTarget.open)setEvidence(null);}}><summary>@{row.user?.username} · {t(profileCategories[row.category as keyof typeof profileCategories])} · {t(statusLabels[row.status])}</summary><p>{row.specialty} · {row.region}</p><button disabled={view.isPending} onClick={()=>view.mutate()}>{t('Consultar comprovação')}</button>{evidence&&<div className="verification-evidence"><dl><dt>{t('Nome no registro oficial')}</dt><dd>{evidence.legalName}</dd><dt>{t('Registro profissional ou referência institucional')}</dt><dd>{evidence.registration}</dd><dt>{t('Link da fonte oficial')}</dt><dd>{evidence.source}</dd></dl><small>{t('Confira o domínio oficial antes de abrir a fonte. Não use apenas redes sociais ou o relato do solicitante como prova.')}</small></div>}{view.isError&&<p role="alert">{t(view.error.message)}</p>}{row.status==='PENDING'&&<label className="verification-consent"><input type="checkbox" checked={ownershipConfirmed} onChange={event=>setOwnershipConfirmed(event.target.checked)}/>{t('Conferi o registro, o cargo ou especialidade e a titularidade deste perfil por fonte ou canal institucional independente.')}</label>}<label>{t('Justificativa pública')}<textarea value={reason} onChange={event=>setReason(event.target.value)} minLength={10} maxLength={500}/></label><div className="verification-review-actions">{(row.status==='PENDING'?['APPROVE','REJECT']:['REVOKE']).map(action=><button key={action} disabled={decision.isPending||reason.trim().length<10||action==='APPROVE'&&(!evidence||!ownershipConfirmed)} onClick={()=>{if(window.confirm(t('Confirmar esta decisão e registrar no histórico?')))decision.mutate(action);}}>{t(action==='APPROVE'?'Aprovar':action==='REJECT'?'Não aprovar':'Revogar verificação')}</button>)}</div>{row.events&&<details><summary>{t('Histórico da decisão')}</summary>{row.events.map((event,index)=><p key={index}>{event.action} · {new Date(event.createdAt).toLocaleString()} · {event.reason}</p>)}</details>}{decision.isError&&<p role="alert">{t(decision.error.message)}</p>}</details>;
}
