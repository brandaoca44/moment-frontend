import { useEffect, useState } from 'react';
import '@fontsource-variable/manrope';
import '@fontsource-variable/nunito-sans';
import '@fontsource-variable/source-sans-3';
import { usePlan, PremiumNotice } from './use-plan';
import { t, useLanguage } from '@/i18n';
import './appearance-options.css';
import { useProfileAppearance } from './use-profile-appearance';
export const fonts = { default:"'Helvetica Neue', Arial, sans-serif", manrope:"'Manrope Variable', sans-serif", nunito:"'Nunito Sans Variable', sans-serif", source:"'Source Sans 3 Variable', sans-serif" };
export function FontSync() {
  const access = usePlan().data?.data;
  const [saved, setSaved] = useState(()=>localStorage.getItem('moment-font') ?? 'default');
  useEffect(()=>{ const sync=()=>setSaved(localStorage.getItem('moment-font') ?? 'default'); window.addEventListener('moment-font-change',sync); window.addEventListener('storage',sync); return ()=>{window.removeEventListener('moment-font-change',sync);window.removeEventListener('storage',sync);}; },[]);
  useEffect(()=>{const key = access?.premium && saved in fonts ? saved as keyof typeof fonts : 'default'; document.documentElement.style.setProperty('--font-ui',fonts[key]);},[access?.premium,saved]);
  return null;
}
export function FontSelector() {
  useLanguage();
  const access = usePlan().data?.data;
  const sync = useProfileAppearance();
  const [selected,setSelected] = useState(()=>localStorage.getItem('moment-font') ?? 'default');
  const options = [
    { id: 'default', name: t('Padrão'), description: 'O visual original do Moment.' },
    { id: 'manrope', name: 'Manrope', description: 'Moderna, com formas limpas e discretas.' },
    { id: 'nunito', name: 'Nunito Sans', description: 'Traços suaves e um toque acolhedor.' },
    { id: 'source', name: 'Source Sans 3', description: 'Sóbria e confortável para textos longos.' },
  ] as const;
  const effective = access?.premium ? selected : 'default';
  return <section className="font-selector" aria-label={t('Fonte de leitura')}>
    <p className="font-selector-intro">{t('Escolha a fonte para os textos e menus do Moment.')}</p>
    <div className="appearance-groups">{[false, true].map(premium => <section className="appearance-group" key={String(premium)}>
      <header className="appearance-group-heading"><h3>{t(premium ? 'Fontes Premium' : 'Fonte padrão')}</h3><span className={premium ? 'appearance-badge premium' : 'appearance-badge'}>{t(premium ? 'Exclusivo Premium' : 'Incluso no Free')}</span></header>
      <div className="font-options">{options.filter(option => (option.id !== 'default') === premium).map(option => <button type="button" key={option.id} className={`font-option${premium ? '' : ' font-option-default'}`} aria-pressed={effective === option.id} disabled={(premium && !access?.premium) || sync.isPending} onClick={() => {
        setSelected(option.id);localStorage.setItem('moment-font', option.id);window.dispatchEvent(new Event('moment-font-change'));
        if(access?.premium)sync.mutate({font:option.id});
      }}>
        <span className="font-option-top"><span>{option.name}</span><span className="font-option-status">{effective === option.id ? '✓' : premium && !access?.premium ? t('Premium') : ''}</span></span>
        <span className="font-option-description">{t(option.description)}</span>
        <span className="font-option-sample" style={{fontFamily:fonts[option.id]}}>{t('Seu momento, suas histórias.')}<span className="font-option-characters" style={{display:'block'}}>Aa Bb · á é ç · 0123456789</span></span>
      </button>)}</div>
    </section>)}</div>
    {access?.trial && selected !== 'default' && <PremiumNotice />}
    {sync.isError && <small role="alert">{t('A fonte foi aplicada aqui, mas não foi possível atualizar o perfil. Selecione novamente para tentar.')}</small>}
  </section>;
}
