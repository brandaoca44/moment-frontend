import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { t, useLanguage } from '@/i18n';
import './staff.css';
const titles:Record<string,string>={OWNER:'Owner · Moment Team',COMMUNITY_MANAGER:'Community Manager',MODERATOR:'Moderator',MOMENT_TEAM:'Moment Team'};
export function StaffBadge({role}:{role?:string|null}){
  useLanguage();
  const badgeRef=useRef<HTMLDetailsElement>(null);
  const [open,setOpen]=useState(false);
  const positionNotice=()=>{
    const notice=badgeRef.current?.querySelector<HTMLElement>('[role="note"]');
    if(!notice||!badgeRef.current?.open)return;
    notice.style.left='0px';
    const bounds=notice.getBoundingClientRect();
    const viewportWidth=document.documentElement.clientWidth;
    const left=Math.max(16,Math.min(bounds.left,viewportWidth-bounds.width-16));
    notice.style.left=`${left-bounds.left}px`;
  };
  useEffect(()=>{
    if(!open)return;
    positionNotice();
    const dismiss=(event:PointerEvent|FocusEvent)=>{
      const badge=badgeRef.current;
      if(badge&&event.target instanceof Node&&!badge.contains(event.target))badge.open=false;
    };
    const escape=(event:KeyboardEvent)=>{
      const badge=badgeRef.current;
      if(event.key==='Escape'&&badge?.open){
        event.preventDefault();
        badge.open=false;
        badge.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('focusin',dismiss);
    document.addEventListener('keydown',escape);
    window.addEventListener('resize',positionNotice);
    return ()=>{
      document.removeEventListener('pointerdown',dismiss);
      document.removeEventListener('focusin',dismiss);
      document.removeEventListener('keydown',escape);
      window.removeEventListener('resize',positionNotice);
    };
  },[open]);
  if(!role||!titles[role])return null;
  const description=role==='COMMUNITY_MANAGER'?'Este perfil orienta participantes, medeia a convivência, modera as regras do Moment e publica comunicados institucionais.':role==='MODERATOR'?'Este perfil analisa denúncias e atua na aplicação das regras do Moment.':role==='OWNER'?'Este perfil é responsável pela administração do Moment.':'Este perfil publica comunicados e atualizações institucionais do Moment.';
  return <details ref={badgeRef} onToggle={event=>{setOpen(event.currentTarget.open);positionNotice();}} className="staff-badge"><summary><ShieldCheck size={12} aria-hidden="true"/>{titles[role]}</summary><div role="note"><strong>{role==='OWNER'?titles[role]:`${titles[role]} · Moment`}</strong><p>{t(description)}</p><p>{t('A equipe nunca solicita senhas, códigos de acesso ou pagamentos por mensagens.')}</p></div></details>;
}
export function StaffNotice({role}:{role?:string|null}){
  useLanguage();if(!role||!titles[role])return null;
  return <aside className="staff-notice"><ShieldCheck size={17}/><div><strong>{t('Conta institucional do Moment')}</strong><p>{t('Use este perfil para orientação, moderação e comunicados da sua função. Preserve informações confidenciais e encaminhe casos com conflito de interesse.')}</p></div></aside>;
}
