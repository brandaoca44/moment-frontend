import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMe } from '../api/settings';

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
    },
  });
}