import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import {
  followUser,
  getProfile,
  getUserPosts,
  unfollowUser,
  togglePin,
  type ProfileResponse,
  type UserPostsResponse,
} from '../api/profile';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (username: string) => [...profileKeys.all, username] as const,
  posts: (userId: string) => ['user-posts', userId] as const,
};

export function useProfile(username: string) {
  return useQuery<ProfileResponse>({
    queryKey: profileKeys.detail(username),
    queryFn: () => getProfile(username),
    enabled: username.trim().length > 0,
    staleTime: 30_000,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery<UserPostsResponse, Error, InfiniteData<UserPostsResponse>, ReturnType<typeof profileKeys.posts>, string | undefined>({
    queryKey: profileKeys.posts(userId),
    queryFn: ({ pageParam }) => getUserPosts(userId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    enabled: userId.trim().length > 0,
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
}

export function useFollowUser(username: string, userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(targetUserId) : followUser(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(username) });

      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.posts(userId) });
      }
    },
  });
}
