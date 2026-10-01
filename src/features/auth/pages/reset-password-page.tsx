import { t, useLanguage } from '@/i18n';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { resetPassword } from '../api/password-recovery';
import { RecoveryLayout } from '../components/recovery-layout';

export function ResetPasswordPage() {
  useLanguage();
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const validToken = /^[a-f0-9]{64}$/.test(token);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    if (password !== confirmation) { setError(t("As senhas não coincidem.")); return; }
    if (password.length < 8 || password.length > 64 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(t("Use de 8 a 64 caracteres, com letra maiúscula, minúscula e número.")); return;
    }
    setPending(true);
    try {
      await resetPassword(token, password);
      await queryClient.cancelQueries();
      queryClient.clear();
      window.history.replaceState(window.history.state, '', window.location.pathname);
      setPassword(''); setConfirmation(''); setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Não foi possível redefinir a senha."));
    } finally { setPending(false); }
  }

  return (
    <RecoveryLayout title={complete ? t("Senha redefinida!") : t("Escolha uma nova senha")}
      description={complete ? t("Agora você pode entrar com sua nova senha.") : t("Use uma senha que você não utiliza em outros sites.")}>
      {complete ? (
        <p className="recovery-success" role="status">{t("Sua senha foi alterada e as sessões anteriores foram encerradas.")}</p>
      ) : !validToken ? (
        <div><p className="recovery-error" role="alert">{t("Link inválido ou incompleto. Solicite um novo link.")}</p>
          <Link className="recovery-link" to="/forgot-password">{t("Solicitar novo link")}</Link></div>
      ) : (
        <form className="recovery-form" onSubmit={submit} aria-busy={pending}>
          <label htmlFor="new-password">{t("Nova senha")}</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={64}
            required aria-describedby="password-hint" value={password} onChange={event => setPassword(event.target.value)} />
          <p id="password-hint" className="recovery-hint">{t("De 8 a 64 caracteres, com letra maiúscula, minúscula e número.")}</p>
          <label htmlFor="confirm-password">{t("Confirmar nova senha")}</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={64}
            required value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          {error && <p className="recovery-error" role="alert">{error}</p>}
          <button type="submit" disabled={pending}>{pending ? t("Salvando...") : t("Redefinir senha")}</button>
          <Link className="recovery-link" to="/forgot-password">{t("Solicitar outro link")}</Link>
        </form>
      )}
    </RecoveryLayout>
  );
}
