import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/features/auth/hooks/use-me';
import { ExpandableImage } from '@/components/ui/expandable-image';
import { getReports, reasons, reviewReport, type Report } from './api';
import './reports.css';
import { PendingContent } from './pending-content';

function ReviewCard({ report }: { report: Report }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const client = useQueryClient();
  const review = useMutation({ mutationFn: (action: 'DISMISS' | 'HIDE') => reviewReport(report.id, action, note.trim()), onSuccess: async () => {
    await Promise.all(['stations', 'reports', 'feed', 'post', 'replies', 'user-posts', 'profile', 'explore', 'notifications'].map(key => client.invalidateQueries({ queryKey: [key] })));
  } });
  return <details className="report-card" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="report-summary">
      <span className="report-summary-title">{report.targetType === 'FORUM' ? 'Estação' : report.targetType === 'POST' ? 'Momento' : 'Resposta'} · {reasons[report.reason]}</span>
      <small>{new Date(report.createdAt).toLocaleString('pt-BR')} · {open ? 'Recolher' : 'Ver denúncia'}</small>
    </summary>
    {open && <div className="report-expanded">
    <h3>Conteúdo no momento da denúncia</h3><p className="report-content">{report.contentSnapshot}</p>
    {report.imageSnapshot && <ExpandableImage src={report.imageSnapshot} alt="Imagem denunciada" className="report-image" />}
    {report.details && <><h3>Relato</h3><p className="report-content">{report.details}</p></>}
    <h3>Situação atual</h3>
    {report.current ? <><p>{report.current.moderationStatus === 'APPROVED' ? 'Disponível' : 'Fora da exibição pública'}</p><p className="report-content">{report.current.content}</p></> : <p>O conteúdo já foi excluído.</p>}
    {report.status === 'PENDING' ? <>
      <label>Justificativa da decisão<textarea maxLength={1000} value={note} disabled={review.isPending} onChange={event => setNote(event.target.value)} /></label>
      <div className="report-controls"><button disabled={!note.trim() || review.isPending} onClick={() => review.mutate('DISMISS')}>Encerrar sem retirar</button><button disabled={!note.trim() || review.isPending || !report.current} onClick={() => { if (window.confirm('Retirar este conteúdo da exibição pública, incluindo a versão atual?')) review.mutate('HIDE'); }}>Retirar conteúdo</button></div>
      {review.isError && <p role="alert">{review.error.message}</p>}
    </> : <p>Decisão: {report.status === 'HIDDEN' ? 'Conteúdo retirado' : 'Encerrada sem retirada'}. {report.reviewNote}</p>}
    </div>}
  </details>;
}

export function ReportsPage() {
  const me = useMe();
  const [status, setStatus] = useState('PENDING');
  const [reason, setReason] = useState('');
  const allowed = me.data?.data.user.canModerate === true;
  const reports = useInfiniteQuery({ queryKey: ['reports', status, reason], queryFn: ({ pageParam }) => getReports(status, pageParam, reason), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.meta.nextCursor ?? undefined, enabled: allowed });
  if (me.isLoading) return <p>Carregando...</p>;
  if (!allowed) return <Navigate to="/" replace />;
  return <section className="reports-page"><h1>Moderação de denúncias</h1>
    <PendingContent />
    <label>Mostrar<select value={status} onChange={event => setStatus(event.target.value)}><option value="PENDING">Pendentes</option><option value="DISMISSED">Encerradas sem retirada</option><option value="HIDDEN">Conteúdo retirado</option></select></label>
    <label>Categoria<select value={reason} onChange={event => setReason(event.target.value)}><option value="">Todas as categorias</option>{Object.entries(reasons).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {reports.isPending && <p role="status">Carregando denúncias...</p>}
    {reports.isError && <p role="alert">{reports.error.message} <button onClick={() => reports.refetch()}>Tentar novamente</button></p>}
    {reports.data?.pages.flatMap(page => page.data).map(report => <ReviewCard key={`${status}-${reason}-${report.id}`} report={report} />)}
    {reports.data?.pages[0].data.length === 0 && <p>Nenhuma denúncia nesta fila.</p>}
    {reports.hasNextPage && <button disabled={reports.isFetchingNextPage} onClick={() => reports.fetchNextPage()}>Carregar mais</button>}
  </section>;
}
