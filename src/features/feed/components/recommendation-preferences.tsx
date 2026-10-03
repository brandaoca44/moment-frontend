import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { t, useLanguage } from '@/i18n';
import { categories } from '@/features/stations/api';
import './recommendations.css';
export type RecommendationPreferences = { interests: string[]; personalized: boolean; metrics: boolean; metricsAllowed: boolean };
export function useRecommendationPreferences() {
  return useQuery({ queryKey: ['recommendation-preferences'], queryFn: () => api<{ data: RecommendationPreferences }>('/recommendations/preferences'), staleTime: 60000 });
}
export function RecommendationPreferencesPanel() {
  useLanguage();
  const query = useRecommendationPreferences();
  return <section className="recommendation-preferences">
    <h3>{t('Seu Para você')}</h3>
    <p>{t('Escolha até 10 assuntos. Suas estações e perfis seguidos também ajudam nas recomendações.')}</p>
    {query.isPending && <p>{t('Carregando...')}</p>}
    {query.isError && <p role="alert">{t('Não foi possível carregar.')} <button onClick={() => query.refetch()}>{t('Tentar novamente')}</button></p>}
    {query.data && <PreferencesForm key={JSON.stringify(query.data.data)} value={query.data.data} />}
  </section>;
}
function PreferencesForm({ value }: { value: RecommendationPreferences }) {
  const [draft, setDraft] = useState(value);
  const client = useQueryClient();
  const save = useMutation({ mutationFn: (reset: boolean) => api<{ data: RecommendationPreferences }>('/recommendations/preferences', reset ? { method: 'DELETE' } : { method: 'PUT', body: JSON.stringify({ interests: draft.interests, personalized: draft.personalized, metrics: draft.metrics }) }), onSuccess: async response => {
    client.setQueryData(['recommendation-preferences'], response);
    await client.resetQueries({ queryKey: ['feed', 'global'] });
  } });
  return <form onSubmit={event => { event.preventDefault(); save.mutate(false); }}>
    <div className="recommendation-interests" role="group" aria-label={t('Interesses')}>
      {categories.filter(c => c !== 'Política').map(category => <button type="button" key={category} aria-pressed={draft.interests.includes(category)} disabled={save.isPending || (!draft.interests.includes(category) && draft.interests.length >= 10)} onClick={() => setDraft({ ...draft, interests: draft.interests.includes(category) ? draft.interests.filter(c => c !== category) : [...draft.interests, category] })}>{t(category)}</button>)}
    </div>
    <label><input type="checkbox" checked={draft.personalized} onChange={e => setDraft({ ...draft, personalized: e.target.checked })} />{t('Personalizar o Para você')}</label>
    <p>{t('Desativado: momentos recentes em ordem cronológica. Seguindo permanece cronológico.')}</p>
    {value.metricsAllowed && <><label><input type="checkbox" checked={draft.metrics} onChange={e => setDraft({ ...draft, metrics: e.target.checked })} />{t('Permitir métricas opcionais')}</label><p>{t('Registra exibições e aberturas por até 30 dias e permite usar curtidas e republicações recentes para personalizar. Desativar apaga esses eventos.')}</p></>}
    <div className="recommendation-buttons"><button disabled={save.isPending} type="submit">{t('Salvar')}</button><button disabled={save.isPending} type="button" onClick={() => { if (confirm(t('Redefinir interesses, métricas e publicações sem interesse?'))) save.mutate(true); }}>{t('Redefinir recomendações')}</button></div>
    {save.isError && <p role="alert">{t('Não foi possível salvar. Tente novamente.')}</p>}
  </form>;
}
