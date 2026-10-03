import { t, useLanguage } from '@/i18n';
import { useEffect, useLayoutEffect, useRef, useState, useId } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';
import { reasons, sendReport, type TargetType } from './api';
import './reports.css';

function ReportDialog({ targetType, targetId, close }: { targetType: TargetType; targetId: string; close: () => void }) {
  useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return createPortal(<dialog className="report-dialog" ref={dialog} aria-labelledby="report-title" onCancel={event => { event.preventDefault(); if (!pending) close(); }}>
    <h2 id="report-title">{targetType === 'STATION' ? t('Denunciar estação') : `${t("Denunciar ")}${targetType === 'POST' ? t('Momento') : t('Resposta')}`}</h2>
    {sent ? <><p role="status">{t("Denúncia recebida. A moderação vai analisar. Sua identidade não será exibida ao autor.")}</p><button onClick={close}>{t("Fechar")}</button></> : <form onSubmit={async event => {
      event.preventDefault(); if (!reason || submitting.current) return;
      submitting.current = true; setPending(true); setError('');
      try { await sendReport({ targetType, targetId, reason, details: details.trim() }); setSent(true); }
      catch (err) { setError(err instanceof Error ? err.message : t("Não foi possível enviar. Tente novamente.")); }
      finally { submitting.current = false; setPending(false); }
    }}>
      <p>{t("Escolha o motivo. A denúncia será analisada e não remove o conteúdo automaticamente.")}</p>
      <label htmlFor="report-reason">{t("Motivo")}</label>
      <select id="report-reason" required value={reason} disabled={pending} onChange={event => setReason(event.target.value)}><option value="">{t("Selecione")}</option>{Object.entries(reasons).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <label htmlFor="report-details">{t("Mais informações (opcional)")}</label>
      <textarea id="report-details" maxLength={1000} value={details} disabled={pending} onChange={event => setDetails(event.target.value)} />
      <small>{details.length}/1000</small>
      {error && <p role="alert">{error}</p>}
      <div className="report-controls"><button type="button" disabled={pending} onClick={close}>{t("Cancelar")}</button><button disabled={pending || !reason}>{pending ? t("Enviando...") : t("Enviar denúncia")}</button></div>
    </form>}
  </dialog>, document.body);
}

type MenuAction = { label: string; onSelect: () => void; disabled?: boolean; checked?: boolean };

export function ReportButton({ targetType, targetId, authorId, canReport = true, onDelete, deletePending = false, menuActions = [] }: { targetType: TargetType; targetId: string; authorId?: string; canReport?: boolean; onDelete?: () => void; deletePending?: boolean; menuActions?: MenuAction[] }) {
  useLanguage();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const client = useQueryClient();
  const action = useMutation({
    mutationFn: (choice: 'HIDE' | 'MUTE' | 'BLOCK') => choice === 'BLOCK'
      ? api<{ message: string }>(`/block/${encodeURIComponent(authorId!)}`, { method: 'POST' })
      : api<{ message: string }>('/block/preferences', { method: 'POST', body: JSON.stringify({ targetType, targetId, action: choice }) }),
    onSuccess: async () => { await client.invalidateQueries(); },
  });
  useLayoutEffect(() => {
    if (!menuOpen || !button.current || !menu.current) return;
    const anchor = button.current.getBoundingClientRect();
    const bounds = menu.current.getBoundingClientRect();
    const height = document.documentElement.clientHeight;
    const width = document.documentElement.clientWidth;
    setPosition({ left: Math.max(8, Math.min(anchor.right - bounds.width, width - bounds.width - 8)), top: Math.max(8, Math.min(anchor.bottom + 6 + bounds.height <= height - 8 ? anchor.bottom + 6 : anchor.top - bounds.height - 6, height - bounds.height - 8)) });
    menu.current.querySelector<HTMLButtonElement>('button')?.focus();
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setMenuOpen(false); };
    const reposition = () => setMenuOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', reposition); window.removeEventListener('scroll', reposition, true); };
  }, [menuOpen]);
  function closeMenu() { setMenuOpen(false); button.current?.focus({ preventScroll: true }); }
  function choose(choice: 'HIDE' | 'MUTE' | 'BLOCK') {
    closeMenu();
    if (choice === 'BLOCK' && !confirm(t("Bloquear este perfil? Vocês deixarão de seguir um ao outro e não poderão interagir. Pode desfazer em Configurações."))) return;
    if (choice === 'MUTE' && !confirm(t("Silenciar este perfil? Suas publicações deixam de aparecer nas suas listas. Pode desfazer em Configurações."))) return;
    action.mutate(choice);
  }
  return <>
    <button ref={button} className="content-menu-trigger" type="button" aria-label={t("Opções da publicação")} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined} disabled={action.isPending} onClick={() => { action.reset(); setMenuOpen(value => !value); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg></button>
    {menuOpen && createPortal(<div id={menuId} ref={menu} className="content-action-menu" role="menu" aria-label={t("Opções da publicação")} style={position} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
      if (event.key === 'Tab') setMenuOpen(false);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }
    }}>
      {menuActions.map(item => <button key={item.label} role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'} aria-checked={item.checked} disabled={item.disabled} onClick={() => { closeMenu(); item.onSelect(); }}>{item.checked !== undefined && <span aria-hidden="true">{item.checked ? '✓ ' : ''}</span>}{item.label}</button>)}
      {canReport && <>{targetType !== 'STATION' && <><button role="menuitem" onClick={() => choose('MUTE')}>{t("Silenciar perfil")}</button>
      <button role="menuitem" onClick={() => choose('HIDE')}>{t("Ocultar esta postagem")}</button>
      {authorId && <button role="menuitem" className="content-menu-danger" onClick={() => choose('BLOCK')}>{t("Bloquear perfil")}</button>}</>}
      <button role="menuitem" className="content-menu-danger" onClick={() => { closeMenu(); setOpen(true); }}>{t(targetType === 'STATION' ? 'Denunciar estação' : 'Denunciar')}</button></>}
      {onDelete && <button role="menuitem" className="content-menu-danger" disabled={deletePending} onClick={() => { closeMenu(); onDelete(); }}>{deletePending ? t("Excluindo...") : t("Excluir resposta")}</button>}
    </div>, document.body)}
    {(action.isError || action.isSuccess) && createPortal(<div className="content-action-feedback" role={action.isError ? 'alert' : 'status'}>{action.isError ? action.error.message : action.data?.message}<button type="button" onClick={() => action.reset()} aria-label={t("Fechar aviso")}>×</button></div>, document.body)}
    {open && <ReportDialog targetType={targetType} targetId={targetId} close={() => { setOpen(false); requestAnimationFrame(() => button.current?.focus({ preventScroll: true })); }} />}
  </>;
}
