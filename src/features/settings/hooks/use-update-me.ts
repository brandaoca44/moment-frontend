import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMe } from '../api/settings';
import type { MeResponse } from '@/features/auth/api/me';

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData<MeResponse>(['auth', 'me'], previous => previous && data.data?.user ? {
        ...previous, data: {...previous.data,user:{...previous.data.user,...data.data.user,staffRole:previous.data.user.staffRole}},
      } : previous);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-links'] });
    },
  });
}
