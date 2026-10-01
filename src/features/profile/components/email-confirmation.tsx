import { t, useLanguage } from '@/i18n';
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function EmailConfirmation() {
  useLanguage();
  const [token, setToken] = useState("");
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["email-confirmation"],
    queryFn: () =>
      api<{ data: { confirmed: boolean; available: boolean } }>(
        "/auth/email-confirmation",
      ),
  });
  const mutation = useMutation({
    mutationFn: (confirm: boolean) =>
      api<{ message: string }>(
        `/auth/email-confirmation/${confirm ? "confirm" : "request"}`,
        {
          method: "POST",
          ...(confirm ? { body: JSON.stringify({ token: token.trim() }) } : {}),
        },
      ),
    onSuccess: async () => {
      setToken("");
      await client.invalidateQueries();
    },
  });
  return (
    <section className="settings-preference-group">
      <h3>{t("Confirmação de e-mail")}</h3>
      <p>
        {t(" Confirma o acesso ao e-mail cadastrado. Não é um selo de identidade ou de bom comportamento. ")}</p>
      {query.isError && <p role="alert">{t(query.error.message)}</p>}
      {query.data?.data.confirmed ? (
        <p>{t("E-mail confirmado.")}</p>
      ) : query.data?.data.available ? (
        <>
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(false)}
          >
            {t(" Solicitar código de teste ")}</button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(true);
            }}
          >
            <label>
              {t(" Código recebido ")}<input
                type="text"
                style={{ width: "100%", minWidth: 0 }}
                autoComplete="off"
                value={token}
                maxLength={64}
                onChange={(e) => setToken(e.target.value)}
              />
            </label>
            <button
              disabled={
                mutation.isPending || !/^[a-f0-9]{64}$/.test(token.trim())
              }
            >
              {t(" Confirmar e-mail ")}</button>
          </form>
        </>
      ) : (
        query.isSuccess && (
          <p>
            {t(" O envio de confirmação ainda não está disponível neste ambiente. ")}</p>
        )
      )}
      {mutation.isError && <p role="alert">{t(mutation.error.message)}</p>}
      {mutation.isSuccess && <p role="status">{t(mutation.data.message)}</p>}
    </section>
  );
}
