import { t, useLanguage } from '@/i18n';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import "./stations.css";
const marks = [
  ["STYLE", "✦ Tem estilo", "Expressa personalidade através do seu estilo."],
  ["INSPIRES", "💡 Inspira", "Compartilha ideias e experiências que inspiram."],
  ["DELIGHTS", "✨ Alegra", "Traz humor e leveza às conversas."],
];
type Data = {
  acceptsMarks: boolean;
  showsMarks: boolean;
  counts: Record<string, number>;
  mine: string[];
  canGive: boolean;
};
export function PositiveMarks({
  userId,
  own,
  settings = false,
}: {
  userId: string;
  own: boolean;
  settings?: boolean;
}) {
  useLanguage();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["marks", userId],
    queryFn: () => api<{ data: Data }>(`/marks/${encodeURIComponent(userId)}`),
  });
  const data = query.data?.data;
  const action = useMutation({
    mutationFn: ({
      kind,
      setting,
    }: {
      kind?: string;
      setting?: Partial<Data>;
    }) =>
      kind
        ? api(`/marks/${encodeURIComponent(userId)}/${kind}`, {
            method: data?.mine.includes(kind) ? "DELETE" : "PUT",
          })
        : api("/marks/settings", {
            method: "PATCH",
            body: JSON.stringify({
              acceptsMarks: data?.acceptsMarks,
              showsMarks: data?.showsMarks,
              ...setting,
            }),
          }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["marks", userId] }),
  });
  if (query.isPending)
    return <p role="status">{t("Carregando marcas positivas...")}</p>;
  if (query.isError)
    return <p role="alert">{t("Não foi possível carregar as marcas positivas.")}</p>;
  if (!data) return null;
  if (own && !settings && !data.showsMarks) return null;
  return (
    <section className={settings ? 'marks-settings' : 'marks-panel'} aria-label={t("Marcas positivas")}>
      {!settings && data.showsMarks && (
        <>
          <div className="mark-options">
            {marks.map(([kind, label, description]) =>
              own ? (
                <span className="mark-value" title={t(description)} key={kind}>
                  {t(label)}{" "}
                  <span className="mark-count">{data.counts[kind] ?? 0}</span>
                </span>
              ) : (
                <button
                  title={t(description)}
                  key={kind}
                  aria-pressed={data.mine.includes(kind)}
                  disabled={
                    own ||
                    action.isPending ||
                    (!data.canGive && !data.mine.includes(kind))
                  }
                  onClick={() => action.mutate({ kind })}
                >
                  {t(label)}{" "}
                  <span className="mark-count">{data.counts[kind] ?? 0}</span>
                </button>
              ),
            )}
          </div>
        </>
      )}
      {!own && !data.showsMarks && (
        <p>{t("Este perfil prefere não exibir as marcas.")}</p>
      )}
      {!own && !data.canGive && data.showsMarks && (
        <details className="marks-help">
          <summary>{t("Sobre as marcas")}</summary>
          <small>
            {t(" Marcas disponíveis após uma conversa pública entre vocês, se o perfil aceitar recebê-las. ")}</small>
        </details>
      )}
      {!own && !data.showsMarks && data.mine.length > 0 && (
        <button
          disabled={action.isPending}
          onClick={() => action.mutate({ kind: data.mine[0] })}
        >
          {t(" Retirar uma marca enviada ")}</button>
      )}
      {own && settings && (
        <>
          <h3>{t("Marcas positivas")}</h3>
          <p>{t("Escolha se deseja receber marcas e mostrá-las no seu perfil. As alterações são salvas automaticamente.")}</p>
          <label>
            <input
              type="checkbox"
              role="switch"
              checked={data.acceptsMarks}
              disabled={action.isPending}
              onChange={(e) =>
                action.mutate({ setting: { acceptsMarks: e.target.checked } })
              }
            />{" "}
            {t(" Aceitar marcas positivas ")}</label>
          <label>
            <input
              type="checkbox"
              role="switch"
              checked={data.showsMarks}
              disabled={action.isPending}
              onChange={(e) =>
                action.mutate({ setting: { showsMarks: e.target.checked } })
              }
            />{" "}
            {t(" Exibir símbolos e totais no perfil ")}</label>
          {action.isSuccess && <small role="status">{t("Preferências salvas.")}</small>}
        </>
      )}
      {action.isError && <p role="alert">{t(action.error.message)}</p>}
    </section>
  );
}
