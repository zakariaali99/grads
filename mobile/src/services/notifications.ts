import api from '../lib/api';
import { withOfflineFallback } from './offline';
import { mockNotifications } from '../data/mockData';

export interface NotificationItem {
  id: string;
  recipient?: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationItem[];
}

export const notificationService = {
  list: (params?: Record<string, any>) =>
    withOfflineFallback(
      () => api.get<NotificationListResponse>('/notifications/', { params }),
      { count: mockNotifications.length, next: null, previous: null, results: mockNotifications },
    ),
  unreadCount: () =>
    withOfflineFallback(
      () => api.get<{ count: number }>('/notifications/unread-count/'),
      { count: mockNotifications.filter(n => !n.is_read).length },
    ),
  markRead: (id: string) =>
    api.post(`/notifications/${id}/mark-read/`),
  markAllRead: () =>
    api.post('/notifications/mark-all-read/'),
};
