'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { analyticsService } from '@/lib/api-services'
import type { AnalyticsSummary } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, BarChart3, Download, FileText, TrendingUp, Users,
  Building2, Briefcase, GraduationCap, MapPin, Calendar,
  LineChart, PieChart, Activity, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LineChart as RechartsLineChart, Line,
  BarChart as RechartsBarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useTranslation } from '@/i18n'

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function AdminReportsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const employmentData = [
    { name: t('admin.reports.chart.graduates'), value: 0, color: '#10b981' },
    { name: t('employers'), value: 0, color: '#f59e0b' },
  ]

  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [dateFrom] = useState('')
  const [dateTo] = useState('')

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setFetching(true)
      setError('')
      const { data } = await analyticsService.admin()
      setData(data)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }

  if (isLoading || !authUser) {
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

  employmentData[0].value = data!.total_graduates
  employmentData[1].value = data!.total_employers

  const monthlyGrowth = [
    { month: t('today'), graduates: data!.total_graduates, employers: data!.total_employers, jobs: data!.total_jobs },
  ]

  const topCities = [
    { city: t('admin.reports.stats.total_users'), count: data!.total_users },
    { city: t('admin.reports.stats.graduates'), count: data!.total_graduates },
    { city: t('employers'), count: data!.total_employers },
    { city: t('admin.reports.stats.companies'), count: data!.total_companies },
    { city: t('active_jobs'), count: data!.active_jobs },
    { city: t('verified'), count: data!.verified_graduates + data!.verified_companies },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.reports.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.reports.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm"><Download className="w-4 h-4" /> {t('admin.reports.export_pdf')}</button>
            <button className="btn-secondary text-sm"><FileText className="w-4 h-4" /> {t('admin.reports.export_excel')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('admin.reports.stats.total_users'), value: data!.total_users.toLocaleString(), change: `%${Math.round((data!.total_users / Math.max(data!.total_users, 1)) * 100)}`, icon: Users, color: 'text-blue-600' },
            { label: t('admin.reports.stats.graduates'), value: data!.total_graduates.toLocaleString(), change: `%${Math.round((data!.total_graduates / Math.max(data!.total_users, 1)) * 100)}`, icon: GraduationCap, color: 'text-emerald-600' },
            { label: t('admin.reports.stats.companies'), value: data!.total_companies.toLocaleString(), change: `%${Math.round((data!.total_companies / Math.max(data!.total_users, 1)) * 100)}`, icon: Building2, color: 'text-cyan-600' },
            { label: t('admin.reports.stats.jobs'), value: data!.total_jobs.toLocaleString(), change: `%${Math.round((data!.active_jobs / Math.max(data!.total_jobs, 1)) * 100)} ${t('active')}`, icon: Briefcase, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-emerald-500 font-medium">{stat.change}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                {t('admin.reports.chart.platform_stats')}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="graduates" fill="#3b82f6" name={t('admin.reports.chart.graduates')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="employers" fill="#06b6d4" name={t('employers')} radius={[4, 4, 0, 0]} />
                <Bar dataKey="jobs" fill="#f59e0b" name={t('admin.reports.stats.jobs')} radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                {t('admin.reports.chart.user_distribution')}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={employmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label>
                  {employmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                {t('admin.reports.chart.platform_distribution')}
              </h3>
            </div>
            <div className="space-y-3">
              {topCities.map((item, i) => (
                <div key={item.city}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                      <span className="text-slate-700 dark:text-slate-300">{item.city}</span>
                    </span>
                    <span className="text-slate-500 font-medium">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                      style={{ width: `${(item.count / Math.max(topCities[0].count, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {t('admin.reports.chart.verification_rates')}
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { label: t('admin.reports.chart.verified_graduates'), value: data!.verified_graduates, total: data!.total_graduates, color: 'from-primary-500 to-accent-500' },
                { label: t('admin.reports.chart.verified_companies'), value: data!.verified_companies, total: data!.total_companies, color: 'from-emerald-500 to-teal-500' },
                { label: t('active_jobs'), value: data!.active_jobs, total: data!.total_jobs, color: 'from-amber-500 to-orange-500' },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="text-slate-500 font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" />
              {t('summary')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('admin.reports.stats.total_users'), value: data!.total_users.toLocaleString() },
              { label: t('admin.reports.stats.graduates'), value: data!.total_graduates.toLocaleString() },
              { label: t('admin.reports.stats.companies'), value: data!.total_companies.toLocaleString() },
              { label: t('admin.reports.stats.jobs'), value: data!.total_jobs.toLocaleString() },
              { label: t('active_jobs'), value: data!.active_jobs.toLocaleString() },
              { label: t('admin.reports.chart.verified_graduates'), value: data!.verified_graduates.toLocaleString() },
              { label: t('admin.reports.chart.verified_companies'), value: data!.verified_companies.toLocaleString() },
              { label: t('total_applications'), value: data!.total_applications.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 text-center">
                <div className="text-lg font-bold gradient-text">{item.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
