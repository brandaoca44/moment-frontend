import { api } from '@/lib/api';

export type ProfileUser = {
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
};

export type ProfilePost = {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  moderationStatus: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  _count: {
    likes: number;
    remonts: number;
  };
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
    hasNextPage: boolean;
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
  const params = new URLSearchParams({ userId });

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
