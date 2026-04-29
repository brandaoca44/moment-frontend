import { api } from '@/lib/api';

export function logout() {
  return api('/auth/logout', {
    method: 'POST',
  });
}