import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketManager } from '../services/websocket';

interface UseChatSocketOptions {
  conversationId?: string | null;
  onNewMessage?: (data: any) => void;
  onMessageSent?: (data: any) => void;
  onTyping?: (data: any) => void;
  enabled?: boolean;
}

export function useChatSocket({
  conversationId,
  onNewMessage,
  onMessageSent,
  onTyping,
  enabled = true,
}: UseChatSocketOptions = {}) {
  const wsRef = useRef<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocketManager('/ws/chat/');
    wsRef.current = ws;

    ws.onOpen(() => setIsConnected(true));
    ws.onClose(() => setIsConnected(false));

    ws.onMessage((data) => {
      if (data.type === 'new_message') {
        onNewMessage?.(data);
      } else if (data.type === 'message_sent') {
        onMessageSent?.(data);
      } else if (data.type === 'typing') {
        onTyping?.(data);
      }
    });

    ws.connect();

    return () => {
      ws.disconnect();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  const sendMessage = useCallback((content: string) => {
    if (!conversationId) return;
    wsRef.current?.send({ action: 'send_message', conversation_id: conversationId, content });
  }, [conversationId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;
    wsRef.current?.send({ action: 'typing', conversation_id: conversationId, is_typing: isTyping });
  }, [conversationId]);

  const markRead = useCallback(() => {
    if (!conversationId) return;
    wsRef.current?.send({ action: 'mark_read', conversation_id: conversationId });
  }, [conversationId]);

  return { sendMessage, sendTyping, markRead, isConnected };
}
