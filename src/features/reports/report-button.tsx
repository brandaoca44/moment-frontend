import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { reasons, sendReport, type TargetType } from './api';
import './reports.css';

function ReportDialog({ targetType, targetId, close }: { targetType: TargetType; targetId: string; close: () => void }) {
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
    <h2 id="report-title">Denunciar {targetType === 'POST' ? 'momento' : 'resposta'}</h2>
    {sent ? <><p role="status">Denúncia recebida. A moderação vai analisar. Sua identidade não será exibida ao autor.</p><button onClick={close}>Fechar</button></> : <form onSubmit={async event => {
      event.preventDefault(); if (!reason || submitting.current) return;
      submitting.current = true; setPending(true); setError('');
      try { await sendReport({ targetType, targetId, reason, details: details.trim() }); setSent(true); }
      catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar. Tente novamente.'); }
      finally { submitting.current = false; setPending(false); }
    }}>
      <p>Escolha o motivo. A denúncia será analisada e não remove o conteúdo automaticamente.</p>
      <label htmlFor="report-reason">Motivo</label>
      <select id="report-reason" required value={reason} disabled={pending} onChange={event => setReason(event.target.value)}><option value="">Selecione</option>{Object.entries(reasons).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <label htmlFor="report-details">Mais informações (opcional)</label>
      <textarea id="report-details" maxLength={1000} value={details} disabled={pending} onChange={event => setDetails(event.target.value)} />
      <small>{details.length}/1000</small>
      {error && <p role="alert">{error}</p>}
      <div className="report-controls"><button type="button" disabled={pending} onClick={close}>Cancelar</button><button disabled={pending || !reason}>{pending ? 'Enviando...' : 'Enviar denúncia'}</button></div>
    </form>}
  </dialog>, document.body);
}

export function ReportButton({ targetType, targetId }: { targetType: TargetType; targetId: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <><button ref={button} className="report-trigger" type="button" onClick={() => setOpen(true)}>Denunciar</button>{open && <ReportDialog targetType={targetType} targetId={targetId} close={() => { setOpen(false); requestAnimationFrame(() => button.current?.focus({ preventScroll: true })); }} />}</>;
}
