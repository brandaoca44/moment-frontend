import { api } from '@/lib/api';

export type PostUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
};

export type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  moderationStatus: string;
  createdAt: string;
  updatedAt: string;
  user: PostUser;
  mentions: Array<{ user: PostUser }>;
  _count: {
    likes: number;
    remonts: number;
  };
};

export type FeedResponse = {
  success: boolean;
  data: Post[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

export type CreatePostInput = {
  content: string;
  imageUrl?: string;
};

export function getFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}&limit=10` : '?limit=10';
  return api<FeedResponse>(`/posts${params}`);
}

export function getFollowingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}&limit=10` : '?limit=10';
  return api<FeedResponse>(`/posts/following${params}`);
}

export function createPost(data: CreatePostInput) {
  return api<{ success: boolean; data: Post }>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function toggleLike(postId: string) {
  return api<{ success: boolean; data: { liked: boolean; likesCount: number } }>(
    `/posts/${postId}/like`,
    { method: 'POST' },
  );
}

export function toggleRemont(postId: string) {
  return api<{ success: boolean; data: { remonted: boolean; remontsCount: number } }>(
    `/posts/${postId}/remont`,
    { method: 'POST' },
  );
}