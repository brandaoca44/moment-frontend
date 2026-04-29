import { api } from '@/lib/api';
import type { MeResponse } from './me';

export type RegisterInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export function registerUser(data: RegisterInput) {
  return api<MeResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}