'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { chatService } from '@/lib/api-services'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import WebSocketManager from '@/lib/websocket'
import api from '@/lib/api'
import type { Conversation, Message } from '@/lib/types'
import {
  MessageSquare, Search, Send, ChevronLeft, MoreVertical,
  Phone, Video, CheckCheck, Check, Plus, X, Loader2, User
} from 'lucide-react'

interface ChatMessagesProps {
  role: 'graduate' | 'employer'
}

export default function ChatMessages({ role }: ChatMessagesProps) {
  const { t, dir, locale } = useTranslation()
  const { user } = useAuthStore()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewConvModal, setShowNewConvModal] = useState(false)
  const [recipientQuery, setRecipientQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null)
  const [firstMessage, setFirstMessage] = useState('')
  const [creatingConv, setCreatingConv] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocketManager | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await chatService.getConversations()
      const data: Conversation[] = Array.isArray(res.data) ? res.data : []
      setConversations(data.sort((a, b) => {
        const aTime = a.last_message_at || a.created_at
        const bTime = b.last_message_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      }))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true)
    try {
      const res = await chatService.getMessages(convId)
      const arr: Message[] = Array.isArray(res.data) ? res.data : []
      setMessages(arr)
    } catch {
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  const selectConversation = (id: string) => {
    setSelectedId(id)
    setMobileView('chat')
    fetchMessages(id)
  }

  const backToList = () => {
    setMobileView('list')
    setSelectedId(null)
    setMessages([])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setTypingUsers([])
    if (!selectedId) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    const ws = new WebSocketManager()
    wsRef.current = ws

    ws.onMessage((data) => {
      switch (data.type) {
        case 'send_message':
          setMessages((prev) => [...prev, data.message])
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? { ...c, last_message: { content: data.message.content, sender: data.message.sender, created_at: data.message.created_at }, last_message_at: data.message.created_at }
                : c
            )
          )
          break
        case 'mark_read':
          setMessages((prev) =>
            prev.map((m) =>
              data.message_ids?.includes(m.id) ? { ...m, is_read: true } : m
            )
          )
          break
        case 'typing':
          if (data.user_id !== user?.id) {
            if (data.is_typing) {
              setTypingUsers((prev) =>
                prev.includes(data.user_id) ? prev : [...prev, data.user_id]
              )
            } else {
              setTypingUsers((prev) => prev.filter((id) => id !== data.user_id))
            }
          }
          break
      }
    })

    ws.onOpen(() => {
      ws.send({ type: 'join_room', conversation_id: selectedId })
    })

    ws.connect('/ws/chat/', token)

    return () => {
      ws.send({ type: 'leave_room', conversation_id: selectedId })
      ws.disconnect()
      wsRef.current = null
    }
  }, [selectedId, user?.id])

  useEffect(() => {
    if (!messages.length || !selectedId || !wsRef.current) return
    const unreadIds = messages
      .filter((m) => !m.is_read && m.sender !== user?.id)
      .map((m) => m.id)
    if (unreadIds.length > 0) {
      wsRef.current.send({ type: 'mark_read', message_ids: unreadIds })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, last_message: c.last_message ? { ...c.last_message, sender: c.last_message.sender } : null } : c
        )
      )
    }
  }, [messages, selectedId, user?.id])

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !selectedId) return
    setSending(true)
    const tempText = text
    setInputText('')
    try {
      const res = await chatService.sendMessage({ conversation: selectedId, content: tempText })
      if (res.data) {
        setMessages((prev) => [...prev, res.data])
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, last_message: { content: tempText, sender: user?.id || '', created_at: new Date().toISOString() }, last_message_at: new Date().toISOString() }
            : c
        )
      )
    } catch {
      setInputText(tempText)
    }
    setSending(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    if (!wsRef.current || !selectedId) return
    wsRef.current.send({ type: 'typing', conversation_id: selectedId, is_typing: true })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      wsRef.current?.send({ type: 'typing', conversation_id: selectedId, is_typing: false })
    }, 2000)
  }

  useEffect(() => {
    if (recipientQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/search/users/', { params: { q: recipientQuery } })
        const data = Array.isArray(res.data) ? res.data : res.data?.results || []
        setSearchResults(data)
      } catch {
        try {
          const res = await api.post('/search/global/', { query: recipientQuery, page_size: 10 })
          const data = res.data?.results || []
          const filtered = data.filter((item: any) => item.type === 'user' || item.user_type || item.id)
          setSearchResults(filtered.length > 0 ? filtered : data)
        } catch {
          setSearchResults([])
        }
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [recipientQuery])

  const handleCreateConversation = async () => {
    if (!selectedRecipient || !firstMessage.trim()) return
    setCreatingConv(true)
    try {
      const res = await chatService.createConversation({
        participants: [selectedRecipient.id || selectedRecipient.user?.id],
      })
      const conv = res.data
      await chatService.sendMessage({ conversation: conv.id, content: firstMessage.trim() })
      setShowNewConvModal(false)
      setSelectedRecipient(null)
      setFirstMessage('')
      setRecipientQuery('')
      await fetchConversations()
      setSelectedId(conv.id)
    } catch {
      setCreatingConv(false)
    }
    setCreatingConv(false)
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.participant_names?.join(' ') || ''
    const subject = conv.subject || ''
    const q = searchQuery
    if (!q) return true
    return name.toLowerCase().includes(q.toLowerCase()) || subject.toLowerCase().includes(q.toLowerCase())
  })

  const getOtherName = (conv: Conversation) => {
    if (!user) return conv.participant_names?.[0] || ''
    const others = conv.participant_names?.filter((n) => n !== user.full_name) || []
    return others[0] || conv.participant_names?.[0] || ''
  }

  const getInitial = (name: string) => name?.[0] || '?'

  const formatConvTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) {
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return t('messages.just_now')
      return d.toLocaleTimeString(locale === 'en' ? 'en-US' : 'ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
    if (days === 1) return t('yesterday')
    if (days < 7) {
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { weekday: 'short' })
    }
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'short' })
  }

  const formatMsgTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (Math.floor(diff / 60000) < 1) return t('messages.just_now')
    return d.toLocaleTimeString(locale === 'en' ? 'en-US' : 'ar-SA', { hour: '2-digit', minute: '2-digit' })
  }

  const LoadingSkeleton = () => (
    <div className="space-y-1 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-3">
      {/* Conversation List */}
      <div className={cn(
        "w-full sm:w-80 lg:w-96 flex-shrink-0 glass-card flex flex-col",
        mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('messages.title')}
            </h2>
            <button
              onClick={() => setShowNewConvModal(true)}
              className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
              title={t('messages.new_conversation')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", dir === 'rtl' ? 'right-3' : 'left-3')} />
            <input
              type="text"
              placeholder={t('messages.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("input-field py-2 text-sm", dir === 'rtl' ? 'pr-10' : 'pl-10')}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button onClick={fetchConversations} className="btn-primary text-sm py-2 px-4">
                {t('retry')}
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('messages.no_conversations')}
              </p>
              <button
                onClick={() => setShowNewConvModal(true)}
                className="mt-4 btn-primary text-sm py-2 px-4"
              >
                <Plus className="w-4 h-4" />
                {t('messages.new_conversation')}
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === selectedId
              const otherName = getOtherName(conv)
              const unreadCount = conv.last_message && conv.last_message.sender !== user?.id
                ? messages.filter((m) => m.conversation === conv.id && !m.is_read && m.sender !== user?.id).length
                : 0
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    "w-full text-right p-4 transition-all hover:bg-gray-50 dark:hover:bg-navy-800/50 flex items-start gap-3",
                    isActive ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'border-b border-gray-100 dark:border-gray-800'
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {getInitial(otherName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn("text-sm truncate", unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-900 dark:text-white')}>
                        {otherName}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                        {formatConvTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.subject && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {conv.subject}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={cn("text-xs truncate flex-1 min-w-0 text-right", unreadCount > 0 ? 'font-semibold text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400')}>
                        {conv.last_message ? (
                          <>
                            {conv.last_message.sender === user?.id && (
                              <span className="text-gray-400">{t('messages.you')}: </span>
                            )}
                            {conv.last_message.content}
                          </>
                        ) : (
                          <span className="text-gray-400">{t('no_messages')}</span>
                        )}
                      </p>
                      {unreadCount > 0 && (
                        <span className="shrink-0 mr-2 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 glass-card flex flex-col overflow-hidden",
        mobileView === 'list' ? 'hidden sm:flex' : 'flex'
      )}>
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={backToList}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {getInitial(getOtherName(selectedConv))}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {getOtherName(selectedConv)}
                  </h3>
                  {selectedConv.subject && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selectedConv.subject}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors hidden sm:flex" title={t('call')}>
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors hidden sm:flex" title={t('video_call')}>
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-navy-800 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_messages')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('messages.type_message')}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === user?.id
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl break-words",
                          isMe
                            ? "bg-primary-500 text-white rounded-bl-lg"
                            : "bg-gray-100 dark:bg-navy-800 text-gray-900 dark:text-gray-100 rounded-br-lg"
                        )}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium text-primary-500 dark:text-primary-400 mb-1">
                            {msg.sender_name || getOtherName(selectedConv)}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-start" : "justify-end")}>
                          <span className={cn("text-xs", isMe ? "text-white/70" : "text-gray-400")}>
                            {formatMsgTime(msg.created_at)}
                          </span>
                          {isMe && (msg.is_read
                            ? <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                            : <Check className="w-3.5 h-3.5 text-white/50" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {typingUsers.length > 0 && (
                <div className="flex justify-end">
                  <div className="bg-gray-100 dark:bg-navy-800 rounded-2xl rounded-br-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('messages.typing')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('messages.type_message')}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="input-field py-2.5 flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  className="btn-primary p-2.5 disabled:opacity-40"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('messages.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              {t('messages.no_conversation_selected')}
            </p>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNewConvModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">{t('messages.new_conversation')}</h3>
              <button onClick={() => setShowNewConvModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('messages.select_recipient')}
                </label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", dir === 'rtl' ? 'right-3' : 'left-3')} />
                  <input
                    type="text"
                    placeholder={t('messages.search')}
                    value={recipientQuery}
                    onChange={(e) => {
                      setRecipientQuery(e.target.value)
                      setSelectedRecipient(null)
                    }}
                    className={cn("input-field py-2 text-sm", dir === 'rtl' ? 'pr-10' : 'pl-10')}
                  />
                </div>
                {searchResults.length > 0 && !selectedRecipient && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    {searchResults.map((person: any) => (
                      <button
                        key={person.id || person.user?.id}
                        onClick={() => {
                          setSelectedRecipient(person)
                          setRecipientQuery(person.full_name || person.username || person.name || '')
                          setSearchResults([])
                        }}
                        className="w-full text-right px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-navy-700 flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                          {getInitial(person.full_name || person.username || person.name || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                            {person.full_name || person.username || person.name || ''}
                          </p>
                          {(person.user_type || person.type) && (
                            <p className="text-[11px] text-gray-400 truncate">
                              {person.user_type || person.type}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {recipientQuery.length >= 2 && searchResults.length === 0 && !selectedRecipient && (
                  <p className="text-xs text-gray-400 mt-1">{t('no_results')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('messages.type_message')}
                </label>
                <textarea
                  placeholder={t('messages.type_message')}
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  rows={3}
                  className="input-field resize-none py-2 text-sm"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowNewConvModal(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={!selectedRecipient || !firstMessage.trim() || creatingConv}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
              >
                {creatingConv && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('messages.start_conversation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
