import { api } from '@/lib/api';

export type UpdateMeInput = {
  name?: string;
  username?: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type DeleteMeInput = {
  password: string;
};

export type UpdateMeResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      avatar: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
};

export function updateMe(data: UpdateMeInput) {
  return api<UpdateMeResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function updatePassword(data: UpdatePasswordInput) {
  return api<{ success: boolean; message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteMe(data: DeleteMeInput) {
  return api<{ success: boolean; message: string }>('/users/me', {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}