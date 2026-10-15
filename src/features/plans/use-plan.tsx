import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useMe } from '@/features/auth/hooks/use-me';
import { t, useLanguage } from '@/i18n';
import { BriefcaseBusiness, ChevronDown, MessageSquareText, Palette, Send, ShoppingBag, Sparkles, UserRound } from 'lucide-react';
import './plans.css';
export type PlanAccess = { plan: 'FREE' | 'PREMIUM'; premium: boolean; trial: boolean; trialAvailable: boolean; trialEndsAt: string | null; limits: { moments: number; topics: number; vitrine: number; companies:number; jobs:number }; vitrinePeriod: 'week' | 'month' };
export function usePlan() {
  const me = useMe();
  return useQuery({ queryKey: ['plans', me.data?.data?.user?.id], queryFn: () => api<{ data: PlanAccess }>('/plans/me'), enabled: !!me.data?.data?.user, staleTime: 30000, refetchInterval: 60000, refetchOnWindowFocus: true });
}
export function PremiumNotice() {
  useLanguage();
  return <small role="status" style={{ display: 'block', color: 'var(--text-soft)', margin: '8px 0', lineHeight: 1.5 }}><strong>{t('Premium em teste')}</strong> · {t('Este recurso faz parte do plano Premium. Aproveite o acesso gratuito durante a fase de testes.')}</small>;
}
export function PlanSection() {
  useLanguage();
  const query = usePlan(), access = query.data?.data;
  const client = useQueryClient();
  const me = useMe();
  const choice = useMutation({
    mutationFn: (plan: 'FREE' | 'PREMIUM') => api<{data:PlanAccess;message:string}>('/plans/choice', {method:'PATCH',body:JSON.stringify({choice:plan})}),
    onSuccess: async result => {
      await client.cancelQueries({queryKey:['plans']});
      client.setQueryData(['plans',me.data?.data?.user?.id],{data:result.data});
      await Promise.all(['plans','vitrine','jobs','profile','premium-profile'].map(key => client.invalidateQueries({queryKey:[key]})));
    },
  });
  return <section className="settings-section plan-section">
    <header className="plan-heading"><h2>{t('Seu plano')}</h2><p>{t('Compare o que está incluso em cada plano.')}</p></header>
    <div className="plan-comparison">
      <PlanCard name="Free" current={!!access && !access.premium} description={t('O essencial para fazer parte do Moment.')} groups={planGroups(false)} action={<button type="button" className="plan-choice" disabled={!access || !access.premium || access.plan === 'PREMIUM' || choice.isPending} onClick={()=>choice.mutate('FREE')}>{t(access && !access.premium ? 'Seu plano atual' : 'Usar plano Free')}</button>} />
      <PlanCard name="Premium" premium current={access?.premium} trial={access?.trial} description={t('Tudo do Free, com mais espaço e personalização.')} groups={planGroups(true)} action={<><button type="button" className="plan-choice" disabled={!access || access.premium || !access.trialAvailable || choice.isPending} onClick={()=>choice.mutate('PREMIUM')}>{t(access?.trial ? 'Premium em teste' : access?.plan === 'PREMIUM' ? 'Seu plano atual' : 'Testar Premium gratuitamente')}</button><p className="plan-group-note">{t('Acesso gratuito de testes. Sem cobrança e sem assinatura automática.')}</p></>} />
    </div>
    {query.isPending && <p className="plan-status" role="status">{t('Carregando...')}</p>}
    {query.isError && <p className="plan-status" role="alert">{t('Não foi possível carregar seu plano.')}</p>}
    {choice.isPending && <p className="plan-status" role="status">{t('Atualizando seu plano…')}</p>}
    {choice.isError && <p className="plan-status" role="alert">{t(choice.error.message)}</p>}
    {choice.isSuccess && <p className="plan-status" role="status">{t(choice.data.message)}</p>}
    {access && !access.premium && !access.trialAvailable && <p className="plan-status">{t('O teste Premium não está disponível no momento.')}</p>}
    <p className="plan-footnote">{t('Ao testar o Premium, os limites acima e as opções exclusivas de aparência ficam disponíveis nesta conta. Você pode voltar ao Free por aqui. Seus conteúdos continuam salvos e as cotas utilizadas não são reiniciadas.')}</p>
    {access?.trial && <PremiumNotice />}
    <p className="plan-footnote">{t('Produtos e cupons compartilham a cota. Excluir uma publicação não devolve a vaga.')}</p>
    <p className="plan-footnote">{t('A cota de vagas é compartilhada entre todas as suas empresas. Excluir uma vaga não devolve a cota mensal.')}</p>
    <p className="plan-footnote">{t('Não há cobrança durante esta fase de testes.')}</p>
    {access && <FeedbackForm />}
  </section>;
}
type PlanGroup = { title:string; icon:ReactNode; items:{label:string;value:string;detail?:string}[]; note?:string };
function planGroups(premium:boolean):PlanGroup[] {
  return [
    {title:t('Publicações e comunidade'),icon:<MessageSquareText size={15}/>,items:[
      {label:'Moments',value:t('{count} caracteres',{count:premium?440:220})},
      {label:t('Tópicos nas estações'),value:t('{count} caracteres',{count:premium?660:440})},
    ],note:t('Crie estações, participe de conversas, curta e responda. As notificações estão incluídas nos dois planos.')},
    {title:t('Vitrine'),icon:<ShoppingBag size={15}/>,items:[{label:t('Produtos e cupons'),value:t(premium?'{count} por mês':'{count} por semana',{count:premium?30:4})}],note:t('Uma cota compartilhada para indicar produtos e cupons de lojas aprovadas.')},
    {title:t('Vagas Moment'),icon:<BriefcaseBusiness size={15}/>,items:[
      {label:t('Empresas cadastradas'),value:t(premium?'Até {count} empresas':'{count} empresa',{count:premium?3:1})},
      {label:t('Divulgação de vagas'),value:t('{count} por mês',{count:premium?10:4})},
    ],note:t('A cota mensal vale para todas as suas empresas. Buscar vagas é gratuito.')},
    {title:t('Aparência'),icon:<Palette size={15}/>,items:[
      {label:t('Temas'),value:t(premium?'4 temas exclusivos + os gratuitos':'3 temas incluídos'),detail:premium?'Midnight, Aurora, Champagne e Rosé':t('Claro, Escuro e Ametista')},
      {label:t('Fontes'),value:t(premium?'3 fontes extras':'Fonte padrão'),detail:premium?'Manrope, Nunito Sans e Source Sans 3':undefined},
    ]},
  ];
}
function PlanCard({ name, description, groups, current, premium = false, trial = false, action }: { name: string; description: string; groups:PlanGroup[]; current?: boolean; premium?: boolean; trial?: boolean; action:ReactNode }) {
  return <article className={`plan-card${premium ? ' plan-card-premium' : ''}`} aria-labelledby={`plan-${name.toLowerCase()}`}>
    <div className="plan-card-header"><span className="plan-mark" aria-hidden="true">{premium?<Sparkles size={19}/>:<UserRound size={19}/>}</span><h3 id={`plan-${name.toLowerCase()}`}>{name}</h3></div>
    {(current||trial)&&<span className="plan-badge">{t(trial?'Premium em teste':'Seu plano atual')}</span>}
    <p className="plan-description">{description}</p>
    <div className="plan-groups">{groups.map(group=><section className="plan-group" key={group.title}><h4><span aria-hidden="true">{group.icon}</span>{group.title}</h4><dl>{group.items.map(item=><div className="plan-benefit" key={item.label}><dt>{item.label}</dt><dd>{item.value}{item.detail&&<small>{item.detail}</small>}</dd></div>)}</dl>{group.note&&<p className="plan-group-note">{group.note}</p>}</section>)}</div>
    <footer className="plan-card-actions">{action}</footer>
  </article>;
}
function FeedbackForm() {
  const [content,setContent]=useState('');
  const send=useMutation({mutationFn:()=>api<{message:string}>('/plans/feedback',{method:'POST',body:JSON.stringify({content:content.trim()})}),onSuccess:()=>setContent('')});
  return <details className="plan-feedback"><summary><MessageSquareText size={18} aria-hidden="true"/><span><strong>{t('Compartilhe sua opinião')}</strong><small>{t('Conte como foi testar o plano.')}</small></span><ChevronDown className="plan-feedback-chevron" size={16} aria-hidden="true"/></summary><form onSubmit={e=>{e.preventDefault();if(content.trim().length>=3&&!send.isPending)send.mutate();}}><label htmlFor="plan-feedback-text">{t('Como foi sua experiência?')}</label><textarea id="plan-feedback-text" rows={3} required minLength={3} maxLength={1000} disabled={send.isPending} value={content} placeholder={t('O que funcionou bem? O que podemos melhorar?')} onChange={e=>{setContent(e.target.value);send.reset();}}/><p className="plan-feedback-note">{t('Não inclua senhas, documentos ou dados bancários.')}</p><footer><small>{content.length}/1000</small><button disabled={send.isPending||content.trim().length<3}><Send size={14} aria-hidden="true"/>{t(send.isPending?'Enviando…':'Enviar feedback')}</button></footer>{send.isSuccess&&<p className="plan-feedback-result" role="status">{t(send.data.message)}</p>}{send.isError&&<p className="plan-feedback-error" role="alert">{t(send.error.message)}</p>}</form></details>;
}
