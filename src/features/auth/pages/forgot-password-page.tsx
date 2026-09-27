import { useState, type FormEvent } from 'react';
import { requestPasswordReset } from '../api/password-recovery';
import { RecoveryLayout } from '../components/recovery-layout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      setMessage(await requestPasswordReset(email.trim()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível solicitar o link.');
    } finally { setPending(false); }
  }

  return (
    <RecoveryLayout title="Esqueceu sua senha?" description="Informe o e-mail da sua conta para receber um link de recuperação.">
      {message ? (
        <div role="status">
          <p className="recovery-success">{message}</p>
          <p className="recovery-description">O link vale por 15 minutos. Confira também a pasta de spam.</p>
          <button className="recovery-link" type="button" onClick={() => setMessage('')}>Tentar novamente</button>
        </div>
      ) : (
        <form className="recovery-form" onSubmit={submit} aria-busy={pending}>
          <label htmlFor="recovery-email">E-mail</label>
          <input id="recovery-email" type="email" autoComplete="email" maxLength={120} required
            value={email} onChange={event => setEmail(event.target.value)} />
          {error && <p className="recovery-error" role="alert">{error}</p>}
          <button type="submit" disabled={pending}>{pending ? 'Solicitando...' : 'Enviar link de recuperação'}</button>
        </form>
      )}
    </RecoveryLayout>
  );
}
