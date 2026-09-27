import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationsResponse,
} from '@/features/notifications/api/notifications';

export const notificationsQueryKey = ['notifications'] as const;

export function useNotifications(limit = 30) {
  return useQuery({
    queryKey: [...notificationsQueryKey, limit],
    queryFn: () => getNotifications(limit),

    // Não precisamos fazer polling agressivo no MVP.
    staleTime: 30_000,

    // Quando o usuário volta para a aba, atualizamos naturalmente.
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead(limit = 30) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),

    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<NotificationsResponse>(
        [...notificationsQueryKey, limit],
        (current) => {
          if (!current) return current;

          const notification = current.data.find(
            (item) => item.id === notificationId,
          );

          if (!notification || notification.read) {
            return current;
          }

          return {
            ...current,

            data: current.data.map((item) =>
              item.id === notificationId
                ? {
                    ...item,
                    read: true,
                  }
                : item,
            ),

            meta: {
              ...current.meta,
              unreadCount: Math.max(
                0,
                current.meta.unreadCount - 1,
              ),
            },
          };
        },
      );
    },
  });
}

export function useMarkAllNotificationsAsRead(limit = 30) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(
        [...notificationsQueryKey, limit],
        (current) => {
          if (!current) return current;

          return {
            ...current,

            data: current.data.map((notification) => ({
              ...notification,
              read: true,
            })),

            meta: {
              ...current.meta,
              unreadCount: 0,
            },
          };
        },
      );
    },
  });
}