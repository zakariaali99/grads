'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import type { AuditLog, PaginatedResponse } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, FileText, Clock, User, Shield,
  ChevronLeft, ChevronRight, AlertTriangle, Activity, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { SkeletonTable } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'

export default function AdminActivityPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const actionTypes = ['create', 'update', 'delete', 'login', 'logout', 'verify', 'ban', 'unban']

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadLogs = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (actionFilter !== 'all') params.action = actionFilter
      const { data } = await adminService.getAuditLogs(params)
      setLogs(data.results || [])
      setTotalCount(data.count || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, actionFilter, currentPage, t])

  useEffect(() => { loadLogs() }, [loadLogs])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.activity.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.activity.description')}</p>
          </div>
          <Activity className="w-8 h-8 text-primary-500/30" />
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
              <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1) }} className="input-field w-44">
                <option value="all">{t('admin.activity.filter.action')}</option>
                {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadLogs} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <SkeletonTable rows={8} />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('admin.activity.title')}
              description={t('no_data')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.timestamp')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.user')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.action')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.model')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.object_id')}</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.activity.table.ip')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.created_at).toLocaleString('ar')}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                            {(log.user_name || '?').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{log.user_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn('badge text-xs', {
                          'badge-success': log.action === 'create' || log.action === 'verify',
                          'badge-danger': log.action === 'delete' || log.action === 'ban',
                          'badge-warning': log.action === 'update',
                          'badge-primary': log.action === 'login' || log.action === 'logout',
                        })}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{log.model_name}</td>
                      <td className="py-3 px-2 text-sm text-slate-500 font-mono">{log.object_id}</td>
                      <td className="py-3 px-2 text-left text-sm text-slate-500 font-mono">{log.ip_address || '-'}</td>
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
