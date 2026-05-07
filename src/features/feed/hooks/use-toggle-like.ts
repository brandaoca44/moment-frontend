import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike } from '../api/feed';

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}