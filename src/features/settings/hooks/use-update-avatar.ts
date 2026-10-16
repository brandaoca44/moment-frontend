import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar, updateAvatarUrl } from '../api/settings';
import type { MeResponse } from '@/features/auth/api/me';

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const upload = await uploadAvatar(file);
      return updateAvatarUrl(upload.data.url);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<MeResponse>(['auth', 'me'], previous => previous && data.data?.user ? {
        ...previous, data: {...previous.data,user:{...previous.data.user,...data.data.user,staffRole:previous.data.user.staffRole}},
      } : previous);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
