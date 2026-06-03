'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import type { PlatformEvent, PaginatedResponse } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, Calendar, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Zap, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { SkeletonTable } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'

export default function AdminEventsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [events, setEvents] = useState<PlatformEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const eventTypes = ['job_posted', 'application_submitted', 'user_registered', 'company_verified', 'graduate_verified']

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadEvents = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (typeFilter !== 'all') params.event_type = typeFilter
      const { data } = await adminService.getPlatformEvents(params)
      setEvents(data.results || [])
      setTotalCount(data.count || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, typeFilter, currentPage, t])

  useEffect(() => { loadEvents() }, [loadEvents])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const eventTypeColors: Record<string, string> = {
    job_posted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    application_submitted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    user_registered: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    company_verified: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    graduate_verified: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  }

  if (isLoading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.events.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.events.description')}</p>
          </div>
          <Zap className="w-8 h-8 text-primary-500/30" />
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10"
              />
            </div>
            <div className="flex gap-3">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }} className="input-field w-44">
                <option value="all">{t('admin.events.filter.type')}</option>
                {eventTypes.map((et) => <option key={et} value={et}>{et.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadEvents} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <SkeletonTable rows={8} />
          ) : events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t('admin.events.title')}
              description={t('no_data')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.events.table.timestamp')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.events.table.event_type')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.events.table.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(event.created_at).toLocaleString('ar')}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn('badge text-xs', eventTypeColors[event.event_type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300')}>
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{event.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                {t('pagination.from_to', { from: Math.min((currentPage - 1) * pageSize + 1, totalCount), to: Math.min(currentPage * pageSize, totalCount), total: totalCount })}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-ghost p-2 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', p === currentPage ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800')}
                  >{p}</button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-ghost p-2 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
