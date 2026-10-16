import { useState, type CSSProperties } from 'react';
import { protectedCategories, requiresProfileVerification } from './verification';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Check, ChevronDown, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { usePlan, PremiumNotice } from '@/features/plans/use-plan';
import { fonts } from '@/features/plans/font-selector';
import { themes, useTheme, type ThemeId } from '@/contexts/theme-context';
import './premium-profile.css';

import { categoryOptions, profileCategories } from './profile-categories';
export { profileCategories } from './profile-categories';
type Details = {profileCategory:string|null;profileSpecialty:string|null;profileRegion:string|null;profileRegistration:string|null;profileTheme:string;profileFont:string;profileFollowAppearance:boolean};
export function PremiumProfileSettings() {
  useLanguage();
  const access=usePlan().data?.data;
  const query=useQuery({queryKey:['premium-profile'],queryFn:()=>api<{data:Details}>('/plans/profile')});
  return <section className="settings-section premium-profile-settings" style={{marginTop:20}}>
    <header className="settings-section-header"><h2 className="settings-section-title">{t('Perfil Premium')}</h2><p className="settings-section-subtitle">{t('Sua categoria e sua aparência, para quem visita seu perfil.')}</p></header>
    {access?.trial && <PremiumNotice/>}
    {!access?.premium && <p>{t('Este recurso faz parte do plano Premium.')}</p>}
    {query.isPending && <p role="status">{t('Carregando...')}</p>}
    {query.isError && <p role="alert">{t('Não foi possível carregar seu perfil.')}</p>}
    {query.data && <PremiumProfileForm key={`${query.data.data.profileCategory}:${query.data.data.profileSpecialty}`} initial={query.data.data} enabled={!!access?.premium}/>}
  </section>;
}
function PremiumProfileForm({initial,enabled}:{initial:Details;enabled:boolean}) {
  const navigate=useNavigate();
  const client=useQueryClient();
  const verified=useQuery({queryKey:['verification','me'],queryFn:()=>api<{data:{category:string;specialty:string;region:string;status:string;expiresAt:string|null}[]}>('/verification/me')});
  const approvals=verified.data?.data.filter(row=>row.status==='APPROVED'&&row.expiresAt&&new Date(row.expiresAt)>new Date())??[];
  const {themeId}=useTheme();
  const [followAppearance,setFollowAppearance]=useState(initial.profileFollowAppearance);
  const [form,setForm]=useState({category:initial.profileCategory??'',specialty:initial.profileSpecialty??'',region:initial.profileRegion??'',registration:initial.profileRegistration??'',theme:initial.profileTheme,font:initial.profileFont});
  function currentFont(){try{const saved=localStorage.getItem('moment-font');return saved && saved in fonts ? saved : 'default';}catch{return 'default';}}
  const previewTheme=followAppearance ? themeId : form.theme;
  const previewFont=followAppearance ? currentFont() : form.font;
  const save=useMutation({mutationFn:()=>api<{data:Details}>('/plans/profile',{method:'PATCH',body:JSON.stringify({...form,theme:previewTheme,font:previewFont,followAppearance})}),onSuccess:async result=>{client.setQueryData(['premium-profile'],result);await client.invalidateQueries({queryKey:['profile']});}});
  function field(key:keyof typeof form,value:string){setForm(previous=>({...previous,[key]:value}));save.reset();}
  const professional=['lawyer','doctor','nutritionist','nurse','professional','engineer','architect','psychologist','accountant'].includes(form.category);
  const category = categoryOptions[form.category as keyof typeof categoryOptions];
  const protectedSelection=requiresProfileVerification(form.category,form.specialty);
  function requestVerification(category:string,specialty='') {navigate(`/settings?${new URLSearchParams({section:'profile',profileTab:'verification',verifyCategory:category,verifySpecialty:specialty})}`);}
  function chooseCategory(value:string) {const approval=approvals.find(row=>row.category===value);if(value!=='public_figure'&&protectedCategories.includes(value)&&!approval){requestVerification(value);return;}if(value===form.category)return;setForm(previous=>({...previous,category:value,specialty:approval?.specialty??(value==='public_figure'?'Artista':''),region:approval?.region??previous.region,registration:''}));save.reset();}
  function chooseSpecialty(value:string){const approval=approvals.find(row=>row.category===form.category&&row.specialty===value);if(requiresProfileVerification(form.category,value)&&!approval){requestVerification(form.category,value);return;}setForm(previous=>({...previous,specialty:value,region:approval?.region??previous.region}));save.reset();}
  return <form className="premium-profile-form" onSubmit={event=>{event.preventDefault();save.mutate();}}>
    <fieldset disabled={!enabled||save.isPending}>
      <div className="premium-identity-studio"><div className="premium-studio-heading"><Sparkles size={17}/><span><strong>{t('Sua identidade, em destaque')}</strong><small>{t('Uma apresentação exclusiva para o seu perfil.')}</small></span></div>
      <details className="premium-category-picker"><summary><span><small>{t('Categoria do perfil')}</small><strong>{t(category?.name ?? 'Escolha sua área')}</strong></span><ChevronDown size={16}/></summary><div className="premium-category-grid">{Object.entries(categoryOptions).map(([key,value])=><button type="button" key={key} title={protectedCategories.includes(key)&&key!=='public_figure'?t('Exige verificação aprovada'):undefined} aria-pressed={form.category===key} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');chooseCategory(key);}}><span>{t(value.name)}{protectedCategories.includes(key)&&key!=='public_figure'&&!approvals.some(row=>row.category===key)&&<small> · {t('Verificação')}</small>}</span>{form.category===key&&<Check size={14}/>}</button>)}<button type="button" aria-pressed={!form.category} onClick={()=>chooseCategory('')}>{t('Sem categoria')}</button></div></details>
      {category && (!protectedSelection||form.category==='public_figure') && <div className="premium-specialties"><span className="premium-field-caption">{t('Profissão, cargo ou especialidade')}</span><div className="premium-specialty-options">{category.specialties.map(value=><button type="button" key={value} aria-pressed={form.specialty===value} onClick={()=>chooseSpecialty(value)}>{t(value)}{requiresProfileVerification(form.category,value)&&!approvals.some(row=>row.category===form.category&&row.specialty===value)&&<small> · {t('Verificação')}</small>}</button>)}</div>{form.category!=='public_figure'&&<label><span className="premium-field-caption">{t('Ou personalize sua descrição')}</span><input maxLength={80} value={form.specialty} onChange={event=>field('specialty',event.target.value)} placeholder={t(category.example)}/></label>}</div>}
      {protectedSelection&&form.category&&<p className="premium-profile-help">{form.specialty} <button type="button" onClick={()=>requestVerification(form.category,form.specialty)}>{t('Solicitar outra atuação')}</button></p>}
      </div>
      {form.category && <><label>{t('Estado ou região')}<input readOnly={protectedSelection} maxLength={60} value={form.region} onChange={event=>field('region',event.target.value)}/></label>{professional&&!protectedSelection&&<label>{t('Registro profissional (opcional)')}<input maxLength={60} value={form.registration} onChange={event=>field('registration',event.target.value)}/></label>}</>}
      {form.category==='adult_creator'&&<p className="premium-profile-help">{t('Esta categoria é pública e opcional. Não autoriza nudez ou conteúdo explícito no Moment. Links adultos ainda estão bloqueados.')}</p>}
      <p className="premium-profile-help">{t('Atividades criativas são autodeclaradas. Cargos públicos e profissões com registro obrigatório exigem verificação específica. Pagar o Premium não garante aprovação.')}</p>
      <div className="premium-appearance-modes" role="radiogroup" aria-label={t('Aparência do perfil')}>{[true,false].map(automatic=><label className={`premium-mode${followAppearance===automatic?' selected':''}`} key={String(automatic)}><input type="radio" name="profile-appearance-mode" checked={followAppearance===automatic} onChange={()=>{setFollowAppearance(automatic);save.reset();}}/><span><strong>{t(automatic?'Acompanhar minha aparência':'Personalizar só o perfil')}</strong><small>{t(automatic?'Tema e fonte acompanham suas escolhas em Aparência.':'Um visual separado, escolhido por você.')}</small></span></label>)}</div>
      {!followAppearance && <><p className="premium-appearance-note"><Info size={14} aria-hidden="true"/><span>{t('No modo manual, mudar a aparência do site não altera o perfil. Para atualizar o perfil, escolha o tema e a fonte aqui e salve.')}</span></p><div className="premium-look-options"><span className="premium-field-caption">{t('Tema do perfil')}</span><div className="premium-theme-options">{Object.values(themes).map(theme=><button type="button" key={theme.id} aria-pressed={form.theme===theme.id} onClick={()=>field('theme',theme.id)}><span className="premium-color-swatch" style={{background:`linear-gradient(135deg,${theme.colors.bg},${theme.colors.amethystLight})`}}/>{theme.name}{form.theme===theme.id&&<Check size={12}/>}</button>)}</div><span className="premium-field-caption">{t('Fonte do perfil')}</span><div className="premium-font-options">{Object.entries(fonts).map(([key,family])=><button type="button" key={key} aria-pressed={form.font===key} onClick={()=>field('font',key)}><span style={{fontFamily:family}}>Aa</span><small>{({default:t('Padrão'),manrope:'Manrope',nunito:'Nunito Sans',source:'Source Sans 3'} as Record<string,string>)[key]}</small></button>)}</div></div></>}
      <div className="premium-profile-preview" style={profileAppearance(previewTheme,previewFont)}><PremiumBadge/><strong>{t(form.category ? profileCategories[form.category as keyof typeof profileCategories] : 'Seu perfil')}</strong><span>{form.specialty || t('Seu momento, suas histórias.')}</span></div>
      <p className="premium-appearance-note"><Info size={14} aria-hidden="true"/><span>{t('Visitantes veem este tema e esta fonte somente no seu perfil. O restante do site mantém as preferências deles.')}</span></p>
      <button className="profile-save" type="submit">{t(save.isPending?'Salvando…':'Salvar perfil Premium')}</button>
    </fieldset>
    {save.isError&&<p className="premium-save-result error" role="alert">{t(save.error.message)}</p>}{save.isSuccess&&<p className="premium-save-result" role="status"><Check size={14} aria-hidden="true"/>{t('Perfil Premium salvo.')}</p>}
  </form>;
}
export function PremiumBadge(){return <details className="premium-account-info"><summary className="premium-account-badge"><Sparkles size={12} aria-hidden="true"/>Premium Account</summary><p>{t('Este perfil usa uma aparência Premium. Ao sair, suas preferências continuam iguais. Não é um selo de identidade verificada.')}</p></details>;}
export function profileAppearance(themeId?:string|null,fontId?:string|null):CSSProperties|undefined {
  if(!themeId || !(themeId in themes)) return undefined;
  const c=themes[themeId as ThemeId].colors;
  const style:Record<string,string>={colorScheme:['light','aurora','champagne','rose'].includes(themeId)?'light':'dark',background:c.bg,color:c.text,'--font-ui':fonts[fontId as keyof typeof fonts]??fonts.default};
  for(const [key,value] of Object.entries(c))style[`--${key.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`]=value;
  Object.assign(style,{'--surface-glass':c.surface,'--surface-elevated':c.surfaceSoft,'--border-soft':c.border,'--glass-border':c.border,'--glass-highlight':c.border,'--panel-background':c.surface,'--card-background':c.surface,'--card-bg':c.surface,'--accent-rgb':rgb(c.amethyst),'--accent-soft-rgb':rgb(c.amethystLight)});
  return style as CSSProperties;
}
function rgb(hex:string){return [1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)).join(', ');}
