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
  editedAt?: string | null;
  user: PostUser;
  mentions: Array<{ user: PostUser }>;
  _count: {
    replies?: number;
    likes: number;
    remonts: number;
  };
  liked?: boolean;
  remonted?: boolean;
};

export type Reply = {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
};

export function getPost(id: string) {
  return api<{ data: Post }>(`/posts/${encodeURIComponent(id)}`);
}

export function getReplies(id: string, cursor?: string) {
  const query = new URLSearchParams({ limit: '20' });
  if (cursor) query.set('cursor', cursor);
  return api<{ data: Reply[]; meta: { hasMore: boolean; nextCursor: string | null } }>(`/posts/${encodeURIComponent(id)}/replies?${query}`);
}

export function createReply(id: string, content: string) {
  return api<{ data: Reply; message: string }>(`/posts/${encodeURIComponent(id)}/replies`, { method: 'POST', body: JSON.stringify({ content }) });
}

export function deleteReply(postId: string, replyId: string) {
  return api(`/posts/${encodeURIComponent(postId)}/replies/${encodeURIComponent(replyId)}`, { method: 'DELETE' });
}

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

export async function uploadPostImage(file: File) {
  const body = new FormData();
  body.append('file', file);
  const response = await api<{ data: { url: string } }>('/upload/post-image', {
    method: 'POST', body,
  });
  if (!response.data?.url) throw new Error('O servidor não retornou a imagem enviada.');
  return response.data.url;
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

export function deletePost(postId: string) {
  return api<{ message: string }>(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export function togglePin(postId: string) {
  return api<{ success: boolean; data: { pinned: boolean } }>(
    `/posts/${postId}/pin`,
    { method: 'POST' },
  );
}

export function updatePost(postId: string, content: string) {
  return api<{ data: Post }>(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ content }) });
}
