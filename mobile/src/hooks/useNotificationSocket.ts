import { useEffect, useRef, useCallback } from 'react';
import { WebSocketManager } from '../services/websocket';

interface UseNotificationSocketOptions {
  onNotification?: (data: any) => void;
  onUnreadCount?: (count: number) => void;
  enabled?: boolean;
}

export function useNotificationSocket({
  onNotification,
  onUnreadCount,
  enabled = true,
}: UseNotificationSocketOptions = {}) {
  const wsRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocketManager('/ws/notifications/');
    wsRef.current = ws;

    ws.onMessage((data) => {
      if (data.type === 'new_notification') {
        onNotification?.(data);
      } else if (data.type === 'unread_count') {
        onUnreadCount?.(data.count);
      }
    });

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [enabled]);

  const markRead = useCallback((notificationId: string) => {
    wsRef.current?.send({ action: 'mark_read', notification_id: notificationId });
  }, []);

  const markAllRead = useCallback(() => {
    wsRef.current?.send({ action: 'mark_all_read' });
  }, []);

  return { markRead, markAllRead };
}
