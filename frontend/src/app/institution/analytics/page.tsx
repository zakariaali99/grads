'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import {
  Loader2, TrendingUp, DollarSign, Star,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function InstitutionAnalyticsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [yearRange, setYearRange] = useState('all')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/institution/dashboard/')
      .then((res) => { setDashboard(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isAuthenticated])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="institution">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('institution.analytics.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('institution.analytics.description')}</p>
          </div>
          <select value={yearRange} onChange={(e) => setYearRange(e.target.value)} className="input py-2 text-sm min-w-[130px]">
            <option value="all">{t('institution.analytics.all_years')}</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="stat-value">{dashboard?.employed_rate ?? '--'}%</div>
            <div className="stat-label">{t('institution.analytics.employment_rate')}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="stat-value">{dashboard?.average_gpa ?? '--'}</div>
            <div className="stat-label">{t('institution.analytics.avg_gpa')}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="stat-value">{dashboard?.average_rating ? `${dashboard.average_rating}/5` : '--'}</div>
            <div className="stat-label">{t('institution.analytics.curriculum_rating')}</div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.analytics.grads_by_status')}</h3>
          {dashboard?.graduates_by_status && dashboard.graduates_by_status.length > 0 ? (
            <div className="flex items-center gap-6">
              {dashboard.graduates_by_status.map((s: any) => {
                const colors: Record<string, string> = {
                  enrolled: 'bg-blue-500', graduated: 'bg-emerald-500',
                  withdrew: 'bg-red-500', suspended: 'bg-amber-500',
                }
                const total = dashboard.graduates_by_status.reduce((a: number, b: any) => a + b.count, 0)
                const pct = Math.round((s.count / total) * 100)
                return (
                  <div key={s.status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[s.status] || 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t(`institution.graduates.status.${s.status}`)} ({s.count}, {pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400">{t('institution.analytics.no_data')}</p>
          )}
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.analytics.grads_by_year')}</h3>
          {dashboard?.graduates_by_year && dashboard.graduates_by_year.length > 0 ? (
            <div className="flex items-end gap-3 h-48">
              {dashboard.graduates_by_year.map((y: any) => {
                const max = Math.max(...dashboard.graduates_by_year.map((x: any) => x.count))
                const height = (y.count / max) * 100
                return (
                  <div key={y.graduation_year} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{y.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg"
                      style={{ height: `${height}%`, minHeight: 4 }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{y.graduation_year || 'N/A'}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400">{t('institution.analytics.no_data')}</p>
          )}
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.analytics.top_majors')}</h3>
          {dashboard?.top_majors && dashboard.top_majors.length > 0 ? (
            <div className="space-y-3">
              {dashboard.top_majors.map((m: any, i: number) => {
                const max = Math.max(...dashboard.top_majors.map((x: any) => x.count))
                const width = (m.count / max) * 100
                return (
                  <div key={m.major} className="flex items-center gap-3">
                    <span className="w-6 text-sm font-medium text-gray-500 dark:text-gray-400">{i + 1}</span>
                    <span className="w-40 text-sm text-gray-700 dark:text-gray-300 truncate">{m.major}</span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-left">{m.count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400">{t('institution.analytics.no_data')}</p>
          )}
        </div>

        <div className="mb-6">
          <AdBanner size="medium" />
        </div>
      </div>
    </DashboardLayout>
  )
}
