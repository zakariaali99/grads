'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { chatService } from '@/lib/api-services'
import { useAuthStore } from '@/store/authStore'
import {
  MessageSquare, Search, Send, ChevronLeft, MoreVertical,
  Phone, Video, Check, CheckCheck, Paperclip,
  Smile, Clock, User, Building2, X, Loader2
} from 'lucide-react'
import type { Conversation, Message } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function MessagesPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await chatService.getConversations()
      setConversations(Array.isArray(res.data) ? res.data : [])
      if (Array.isArray(res.data) && res.data.length > 0 && !selectedId) {
        setSelectedId(res.data[0].id)
      }
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true)
    try {
      const res = await chatService.getMessages(convId)
      setMessages(Array.isArray(res.data) ? res.data : [])
    } catch {
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    }
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = conversations.filter((conv) => {
    const names = conv.participant_names?.join(' ') || ''
    const subject = conv.subject || ''
    const query = searchQuery
    return names.includes(query) || subject.includes(query)
  })

  const selectedConv = conversations.find((c) => c.id === selectedId) || null

  const participantName = (conv: Conversation) => {
    return conv.participant_names?.filter((n) => n)?.join(', ') || 'محادثة'
  }

  const participantInitial = (conv: Conversation) => {
    const name = participantName(conv)
    return name[0] || '?'
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return
    try {
      await chatService.sendMessage({
        conversation: selectedId,
        content: newMessage,
      })
      setNewMessage('')
      await fetchMessages(selectedId)
      await fetchConversations()
    } catch {}
  }

  if (loading) {
    return (
      <DashboardLayout role="graduate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="graduate">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchConversations} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="graduate">
      <div className="h-[calc(100vh-8rem)] flex gap-0">
        {/* Conversation List */}
        <div className={`w-full sm:w-80 lg:w-96 flex-shrink-0 glass-card flex flex-col ${selectedId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('messages')}</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_messages')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_conversations')}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 flex items-start gap-3 transition-all hover:bg-gray-50 dark:hover:bg-navy-800/50 border-b border-gray-100 dark:border-gray-800 ${
                    selectedId === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                      {participantInitial(conv)}
                    </div>
                    {conv.is_active && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-navy-900 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{participantName(conv)}</h3>
                      {conv.last_message && (
                        <span className="text-xs text-gray-400 flex-shrink-0 mr-2">
                          {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleDateString('ar-EG') : ''}
                        </span>
                      )}
                    </div>
                    {conv.subject && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{conv.subject}</p>
                    )}
                    {conv.last_message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.last_message.content}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`flex-1 flex flex-col glass-card mr-0 sm:mr-3 ${selectedId ? 'flex' : 'hidden sm:flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="sm:hidden btn-ghost p-1"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {participantInitial(selectedConv)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{participantName(selectedConv)}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConv.is_active ? t('online') : selectedConv.subject || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost p-2"><Phone className="w-4 h-4" /></button>
                  <button className="btn-ghost p-2"><Video className="w-4 h-4" /></button>
                  <button className="btn-ghost p-2"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('no_messages')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('type_message')}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl ${
                            isMe
                              ? 'bg-primary-500 text-white rounded-bl-lg'
                              : 'bg-gray-100 dark:bg-navy-800 text-gray-900 dark:text-gray-100 rounded-br-lg'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-start' : 'justify-end'}`}>
                            <span className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
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
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button className="btn-ghost p-2 hidden sm:flex"><Paperclip className="w-5 h-5" /></button>
                  <button className="btn-ghost p-2 hidden sm:flex"><Smile className="w-5 h-5" /></button>
                  <input
                    type="text"
                    placeholder={t('type_message')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="input-field py-2.5"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="btn-primary p-2.5 disabled:opacity-40"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('messages')}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {t('choose_conversation')}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
