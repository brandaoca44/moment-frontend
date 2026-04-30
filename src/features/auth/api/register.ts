import type { MeResponse } from './me';

export type RegisterInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterInput) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Não foi possível criar a conta.');
  }

  return json as MeResponse;
}