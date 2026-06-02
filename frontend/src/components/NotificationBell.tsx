'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { notificationService } from '@/lib/api-services'
import { useTranslation } from '@/i18n'
import type { Notification } from '@/lib/types'
import {
  Bell, CheckCheck, Loader2, X, Briefcase, Calendar,
  MessageSquare, UserCheck, ShieldCheck, AlertCircle, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const typeIcons: Record<string, any> = {
  application: Briefcase,
  interview: Calendar,
  message: MessageSquare,
  job_match: Briefcase,
  profile_view: UserCheck,
  verification: ShieldCheck,
  system: AlertCircle,
  announcement: Megaphone,
}

const typeColors: Record<string, string> = {
  application: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  interview: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  message: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  job_match: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  profile_view: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  verification: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  system: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  announcement: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
}

export default function NotificationBell() {
  const { user } = useAuthStore()
  const { t, locale } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationService.unreadCount()
      setUnreadCount(data.count)
    } catch {}
  }

  const toggleDropdown = async () => {
    if (!open) {
      setOpen(true)
      setLoading(true)
      try {
        const { data } = await notificationService.list()
        const list = data as any
        setNotifications(Array.isArray(list) ? list : list?.results || [])
      } catch {}
      setLoading(false)
    } else {
      setOpen(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return t('now')
    if (mins < 60) return `${mins} ${t('minutes_ago')}`
    if (hours < 24) return `${hours} ${t('hours_ago')}`
    if (days < 2) return t('yesterday')
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-EG', { day: 'numeric', month: 'short' })
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 dark:text-gray-400 transition-colors"
        title={t('notifications')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-navy-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('mark_all_read')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_notifications')}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.notification_type] || Bell
                const color = typeColors[n.notification_type] || 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700/50 border-b border-gray-50 dark:border-gray-700/50',
                      !n.is_read && 'bg-primary-50/50 dark:bg-primary-900/10'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{formatTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="shrink-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-400 hover:text-primary-500 transition-colors"
                        title={t('mark_all_read')}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
