'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { notificationService } from '@/lib/api-services'
import type { Notification, PaginatedResponse } from '@/lib/types'
import {
  Loader2, Bell, CheckCheck, ChevronLeft, ChevronRight, AlertTriangle,
  Briefcase, Calendar, MessageSquare, UserCheck, ShieldCheck, AlertCircle, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

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

const typeLabels: Record<string, string> = {
  application: 'notification.application',
  interview: 'notification.interview',
  message: 'notification.message',
  job_match: 'notification.job_match',
  profile_view: 'notification.profile_view',
  verification: 'notification.verification',
  system: 'notification.system',
  announcement: 'notification.announcement',
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const typeOptions = ['all', 'application', 'interview', 'message', 'job_match', 'profile_view', 'verification', 'system', 'announcement']

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated])

  const loadNotifications = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (typeFilter !== 'all') params.notification_type = typeFilter
      const { data } = await notificationService.list(params)
      setNotifications(data.results || [])
      setTotalCount(data.count || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [typeFilter, currentPage, t])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
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
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-900 dark:to-navy-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('notifications')}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} ${t('unread_notifications')}`
                  : t('no_notifications')}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              {t('mark_all_read')}
            </button>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setCurrentPage(1) }}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors',
                  typeFilter === type
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-600'
                )}
              >
                {type === 'all' ? t('all') : t(typeLabels[type] || type)}
              </button>
            ))}
          </div>

          {fetching ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-navy-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-navy-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={loadNotifications}
                className="mt-3 px-4 py-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                {t('retry')}
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t('no_notifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-700">
              {notifications.map((n) => {
                const Icon = typeIcons[n.notification_type] || Bell
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 py-3 transition-colors',
                      !n.is_read && 'bg-primary-50/50 dark:bg-primary-900/10 -mx-6 px-6'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      typeIcons[n.notification_type] ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-navy-700 text-slate-500'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', n.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-medium')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">{formatTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-400 hover:text-primary-500 transition-colors"
                        title={t('mark_all_read')}
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-navy-700">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
                {t('previous')}
              </button>
              <span className="text-sm text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('next')}
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
