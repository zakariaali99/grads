'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Briefcase, Users, Calendar, Star, TrendingUp, Download,
  BarChart3, PieChart as PieChartIcon, Activity,
  Loader2, AlertCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts'
import { analyticsService } from '@/lib/api-services'
import { useTranslation } from '@/i18n'

const FUNNEL_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee']
const STATUS_COLORS = ['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa']

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchAnalytics()
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await analyticsService.employer()
      setData(res)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: t('active_jobs'), value: data?.active_jobs ?? '0', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: t('employer.analytics.stats.applicants'), value: data?.total_applicants ?? '0', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('interviews'), value: data?.total_interviews ?? '0', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: t('hires'), value: data?.total_hires ?? '0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: t('conversion_rate'), value: data?.conversion_rate ?? '0%', icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ]

  const funnelData = data?.funnel ?? []
  const applicantsPerJob = data?.applicants_per_job ?? []
  const statusBreakdown = data?.status_breakdown ?? []
  const topSkills = data?.top_skills ?? []
  const monthlyTrend = data?.monthly_trend ?? []

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.analytics.title')}</h1>
        <button className="btn-primary">
          <Download className="w-4 h-4" />
          {t('employer.analytics.download_report')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={fetchAnalytics} className="btn-secondary mt-4">{t('retry')}</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="stat-value text-xl">{stat.value}</div>
                  <div className="stat-label text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                {t('employer.analytics.funnel')}
              </h3>
              {funnelData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t('no_data')}</p>
              ) : (
                <div className="space-y-3">
                  {funnelData.map((item: any, i: number) => (
                    <div key={item.name || i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{(item.value || 0).toLocaleString('en-US')}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${((item.value || 0) / (funnelData[0]?.value || 1)) * 100}%`,
                            backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-500" />
                {t('employer.analytics.status_distribution')}
              </h3>
              {statusBreakdown.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t('no_data')}</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown.map((item: any, i: number) => ({
                          ...item,
                          color: STATUS_COLORS[i % STATUS_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusBreakdown.map((_: any, i: number) => (
                          <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value: string) => (
                          <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                {t('employer.analytics.applicants_per_job')}
              </h3>
              {applicantsPerJob.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t('no_data')}</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicantsPerJob}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(val: string) => val?.length > 8 ? val.slice(0, 8) + '...' : val || ''}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="applicants" name={t('employer.analytics.chart.applicants')} fill="#0a66c2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="views" name={t('views')} fill="#22d3ee" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                {t('employer.analytics.top_skills')}
              </h3>
              {topSkills.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t('no_data')}</p>
              ) : (
                <div className="space-y-3">
                  {topSkills.map((skill: any, i: number) => (
                    <div key={skill.name || i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{(skill.count || 0).toLocaleString('en-US')} {t('candidate')}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          style={{ width: `${((skill.count || 0) / (topSkills[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              {t('employer.analytics.trend')}
            </h3>
            {monthlyTrend.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('no_data')}</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="applicants" name={t('employer.analytics.chart.applicants')} stroke="#0a66c2" fill="#0a66c2" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="interviews" name={t('interviews')} stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
