'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { analyticsService } from '@/lib/api-services'
import type { AnalyticsSummary, TrendDataPoint, CityData } from '@/lib/types'
import {
  Loader2, Users, Building2, Briefcase, FileCheck,
  AlertTriangle, TrendingUp, Activity, MapPin, PieChart,
  BarChart3,
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTranslation } from '@/i18n'

export interface DistributionItem {
  label: string
  value: number
  color: string
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchProfile } = useAuthStore()
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, user])
  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setFetching(true)
      setChartLoading(true)
      setError('')
      const { data } = await analyticsService.admin()
      setData(data)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
      setChartLoading(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  const totalVerified = data ? data.verified_graduates + data.verified_companies : 0
  const unverifiedUsers = data ? data.total_users - data.verified_graduates : 0
  const pendingCompanies = data ? data.total_companies - data.verified_companies : 0

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="section-title">{t('admin.dashboard.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboard.description')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: t('admin.dashboard.total_users'), value: data!.total_users.toLocaleString(), icon: Users, color: 'text-blue-600' },
            { label: t('admin.dashboard.total_companies'), value: data!.total_companies.toLocaleString(), icon: Building2, color: 'text-cyan-600' },
            { label: t('admin.dashboard.total_jobs'), value: data!.total_jobs.toLocaleString(), icon: Briefcase, color: 'text-emerald-600' },
            { label: t('admin.dashboard.verified_graduates'), value: totalVerified.toLocaleString(), icon: FileCheck, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('admin.dashboard.alerts')}
            </h3>
            <div className="space-y-3">
              {[
                { text: `${unverifiedUsers} ${t('admin.dashboard.alerts.pending_review')}`, time: t('total') },
                { text: `${pendingCompanies} ${t('admin.dashboard.alerts.pending_verification')}`, time: t('total') },
                { text: `${data!.total_jobs - data!.active_jobs} ${t('admin.dashboard.alerts.inactive_jobs')}`, time: t('total') },
              ].map((alert) => (
                <div key={alert.text} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm">
                  <p className="text-amber-800 dark:text-amber-300 font-medium">{alert.text}</p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              {t('admin.dashboard.activity.title')}
            </h3>
            <div className="space-y-3">
              {[
                { text: `${data!.total_graduates} ${t('admin.dashboard.activity.registered_graduates')}`, time: t('total') },
                { text: `${data!.total_employers} ${t('admin.dashboard.activity.registered_employers')}`, time: t('total') },
                { text: `${data!.total_applications} ${t('admin.dashboard.activity.applications')}`, time: t('total') },
              ].filter(Boolean).map((act) => (
                <div key={act!.text} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{act!.text}</span>
                  <span className="text-xs text-slate-400">{act!.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              {t('admin.dashboard.distribution.title')}
            </h3>
            <div className="space-y-4">
              {[
                { label: t('admin.dashboard.distribution.graduates'), value: data!.total_graduates, total: data!.total_users },
                { label: t('admin.dashboard.distribution.companies'), value: data!.total_companies, total: data!.total_users },
                { label: t('admin.dashboard.distribution.active_jobs'), value: data!.active_jobs, total: data!.total_jobs },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="text-emerald-500 font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('admin.dashboard.quick_actions')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('admin.dashboard.quick_actions.verify_graduates'), href: '/admin/verifications', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
              { label: t('admin.dashboard.quick_actions.verify_companies'), href: '/admin/verifications', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
              { label: t('admin.dashboard.quick_actions.reports'), href: '/admin/reports', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
              { label: t('admin.dashboard.quick_actions.users'), href: '/admin/users', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
            ].map((action) => (
              <a key={action.label} href={action.href}
                className={`p-4 rounded-xl font-medium text-sm text-right card-hover ${action.color}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* ──────────── Charts Section ──────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Growth Bar Chart */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              {t('admin.dashboard.charts.user_growth')}
            </h3>
            {chartLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <UserGrowthChart data={data} t={t} />
            )}
          </div>

          {/* Distribution Pie */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              {t('admin.dashboard.charts.distribution')}
            </h3>
            {chartLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <DistributionChart data={data} t={t} />
            )}
          </div>
        </div>

        {/* Top Cities Horizontal Bars */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            {t('admin.dashboard.charts.top_cities')}
          </h3>
          {chartLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <TopCitiesChart data={data} t={t} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── Bar Chart ──────────────────────────────────────────────────
function UserGrowthChart({ data, t }: { data: AnalyticsSummary | null; t: (k: string) => string }) {
  const trends = data?.trends
  if (!trends || trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">{t('admin.dashboard.charts.no_data')}</p>
      </div>
    )
  }

  const recent = trends.slice(-14)
  const maxVal = Math.max(...recent.map(d => d.users ?? d.graduates ?? 0), 1)

  return (
    <div className="flex items-end gap-1.5 h-48 pt-2">
      {recent.map((d, i) => {
        const val = d.users ?? d.graduates ?? 0
        const pct = (val / maxVal) * 100
        const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' })
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{val}</span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 hover:to-primary-300 transition-all dark:from-primary-600 dark:to-primary-500"
              style={{ height: `${Math.max(pct, 2)}%` }}
              title={`${d.date}: ${val}`}
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full text-center">{day}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Pie Chart ───────────────────────────────────────────────────
function DistributionChart({ data, t }: { data: AnalyticsSummary | null; t: (k: string) => string }) {
  if (!data) {
    return <NoChartData t={t} />
  }

  const items: DistributionItem[] = [
    { label: t('admin.dashboard.distribution.graduates'), value: data.total_graduates, color: '#3b82f6' },
    { label: t('admin.dashboard.distribution.companies'), value: data.total_companies, color: '#06b6d4' },
    { label: t('admin.dashboard.activity.registered_employers'), value: data.total_employers, color: '#10b981' },
  ]

  const total = items.reduce((s, i) => s + i.value, 0)
  if (total === 0) return <NoChartData t={t} />

  const segments = items
    .filter(i => i.value > 0)
    .map((i, idx, arr) => {
      const startPct = arr.slice(0, idx).reduce((s, x) => s + (x.value / total) * 100, 0)
      const endPct = startPct + (i.value / total) * 100
      return { ...i, startPct, endPct, pct: Math.round((i.value / total) * 100) }
    })

  const gradientStops = segments.map(s => `${s.color} ${s.startPct}% ${s.endPct}%`).join(', ')

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-36 h-36 rounded-full shrink-0"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      <div className="space-y-2 w-full">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Top Cities ──────────────────────────────────────────────────
function TopCitiesChart({ data, t }: { data: AnalyticsSummary | null; t: (k: string) => string }) {
  const cities = data?.top_cities
  if (!cities || cities.length === 0) {
    return <NoChartData t={t} />
  }

  const maxCity = Math.max(...cities.map(c => c.graduate_count), 1)
  const top = cities.slice(0, 8)

  return (
    <div className="space-y-3">
      {top.map((city, i) => {
        const pct = (city.graduate_count / maxCity) * 100
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{city.city}</span>
              <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-3">{city.graduate_count}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 dark:from-amber-600 dark:to-orange-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NoChartData({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
      <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
      <p className="text-sm">{t('admin.dashboard.charts.no_data')}</p>
    </div>
  )
}
