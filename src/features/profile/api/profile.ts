import { api } from '@/lib/api';

export type ProfileUser = {
  emailConfirmedAt?: string | null;
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    follows: number;
  };
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  pinnedPostId?: string | null;
};

export type ProfilePost = {
  commentsEnabled: boolean;
  source?: string | null;
  editedAt?: string | null;
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  moderationStatus: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  _count: {
    replies?: number;
    likes: number;
    remonts: number;
  };
  liked?: boolean;
  remonted?: boolean;
};

export type ProfileResponse = {
  success: boolean;
  data: { user: ProfileUser };
  message: string | null;
};

export type UserPostsResponse = {
  success: boolean;
  data: ProfilePost[];
  message?: string | null;
  meta?: {
    nextCursor?: string | null;
    hasMore: boolean;
  };
};

export type FollowResponse = {
  success: boolean;
  data?: {
    isFollowing?: boolean;
  };
  message?: string | null;
};

export function getProfile(username: string) {
  return api<ProfileResponse>(`/users/${encodeURIComponent(username)}/profile`);
}

export function getUserPosts(userId: string, cursor?: string) {
  const params = new URLSearchParams({ userId, limit: '50' });

  if (cursor) {
    params.set('cursor', cursor);
  }

  return api<UserPostsResponse>(`/posts?${params.toString()}`);
}

export function followUser(userId: string) {
  return api<FollowResponse>(`/users/${userId}/follow`, { method: 'POST' });
}

export function unfollowUser(userId: string) {
  return api<FollowResponse>(`/users/${userId}/follow`, { method: 'DELETE' });
}

export function togglePin(postId: string) {
  return api<{ success: boolean; data: { pinned: boolean } }>(
    `/posts/${postId}/pin`,
    { method: 'POST' },
  );
}
