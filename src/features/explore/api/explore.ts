import { api } from '@/lib/api';
import type { FeedResponse, PostUser } from '@/features/feed/api/feed';

export type SuggestedUser = PostUser & {
  followersCount: number;
  mutualCount: number;
};

export type SuggestionsResponse = {
  data: SuggestedUser[];
  meta: { limit: number; count: number };
};

export function getSuggestions(limit = 20) {
  return api<SuggestionsResponse>(`/users/suggestions?limit=${limit}`);
}

export function getExplorePosts() {
  return api<FeedResponse>('/posts?limit=30');
}
