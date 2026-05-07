import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/feed';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}