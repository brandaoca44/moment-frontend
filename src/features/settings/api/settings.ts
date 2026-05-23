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

export type SettingsUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMeResponse = {
  success: boolean;
  data: {
    user: SettingsUser;
  };
  message: string;
};

export function updateMe(data: UpdateMeInput) {
  return api<UpdateMeResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return api<{ success: boolean; data: { url: string } }>('/upload/avatar', {
    method: 'POST',
    body: formData,
  });
}

export function updateAvatarUrl(url: string) {
  return api<UpdateMeResponse>('/users/me/avatar', {
    method: 'PATCH',
    body: JSON.stringify({ url }),
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
