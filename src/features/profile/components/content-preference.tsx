import { getLanguage } from '@/i18n';
import { t, useLanguage } from '@/i18n';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import "./profile-actions.css";

export function ContentPreference({
  targetType,
  targetId,
}: {
  targetType: "POST" | "REPLY" | "FORUM" | "USER";
  targetId: string;
}) {
  useLanguage();
  const client = useQueryClient();
  const action = useMutation({
    mutationFn: (action: "HIDE" | "MUTE") =>
      api<{ message: string }>("/block/preferences", {
        method: "POST",
        body: JSON.stringify({ targetType, targetId, action }),
      }),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
  if (targetType === "USER")
    return (
      <div className="profile-inline-action">
        <button
          type="button"
          className="profile-quiet-button"
          disabled={action.isPending || action.isSuccess}
          onClick={() => {
            if (
              confirm(
                t("Silenciar este perfil? Suas publicações deixam de aparecer nas listas para você. Pode desfazer em Configurações."),
              )
            )
              action.mutate("MUTE");
          }}
        >
          {action.isPending
            ? t("Aguarde...")
            : action.isSuccess
              ? "Silenciado"
              : "Silenciar"}
        </button>
        {action.isError && <small role="alert">{t(action.error.message)}</small>}
      </div>
    );
  return (
    <details>
      <summary>{t("Preferências de conteúdo")}</summary>
      {
        <button
          disabled={action.isPending}
          onClick={() => action.mutate("HIDE")}
        >
          {t(" Ocultar publicação ")}</button>
      }
      <button
        disabled={action.isPending}
        onClick={() => {
          if (
            confirm(
              t("Silenciar este perfil? Suas publicações deixam de aparecer nas listas para você. Pode desfazer em Configurações."),
            )
          )
            action.mutate("MUTE");
        }}
      >
        {t(" Silenciar perfil ")}</button>
      {action.isError && <p role="alert">{t(action.error.message)}</p>}
      {action.isSuccess && <p role="status">{t(action.data.message)}</p>}
    </details>
  );
}

export function ContentPreferences() {
  useLanguage();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["content-preferences"],
    queryFn: () =>
      api<{ data: { id: string; kind: string; createdAt: string }[] }>(
        "/block/preferences",
      ),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/block/preferences/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
  return (
    <section className="settings-preference-group">
      <h3>{t("Conteúdos ocultos e perfis silenciados")}</h3>
      <p>
        {t(" O silenciamento altera suas listas; um link direto ainda pode abrir o conteúdo. Para impedir interações, use Bloquear. ")}</p>
      {query.isPending && <p>{t("Carregando...")}</p>}
      {query.isError && <p role="alert">{t(query.error.message)}</p>}
      {query.data?.data.map((row) => (
        <div key={row.id} className="station-controls">
          <span>
            {row.kind === "MUTE" ? t("Perfil silenciado") : t("Publicação oculta")} ·{" "}
            {new Date(row.createdAt).toLocaleString(getLanguage())}
          </span>
          <button
            disabled={remove.isPending}
            onClick={() => remove.mutate(row.id)}
          >
            {t(" Desfazer ")}</button>
        </div>
      ))}
      {query.data?.data.length === 0 && <p>{t("Nenhuma preferência salva.")}</p>}
      {remove.isError && <p role="alert">{t(remove.error.message)}</p>}
    </section>
  );
}
