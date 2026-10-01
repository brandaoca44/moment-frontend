import { t } from '@/i18n';
import type { MeResponse } from './me';
import { getLanguage } from '@/i18n';

export type RegisterInput = {
  birthDate: string;
  acceptedTerms: boolean;
  termsVersion: string;
  name: string;
  username: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterInput) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Moment-Client': 'web' },
    body: JSON.stringify({ ...data, language: getLanguage() }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(t(json?.message || t("Não foi possível criar a conta.")));
  }

  return json as MeResponse;
}
