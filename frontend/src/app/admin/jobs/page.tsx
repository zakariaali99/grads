'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { jobService } from '@/lib/api-services'
import type { JobPost, PaginatedResponse } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, Briefcase, Eye, XCircle, Star, Clock,
  TrendingUp, Users, ChevronLeft, ChevronRight, ArrowUpDown,
  Trash2, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

const statusColors: Record<string, string> = {
  active: 'badge-success',
  closed: 'badge-danger',
  paused: 'badge-warning',
  filled: 'badge-primary',
  draft: 'badge-warning',
}

export default function AdminJobsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const statusLabels: Record<string, string> = {
    active: t('published'),
    closed: t('closed'),
    paused: t('paused'),
    filled: t('filled'),
    draft: t('draft'),
  }

  const employmentLabels: Record<string, string> = {
    full_time: t('full_time'),
    part_time: t('part_time'),
    remote: t('remote'),
    freelance: t('freelance'),
    contract: t('contract'),
    internship: t('internship'),
  }

  const [jobs, setJobs] = useState<JobPost[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('published_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadJobs = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.employment_type = typeFilter
      const { data } = await jobService.listJobs(params)
      setJobs(data.results)
      setTotalCount(data.count)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, statusFilter, typeFilter, currentPage, t])

  useEffect(() => { loadJobs() }, [loadJobs])

  const handleAction = async (action: () => Promise<any>, id: string) => {
    try {
      setActionLoading(id)
      await action()
      await loadJobs()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const toggleFeatured = async (job: JobPost) => {
    await jobService.updateJob(job.id, { is_featured: !job.is_featured })
    await loadJobs()
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const sorted = [...jobs].sort((a, b) => {
    const aVal = (a as any)[sortField]?.toString() || ''
    const bVal = (b as any)[sortField]?.toString() || ''
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const stats = {
    total: totalCount,
    active: jobs.filter((j) => j.status === 'active').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
    filled: jobs.filter((j) => j.status === 'filled').length,
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.jobs.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.jobs.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('admin.jobs.stats.total'), value: stats.total, icon: Briefcase, color: 'text-blue-600' },
            { label: t('admin.jobs.stats.active'), value: stats.active, icon: TrendingUp, color: 'text-emerald-600' },
            { label: t('admin.jobs.stats.closed'), value: stats.closed, icon: XCircle, color: 'text-red-600' },
            { label: t('admin.jobs.stats.filled'), value: stats.filled, icon: Users, color: 'text-cyan-600' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
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
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="input-field w-40">
                <option value="all">{t('admin.jobs.filter.all_status')}</option>
                <option value="active">{t('published')}</option>
                <option value="closed">{t('closed')}</option>
                <option value="paused">{t('paused')}</option>
                <option value="filled">{t('filled')}</option>
              </select>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }} className="input-field w-40">
                <option value="all">{t('admin.jobs.filter.all_types')}</option>
                {Object.entries(employmentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadJobs} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-slate-500">{t('no_results')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.jobs.table.job')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('status'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('admin.jobs.table.status')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.jobs.table.employment_type')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('applications_count'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('admin.jobs.table.applicants')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('views_count'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('views')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('published_at'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('posted_date')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.jobs.table.featured')}</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.jobs.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((job) => (
                    <tr key={job.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                            {(job.company_name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{job.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{job.company_name}</span>
                              <span>·</span>
                              <span>{job.city || job.company_city}</span>
                              {job.is_urgent && (
                                <>
                                  <span>·</span>
                                  <span className="text-red-500 font-medium">{t('urgent')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn('badge', statusColors[job.status] || 'badge-primary')}>
                          {statusLabels[job.status] || job.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">
                        {employmentLabels[job.employment_type] || job.employment_type}
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{job.applications_count}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{job.views_count}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">
                        {job.published_at ? new Date(job.published_at).toLocaleDateString('ar') : '-'}
                      </td>
                      <td className="py-3 px-2 text-left">
                        {job.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {t('admin.jobs.table.featured')}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-left">
                        <div className="flex items-center gap-1">
                          {actionLoading === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                          ) : (
                            <>
                              <button onClick={() => toggleFeatured(job)} className="btn-ghost p-2" title={t('admin.jobs.action.toggle_featured')}>
                                {job.is_featured ? <ToggleRight className="w-4 h-4 text-amber-600" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              {job.status === 'active' && (
                                <button onClick={() => handleAction(() => jobService.closeJob(job.id), job.id)}
                                  className="btn-ghost p-2 text-red-600" title={t('close')}>
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => handleAction(() => jobService.deleteJob(job.id), job.id)}
                                className="btn-ghost p-2 text-red-600" title={t('delete')}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                {t('pagination', { from: Math.min((currentPage - 1) * pageSize + 1, totalCount), to: Math.min(currentPage * pageSize, totalCount), total: totalCount })}
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
