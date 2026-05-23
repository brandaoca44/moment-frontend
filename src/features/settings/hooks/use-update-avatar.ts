import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar, updateAvatarUrl } from '../api/settings';

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const upload = await uploadAvatar(file);
      return updateAvatarUrl(upload.data.url);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}