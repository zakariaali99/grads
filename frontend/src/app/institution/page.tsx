'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import { Loader2, GraduationCap, Building2, TrendingUp, ArrowLeft, BarChart3, Settings, Users } from 'lucide-react'
import { useTranslation } from '@/i18n'

const quickActions = [
  { labelKey: 'institution.dashboard.quick.graduates', href: '/institution/graduates', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { labelKey: 'institution.dashboard.quick.analytics', href: '/institution/analytics', icon: BarChart3, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { labelKey: 'institution.dashboard.quick.settings', href: '/institution/settings', icon: Settings, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
]

export default function InstitutionDashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(false)
  }, [isAuthenticated])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="institution">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const stats = [
    { label: t('institution.dashboard.stats.graduates_tracked'), value: '--', icon: GraduationCap },
    { label: t('institution.dashboard.stats.employment_rate'), value: '--%', icon: TrendingUp },
    { label: t('institution.dashboard.stats.partnerships'), value: '--', icon: Building2 },
  ]

  return (
    <DashboardLayout role="institution">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('institution.dashboard.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('role.institution')} • {user.is_verified ? t('verified') : t('unverified')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('institution.dashboard.welcome')}</div>
              <div className="text-lg font-bold text-primary-500">{user.full_name || user.username}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-primary-500 flex items-center justify-center text-white font-bold">
              {(user.full_name || user.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <AdBanner size="medium" />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('admin.dashboard.quick_actions')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-navy-800 card-hover cursor-pointer text-right group"
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t(action.labelKey)}</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
