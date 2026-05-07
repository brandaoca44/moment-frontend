import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeed, getFollowingFeed, type FeedResponse } from '../api/feed';

export function useFeed(type: 'global' | 'following' = 'global') {
  return useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', type],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      return type === 'following' ? getFollowingFeed(cursor) : getFeed(cursor);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
  });
}