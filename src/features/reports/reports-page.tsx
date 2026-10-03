import { getLanguage } from '@/i18n';
import { t, useLanguage } from '@/i18n';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMe } from '@/features/auth/hooks/use-me';
import { ExpandableImage } from '@/components/ui/expandable-image';
import { getReports, reasons, reviewReport, type Report } from './api';
import './reports.css';
import { PendingContent } from './pending-content';
import { StationReviewInbox } from '@/features/stations/stations-pages';

function ReviewCard({ report }: { report: Report }) {
  useLanguage();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const client = useQueryClient();
  const review = useMutation({ mutationFn: (action: 'DISMISS' | 'HIDE') => reviewReport(report.id, action, note.trim()), onSuccess: async () => {
    await Promise.all(['stations', 'reports', 'feed', 'post', 'replies', 'user-posts', 'profile', 'explore', 'notifications'].map(key => client.invalidateQueries({ queryKey: [key] })));
  } });
  return <details className="report-card" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="report-summary">
      <span className="report-summary-title">{report.targetType === 'STATION' ? t('Estação') : report.targetType === 'FORUM' ? t("Tópico") : report.targetType === 'POST' ? 'Momento' : 'Resposta'} · {reasons[report.reason]}</span>
      <small>{new Date(report.createdAt).toLocaleString(getLanguage())} · {open ? t("Recolher") : t("Ver denúncia")}</small>
    </summary>
    {open && <div className="report-expanded">
    <h3>{t("Conteúdo no momento da denúncia")}</h3><p className="report-content">{report.contentSnapshot}</p>
    {report.imageSnapshot && <ExpandableImage src={report.imageSnapshot} alt="Imagem denunciada" className="report-image" />}
    {report.details && <><h3>{t("Relato")}</h3><p className="report-content">{report.details}</p></>}
    <h3>{t("Situação atual")}</h3>
    {report.current ? <><p>{report.current.moderationStatus === 'APPROVED' ? t("Disponível") : t("Fora da exibição pública")}</p><p className="report-content">{report.current.content}</p></> : <p>{t("O conteúdo já foi excluído.")}</p>}
    {report.status === 'PENDING' ? <>
      <label>{t("Justificativa da decisão")}<textarea maxLength={1000} value={note} disabled={review.isPending} onChange={event => setNote(event.target.value)} /></label>
      <div className="report-controls"><button disabled={!note.trim() || review.isPending} onClick={() => review.mutate('DISMISS')}>{t("Encerrar sem retirar")}</button><button disabled={!note.trim() || review.isPending || !report.current} onClick={() => { if (window.confirm('Retirar este conteúdo da exibição pública, incluindo a versão atual?')) review.mutate('HIDE'); }}>{t("Retirar conteúdo")}</button></div>
      {review.isError && <p role="alert">{t(review.error.message)}</p>}
    </> : <p>{t("Decisão: ")}{report.status === 'HIDDEN' ? t("Conteúdo retirado") : t("Encerrada sem retirada")}. {report.reviewNote}</p>}
    </div>}
  </details>;
}

function RecommendationMetrics() {
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['recommendation-metrics'], enabled: open, queryFn: () => api<{ data: { counts: Record<string, number> } }>('/recommendations/metrics') });
  return <details className="report-card" onToggle={e => setOpen(e.currentTarget.open)}><summary>{t('Métricas do Para você · 30 dias')}</summary>
    <p>{t('Somente participantes que permitiram métricas. Cada ação é contada uma vez por pessoa, publicação e dia; não representa todo o público.')}</p>
    {query.isPending && open && <p>{t('Carregando...')}</p>}
    {query.isError && <p role="alert">{t('Não foi possível carregar.')} <button onClick={() => query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data && <dl><dt>{t('Exibições')}</dt><dd>{query.data.data.counts.IMPRESSION ?? 0}</dd><dt>{t('Aberturas')}</dt><dd>{query.data.data.counts.OPEN ?? 0}</dd></dl>}
  </details>;
}

export function ReportsPage() {
  useLanguage();
  const me = useMe();
  const [status, setStatus] = useState('PENDING');
  const [reason, setReason] = useState('');
  const allowed = me.data?.data.user.canModerate === true;
  const reports = useInfiniteQuery({ queryKey: ['reports', status, reason], queryFn: ({ pageParam }) => getReports(status, pageParam, reason), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.meta.nextCursor ?? undefined, enabled: allowed });
  if (me.isLoading) return <p>{t("Carregando...")}</p>;
  if (!allowed) return <Navigate to="/" replace />;
  return <section className="reports-page"><h1>{t("Moderação de denúncias")}</h1>
    <PendingContent />
    <StationReviewInbox moderator />
    <RecommendationMetrics />
    <label>{t("Mostrar")}<select value={status} onChange={event => setStatus(event.target.value)}><option value="PENDING">{t("Pendentes")}</option><option value="DISMISSED">{t("Encerradas sem retirada")}</option><option value="HIDDEN">{t("Conteúdo retirado")}</option></select></label>
    <label>{t("Categoria")}<select value={reason} onChange={event => setReason(event.target.value)}><option value="">{t("Todas as categorias")}</option>{Object.entries(reasons).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    {reports.isPending && <p role="status">{t("Carregando denúncias...")}</p>}
    {reports.isError && <p role="alert">{t(reports.error.message)} <button onClick={() => reports.refetch()}>{t("Tentar novamente")}</button></p>}
    {reports.data?.pages.flatMap(page => page.data).map(report => <ReviewCard key={`${status}-${reason}-${report.id}`} report={report} />)}
    {reports.data?.pages[0].data.length === 0 && <p>{t("Nenhuma denúncia nesta fila.")}</p>}
    {reports.hasNextPage && <button disabled={reports.isFetchingNextPage} onClick={() => reports.fetchNextPage()}>{t("Carregar mais")}</button>}
  </section>;
}
