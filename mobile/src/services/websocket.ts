import AsyncStorage from '@react-native-async-storage/async-storage';

type MessageHandler = (data: any) => void;
type EventHandler = () => void;

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private path: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private onOpenHandlers: Set<EventHandler> = new Set();
  private onCloseHandlers: Set<EventHandler> = new Set();
  private onErrorHandlers: Set<EventHandler> = new Set();
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(path: string) {
    this.path = path;
  }

  async connect() {
    this.intentionalClose = false;
    try {
      const token = await AsyncStorage.getItem('access_token');
      const url = `${WS_BASE_URL}${this.path}${token ? `?token=${token}` : ''}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onOpenHandlers.forEach((h) => h());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach((h) => h(data));
        } catch {
        }
      };

      this.ws.onclose = () => {
        this.onCloseHandlers.forEach((h) => h());
        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.onErrorHandlers.forEach((h) => h());
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: Record<string, any>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return this;
  }

  offMessage(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
    return this;
  }

  onOpen(handler: EventHandler) {
    this.onOpenHandlers.add(handler);
    return this;
  }

  onClose(handler: EventHandler) {
    this.onCloseHandlers.add(handler);
    return this;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
