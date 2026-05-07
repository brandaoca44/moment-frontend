import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleRemont } from '../api/feed';

export function useToggleRemont() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleRemont,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}