import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePin } from '../api/feed';

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
}
