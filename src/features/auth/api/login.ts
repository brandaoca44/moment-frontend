import { t } from '@/i18n';
import type { MeResponse } from './me';

export type LoginInput = {
  email: string;
  password: string;
};

export async function login(data: LoginInput) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Moment-Client': 'web' },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(t(json?.message || t("E-mail ou senha incorretos.")));
  }

  return json as MeResponse;
}
