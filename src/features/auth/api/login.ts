import { api } from '@/lib/api';
import type { MeResponse } from './me';

export type LoginInput = {
  email: string;
  password: string;
};

export function login(data: LoginInput) {
  return api<MeResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}