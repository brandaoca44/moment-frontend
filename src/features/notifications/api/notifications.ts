import { api } from '@/lib/api';

export type NotificationActor = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
};

export type NotificationPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
};

export type MomentNotification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  postId: string | null;
  actorId: string;
  actor: NotificationActor;
  post: NotificationPost | null;
};

export type NotificationsResponse = {
  data: MomentNotification[];
  meta: {
    unreadCount: number;
    limit: number;
  };
};

export type NotificationActionResponse = {
  message: string;
  updatedCount?: number;
};

export function getNotifications(limit = 30) {
  return api<NotificationsResponse>(
    `/notifications?limit=${encodeURIComponent(String(limit))}`,
  );
}

export function markNotificationAsRead(notificationId: string) {
  return api<NotificationActionResponse>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PATCH',
    },
  );
}

export function markAllNotificationsAsRead() {
  return api<NotificationActionResponse>('/notifications/read-all', {
    method: 'PATCH',
  });
}