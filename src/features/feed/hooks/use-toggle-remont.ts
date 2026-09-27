import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleRemont } from '../api/feed';

export function useToggleRemont() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleRemont,
    onSuccess: (result, postId) => {
      const update = (old: any) => {
        if (!old) return old;
        const patchPost = (post: any) => post.id === postId
          ? { ...post, remonted: result.data.remonted, _count: { ...post._count, remonts: result.data.remontsCount } }
          : post;
        if (Array.isArray(old.pages)) {
          return { ...old, pages: old.pages.map((page: any) => ({ ...page, data: page.data.map(patchPost) })) };
        }
        if (Array.isArray(old.data)) return { ...old, data: old.data.map(patchPost) };
        return old;
      };
      queryClient.setQueriesData({ queryKey: ['feed'] }, update);
      queryClient.setQueriesData({ queryKey: ['user-posts'] }, update);
      queryClient.setQueriesData({ queryKey: ['explore'] }, update);
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    },
  });
}
