const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function postRecovery(path: string, body: Record<string, string>): Promise<string> {
  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    referrerPolicy: 'no-referrer',
  });
  const result = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(result?.message || 'Não foi possível concluir a solicitação. Tente novamente.');
  }
  return result?.message || 'Solicitação concluída.';
}

export const requestPasswordReset = (email: string) => postRecovery('forgot-password', { email });
export const resetPassword = (token: string, newPassword: string) =>
  postRecovery('reset-password', { token, newPassword });
