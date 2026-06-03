class WebSocketManager {
  private ws: WebSocket | null = null
  private path = ''
  private token = ''
  private reconnectAttempts = 0
  private maxReconnectDelay = 8000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false

  private onMessageCallback?: (data: any) => void
  private onNotificationCallback?: (data: any) => void
  private onOpenCallback?: () => void
  private onCloseCallback?: () => void
  private onErrorCallback?: (event: Event) => void

  connect(path: string, token: string) {
    this.path = path
    this.token = token
    this.intentionalClose = false
    this.createConnection()
  }

  private createConnection() {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    const url = `${baseUrl}${this.path}?token=${this.token}`

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.onOpenCallback?.()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        this.onMessageCallback?.(data)
        if (data.type === 'notification') {
          this.onNotificationCallback?.(data)
        }
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.onCloseCallback?.()
      if (!this.intentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (event: Event) => {
      this.onErrorCallback?.(event)
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      this.maxReconnectDelay
    )
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.createConnection()
    }, delay)
  }

  send(data: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    this.intentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  onMessage(cb: (data: any) => void) {
    this.onMessageCallback = cb
    return this
  }

  onNotification(cb: (data: any) => void) {
    this.onNotificationCallback = cb
    return this
  }

  onOpen(cb: () => void) {
    this.onOpenCallback = cb
    return this
  }

  onClose(cb: () => void) {
    this.onCloseCallback = cb
    return this
  }

  onError(cb: (event: Event) => void) {
    this.onErrorCallback = cb
    return this
  }
}

export default WebSocketManager
