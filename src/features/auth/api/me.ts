import { api } from '@/lib/api';

export type MeResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      canModerate?: boolean;
      name: string;
      username: string;
      email: string;
      avatar: string | null;
      createdAt: string;
    };
  };
  message: string | null;
};

export function getMe() {
  return api<MeResponse>('/auth/me');
}
