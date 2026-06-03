'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import type { DailyStat, PaginatedResponse } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, BarChart3, Calendar, TrendingUp, Users, Briefcase,
  FileText, ChevronLeft, ChevronRight, AlertTriangle, GraduationCap,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { SkeletonTable } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import {
  BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts'

export default function AdminStatsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [stats, setStats] = useState<DailyStat[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30')
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('chart')
  const pageSize = 31

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadStats = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize, days: period }
      const { data } = await adminService.getDailyStats(params)
      setStats(data.results || data || [])
      setTotalCount(data.count || data.length || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [period, currentPage, t])

  useEffect(() => { loadStats() }, [loadStats])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const totals = stats.reduce((acc, s) => ({
    new_graduates: acc.new_graduates + (s.new_graduates || 0),
    new_employers: acc.new_employers + (s.new_employers || 0),
    new_jobs: acc.new_jobs + (s.new_jobs || 0),
    applications: acc.applications + (s.applications || 0),
    interviews: acc.interviews + (s.interviews || 0),
    hirings: acc.hirings + (s.hirings || 0),
  }), { new_graduates: 0, new_employers: 0, new_jobs: 0, applications: 0, interviews: 0, hirings: 0 })

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.stats.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.stats.description')}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-primary-500/30" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: t('admin.stats.table.new_graduates'), value: totals.new_graduates.toLocaleString(), icon: GraduationCap, color: 'text-blue-600' },
            { label: t('admin.stats.table.new_employers'), value: totals.new_employers.toLocaleString(), icon: Building2, color: 'text-cyan-600' },
            { label: t('admin.stats.table.new_jobs'), value: totals.new_jobs.toLocaleString(), icon: Briefcase, color: 'text-emerald-600' },
            { label: t('admin.stats.table.applications'), value: totals.applications.toLocaleString(), icon: FileText, color: 'text-amber-600' },
            { label: t('admin.stats.table.interviews'), value: totals.interviews.toLocaleString(), icon: Calendar, color: 'text-purple-600' },
            { label: t('admin.stats.table.hirings'), value: totals.hirings.toLocaleString(), icon: TrendingUp, color: 'text-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex bg-slate-100 dark:bg-navy-800 rounded-xl p-1">
              {(['7', '30', '90'] as const).map((p) => (
                <button key={p} onClick={() => { setPeriod(p); setCurrentPage(1) }}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    period === p ? 'bg-white dark:bg-navy-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  {t(`admin.reports.period.${p}d`)}
                </button>
              ))}
            </div>
            <div className="flex bg-slate-100 dark:bg-navy-800 rounded-xl p-1">
              <button onClick={() => setViewMode('chart')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', viewMode === 'chart' ? 'bg-white dark:bg-navy-700 shadow-sm' : '')}>
                <BarChart3 className="w-4 h-4 inline ml-1" /> {t('admin.reports.chart.platform_stats')}
              </button>
              <button onClick={() => setViewMode('table')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', viewMode === 'table' ? 'bg-white dark:bg-navy-700 shadow-sm' : '')}>
                <FileText className="w-4 h-4 inline ml-1" /> {t('admin.users.table.date_joined')}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadStats} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <SkeletonTable rows={10} />
          ) : stats.length === 0 ? (
            <EmptyState title={t('no_data')} description={t('admin.dashboard.charts.no_data')} />
          ) : viewMode === 'chart' ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('admin.stats.table.new_graduates')} & {t('admin.stats.table.new_employers')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new_graduates" fill="#3b82f6" name={t('admin.stats.table.new_graduates')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new_employers" fill="#06b6d4" name={t('admin.stats.table.new_employers')} radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('admin.stats.table.applications')} & {t('admin.stats.table.hirings')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={2} name={t('admin.stats.table.applications')} dot={false} />
                    <Line type="monotone" dataKey="hirings" stroke="#10b981" strokeWidth={2} name={t('admin.stats.table.hirings')} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.date')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.new_graduates')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.new_employers')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.new_jobs')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.applications')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.interviews')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.stats.table.hirings')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, i) => (
                    <tr key={s.date || i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3 px-2 text-sm font-medium text-slate-900 dark:text-white">{s.date}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.new_graduates}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.new_employers}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.new_jobs}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.applications}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.interviews}</td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{s.hirings}</td>
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
