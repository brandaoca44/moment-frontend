import { api } from '@/lib/api';
import type { Post, PostUser } from '@/features/feed/api/feed';

export type SearchResponse = {
  users: Array<PostUser>;
  posts: Post[];
  meta: { query: string; limit: number };
};

export function searchMoment(query: string, limit = 10) {
  return api<SearchResponse>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}
