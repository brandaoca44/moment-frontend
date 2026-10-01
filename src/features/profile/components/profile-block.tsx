import { t, useLanguage } from '@/i18n';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import "./profile-actions.css";

type Blocked = {
  id: string;
  user: { id: string; name: string; username: string };
};

export function ProfileBlock({
  userId,
  name,
}: {
  userId?: string;
  name?: string;
}) {
  useLanguage();
  const client = useQueryClient();
  const list = useQuery({
    queryKey: ["blocked-profiles"],
    queryFn: () => api<{ data: Blocked[] }>("/block"),
  });
  const mutation = useMutation({
    mutationFn: ({ id, remove }: { id: string; remove: boolean }) =>
      api(`/block/${encodeURIComponent(id)}`, {
        method: remove ? "DELETE" : "POST",
      }),
    onSuccess: async () => {
      await client.invalidateQueries();
    },
  });
  const blocked = list.data?.data.some((item) => item.user.id === userId);
  if (userId)
    return (
      <div className="profile-inline-action">
        <button
          type="button"
          className="profile-quiet-button"
          disabled={!list.isSuccess || mutation.isPending}
          onClick={() => {
            if (
              blocked ||
              confirm(
                t('Bloquear {name}? Vocês deixarão de seguir um ao outro e não poderão interagir. Você pode desfazer em Configurações.', { name: name ?? t('este perfil') }),
              )
            )
              mutation.mutate({ id: userId, remove: !!blocked });
          }}
        >
          {mutation.isPending
            ? t("Aguarde...")
            : blocked
              ? t("Desbloquear")
              : t("Bloquear")}
        </button>
        {(list.isError || mutation.isError) && (
          <small role="alert">
            {mutation.error?.message ??
              t("Não foi possível consultar os bloqueios.")}
          </small>
        )}
      </div>
    );
  return (
    <section className="settings-preference-group">
      <h3>{t("Perfis bloqueados")}</h3>
      {list.isPending && <p role="status">{t("Carregando...")}</p>}
      {list.isError && (
        <p role="alert">{t("Não foi possível consultar os bloqueios.")}</p>
      )}
      {!userId &&
        list.data?.data.map((item) => (
          <div className="station-controls" key={item.id}>
            <span>
              {item.user.name} · @{item.user.username}
            </span>
            <button
              className="profile-button secondary"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ id: item.user.id, remove: true })
              }
            >
              {t(" Desbloquear ")}</button>
          </div>
        ))}
      {!userId && list.data?.data.length === 0 && (
        <p>{t("Nenhum perfil bloqueado.")}</p>
      )}
      {mutation.isError && <p role="alert">{t(mutation.error.message)}</p>}
      {mutation.isSuccess && (
        <p role="status">{t("Preferência de bloqueio atualizada.")}</p>
      )}
    </section>
  );
}
