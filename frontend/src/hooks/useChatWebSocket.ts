'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WebSocketManager from '@/lib/websocket'
import type { Message } from '@/lib/types'

interface UseChatWebSocketReturn {
  messages: Message[]
  sendMessage: (text: string) => void
  isConnected: boolean
  typingUsers: string[]
}

export default function useChatWebSocket(
  conversationId: string | null
): UseChatWebSocketReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocketManager | null>(null)

  useEffect(() => {
    setMessages([])
    setTypingUsers([])

    if (!conversationId) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    const ws = new WebSocketManager()
    wsRef.current = ws

    ws.onOpen(() => setIsConnected(true))
    ws.onClose(() => setIsConnected(false))

    ws.onMessage((data) => {
      switch (data.type) {
        case 'send_message':
          setMessages((prev) => [...prev, data.message])
          break
        case 'mark_read':
          setMessages((prev) =>
            prev.map((m) =>
              data.message_ids?.includes(m.id) ? { ...m, is_read: true } : m
            )
          )
          break
        case 'typing':
          if (data.is_typing) {
            setTypingUsers((prev) =>
              prev.includes(data.user_id) ? prev : [...prev, data.user_id]
            )
          } else {
            setTypingUsers((prev) => prev.filter((id) => id !== data.user_id))
          }
          break
        case 'room_joined':
          if (data.messages) {
            setMessages(data.messages)
          }
          break
      }
    })

    ws.connect('/ws/chat/', token)

    ws.send({ type: 'join_room', conversation_id: conversationId })

    return () => {
      ws.send({ type: 'leave_room', conversation_id: conversationId })
      ws.disconnect()
      wsRef.current = null
    }
  }, [conversationId])

  const sendMessage = useCallback(
    (text: string) => {
      const ws = wsRef.current
      if (!ws || !conversationId) return
      ws.send({
        type: 'send_message',
        conversation_id: conversationId,
        content: text,
      })
    },
    [conversationId]
  )

  return { messages, sendMessage, isConnected, typingUsers }
}
