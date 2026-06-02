'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { analyticsService } from '@/lib/api-services'
import type { AnalyticsSummary } from '@/lib/types'
import {
  Loader2, Users, Building2, Briefcase, FileCheck,
  AlertTriangle, TrendingUp, Activity
} from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useTranslation } from '@/i18n'


export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchProfile } = useAuthStore()
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, user])
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
      </div>
    </DashboardLayout>
  )
}
