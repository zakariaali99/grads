'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Search, Send, CheckCheck, MoreVertical, Phone, Video,
  Loader2, AlertCircle, MessageCircle,
} from 'lucide-react'
import { chatService } from '@/lib/api-services'
import type { Conversation, Message } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function MessagesPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchConversations()
  }, [isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const extractArray = (data: any): any[] => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  }

  const fetchConversations = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await chatService.getConversations()
      const items = extractArray(data)
      setConversations(items)
      if (items.length > 0) {
        setActiveConversationId(items[0].id)
      }
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const { data } = await chatService.getMessages(conversationId)
      setMessages(extractArray(data))
    } catch {
      setError(t('error'))
    } finally {
      setMessagesLoading(false)
    }
  }

  const selectConversation = (id: string) => {
    setActiveConversationId(id)
    fetchMessages(id)
  }

  const handleSend = async () => {
    if (!messageInput.trim() || !activeConversationId || !user) return
    const text = messageInput.trim()
    setMessageInput('')
    setSending(true)
    try {
      const { data } = await chatService.sendMessage({
        conversation: activeConversationId,
        content: text,
      })
      setMessages((prev) => [...prev, data])
      setConversations((prev) => prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, last_message: { content: text, sender: user.id, created_at: new Date().toISOString() } }
          : c
      ))
    } catch {
      setError(t('error'))
    } finally {
      setSending(false)
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  const getOtherName = (conv: Conversation) => {
    if (!user) return conv.participant_names?.[0] || t('conversation')
    const others = conv.participant_names?.filter((n) => n !== user.full_name) || []
    return others[0] || conv.participant_names?.[0] || t('conversation')
  }

  const getOtherInitial = (conv: Conversation) => {
    return getOtherName(conv)[0] || '?'
  }

  const filtered = conversations.filter((c) =>
    getOtherName(c).includes(searchQuery) || c.subject?.includes(searchQuery)
  )

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) {
      const hours = d.getHours()
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'م' : 'ص'
      const h12 = hours % 12 || 12
      return `${h12}:${minutes} ${ampm}`
    }
    if (days === 1) return t('yesterday')
    if (days < 7) {
      const names = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      return names[d.getDay()]
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatMsgTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'م' : 'ص'
    const h12 = hours % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="employer">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('employer.messages.title')}</h1>

      {error && (
        <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('no_conversations')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('when_you_contact_candidate')}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pr-10 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map((conv) => {
                const isActive = conv.id === activeConversationId
                const otherName = getOtherName(conv)
                const initial = getOtherInitial(conv)
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full text-right p-4 transition-colors hover:bg-gray-50 dark:hover:bg-navy-800 ${
                      isActive ? 'bg-primary-50 dark:bg-primary-900/10 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                          {initial}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{otherName}</h3>
                          <span className="text-xs text-gray-400">{formatTime(conv.last_message_at || '')}</span>
                        </div>
                        {conv.subject && (
                          <p className="text-xs text-gray-400 mb-0.5 truncate">{conv.subject}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.last_message?.content || t('no_messages')}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {activeConversation && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {getOtherInitial(activeConversation)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{getOtherName(activeConversation)}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {t('no_messages')}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-navy-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] opacity-70">{formatMsgTime(msg.created_at)}</span>
                            {isMe && (
                              <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-blue-300' : 'opacity-50'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={t('type_message')}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !messageInput.trim()}
                    className="btn-primary !p-3 !rounded-xl"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
