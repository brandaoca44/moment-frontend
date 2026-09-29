import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import "./stations.css";
const marks = [
  ["WELCOMES", "💛 Acolhe", "Faz as pessoas se sentirem bem-vindas."],
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
}: {
  userId: string;
  own: boolean;
}) {
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
    return <p role="status">Carregando marcas positivas...</p>;
  if (query.isError)
    return <p role="alert">Não foi possível carregar as marcas positivas.</p>;
  if (!data) return null;
  return (
    <section className="marks-panel" aria-label="Marcas positivas">
      {(data.showsMarks || own) && (
        <>
          <div className="mark-options">
            {marks.map(([kind, label, description]) =>
              own ? (
                <span className="mark-value" title={description} key={kind}>
                  {label}{" "}
                  <span className="mark-count">{data.counts[kind] ?? 0}</span>
                </span>
              ) : (
                <button
                  title={description}
                  key={kind}
                  aria-pressed={data.mine.includes(kind)}
                  disabled={
                    own ||
                    action.isPending ||
                    (!data.canGive && !data.mine.includes(kind))
                  }
                  onClick={() => action.mutate({ kind })}
                >
                  {label}{" "}
                  <span className="mark-count">{data.counts[kind] ?? 0}</span>
                </button>
              ),
            )}
          </div>
        </>
      )}
      {!own && !data.showsMarks && (
        <p>Este perfil prefere não exibir as marcas.</p>
      )}
      {!own && !data.canGive && data.showsMarks && (
        <details className="marks-help">
          <summary>Sobre as marcas</summary>
          <small>
            Marcas disponíveis após uma conversa pública entre vocês, se o
            perfil aceitar recebê-las.
          </small>
        </details>
      )}
      {!own && !data.showsMarks && data.mine.length > 0 && (
        <button
          disabled={action.isPending}
          onClick={() => action.mutate({ kind: data.mine[0] })}
        >
          Retirar uma marca enviada
        </button>
      )}
      {own && (
        <details>
          <summary>Preferências das marcas</summary>
          <label>
            <input
              type="checkbox"
              checked={data.acceptsMarks}
              disabled={action.isPending}
              onChange={(e) =>
                action.mutate({ setting: { acceptsMarks: e.target.checked } })
              }
            />{" "}
            Aceitar marcas positivas
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.showsMarks}
              disabled={action.isPending}
              onChange={(e) =>
                action.mutate({ setting: { showsMarks: e.target.checked } })
              }
            />{" "}
            Exibir símbolos e totais no perfil
          </label>
        </details>
      )}
      {action.isError && <p role="alert">{action.error.message}</p>}
    </section>
  );
}
