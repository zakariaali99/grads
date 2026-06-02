'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { analyticsService, aiService, applicationService } from '@/lib/api-services'
import {
  BarChart3, Eye, Search, Users, TrendingUp,
  Target, BookOpen, ChevronRight, Star, AlertCircle,
  Briefcase, FileText, Calendar, Award, ArrowUp, ArrowDown,
  Sparkles, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import type { PaginatedResponse, JobApplication } from '@/lib/types'
import { useTranslation } from '@/i18n'

const chartColors = {
  primary: '#0a66c2',
  accent: '#06b6d4',
  grid: '#e2e8f0',
  text: '#94a3b8',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    return (
      <div className="glass-card !p-3 text-sm shadow-lg">
        <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-gray-600 dark:text-gray-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full ml-1.5" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    return (
      <div className="glass-card !p-3 text-sm shadow-lg">
        <p className="text-gray-900 dark:text-white font-bold">{payload[0].name}</p>
        <p className="text-gray-500 dark:text-gray-400">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

interface SkillAnalysisItem {
  skill_name: string
  demand_score: number
  user_level: number
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [graduateData, setGraduateData] = useState<any>(null)
  const [skillData, setSkillData] = useState<SkillAnalysisItem[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [gradRes, skillRes, appsRes] = await Promise.all([
        analyticsService.graduate().catch(() => ({ data: null })),
        aiService.skillAnalysis().catch(() => ({ data: [] })),
        applicationService.list({ page: 1, page_size: 100 }).catch(() => ({ data: { results: [] } })),
      ])
      setGraduateData(gradRes.data)
      setSkillData(Array.isArray(skillRes.data) ? skillRes.data : [])
      setApplications((appsRes.data as PaginatedResponse<JobApplication>)?.results || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const appStatusCount = (status: string) =>
    applications.filter((a) => a.status === status).length

  const applicationStatus = [
    { name: t('pending'), value: appStatusCount('pending'), color: '#f59e0b' },
    { name: t('shortlisted'), value: appStatusCount('shortlisted'), color: '#3b82f6' },
    { name: t('interview'), value: appStatusCount('interview'), color: '#10b981' },
    { name: t('accepted'), value: appStatusCount('accepted'), color: '#059669' },
    { name: t('rejected'), value: appStatusCount('rejected'), color: '#ef4444' },
  ].filter((s) => s.value > 0)

  const totalApps = applications.length || 1

  const skillDemand = skillData.slice(0, 6).map((s) => ({
    name: s.skill_name,
    demand: s.demand_score,
    yourLevel: s.user_level,
  }))

  const suggestedSkills = skillData
    .filter((s) => s.user_level < 50)
    .slice(0, 5)
    .map((s) => ({
      name: s.skill_name,
      demand: s.demand_score > 80 ? t('very_high') : s.demand_score > 60 ? t('high') : t('medium'),
      growth: `+${Math.round(s.demand_score * 0.3)}%`,
    }))

  const stats = [
    { label: t('profile_views'), value: graduateData?.profile_views ?? 0, change: '+23%', icon: Eye, up: true, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-500' },
    { label: t('graduate.analytics.stats.search_appearances'), value: graduateData?.search_appearances ?? 0, change: '+15%', icon: Search, up: true, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-500' },
    { label: t('graduate.analytics.stats.employer_interactions'), value: graduateData?.employer_interactions ?? 0, change: '+42%', icon: Users, up: true, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-500' },
    { label: t('graduate.analytics.stats.acceptance_rate'), value: totalApps > 0 ? `${Math.round((appStatusCount('accepted') / totalApps) * 100)}%` : '0%', change: '+5%', icon: Target, up: true, bg: 'bg-primary-100 dark:bg-primary-900/30', color: 'text-primary-500' },
    { label: t('skills'), value: skillData.length, change: '+3', icon: BookOpen, up: true, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-500' },
    { label: t('saved_jobs'), value: graduateData?.saved_jobs ?? 0, change: '+2', icon: Briefcase, up: true, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-500' },
  ]

  if (loading) {
    return (
      <DashboardLayout role="graduate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="graduate">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">{t('graduate.analytics.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('graduate.analytics.subtitle')}</p>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('last_updated_today')}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card animate-fade-in">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value text-2xl">{stat.value}</div>
              <div className="stat-label text-xs mb-1">{stat.label}</div>
              <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Views Chart */}
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('graduate.analytics.chart.monthly_views')}</h3>
              </div>
            </div>
            {skillDemand.length > 0 ? (
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillDemand} barGap={4} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10, 102, 194, 0.05)' }} />
                    <Bar dataKey="demand" name={t('graduate.analytics.chart.market_demand')} fill={chartColors.accent} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="user_level" name={t('your_level')} fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">{t('no_data')}</p>
              </div>
            )}
          </div>

          {/* Application Status Pie */}
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('graduate.analytics.chart.app_status')}</h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('total_applications')}: {applications.length}</span>
            </div>
            {applicationStatus.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="h-56 w-56" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {applicationStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5 w-full">
                  {applicationStatus.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${(item.value / applications.length) * 100}%`, backgroundColor: item.color }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white w-6 text-left">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">{t('graduate.applications.empty_desc')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skill Demand Comparison */}
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('graduate.analytics.skill_comparison')}</h3>
              </div>
            </div>
            {skillDemand.length > 0 ? (
              <>
                <div className="h-72" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillDemand} layout="vertical" barGap={4} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10, 102, 194, 0.05)' }} />
                      <Bar dataKey="demand" name={t('graduate.analytics.chart.market_demand')} fill={chartColors.accent} radius={[0, 6, 6, 0]} />
                      <Bar dataKey="yourLevel" name={t('your_level')} fill={chartColors.primary} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.accent }} />
                    {t('graduate.analytics.chart.market_demand')}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary }} />
                    {t('your_level')}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">{t('no_data')}</p>
              </div>
            )}
          </div>

          {/* Suggested Skills */}
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('graduate.analytics.suggested_skills')}</h3>
              </div>
              <span className="text-xs badge-warning">{t('based_on_market')}</span>
            </div>
            {suggestedSkills.length > 0 ? (
              <div className="space-y-3">
                {suggestedSkills.map((skill, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50 card-hover flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Star className="w-4 h-4 text-primary-500" />
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{skill.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('demand_prefix')}{skill.demand}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                        {skill.growth}
                      </span>
                      <button className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
                        {t('graduate.analytics.suggested_skills.learn')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_data')}</p>
              </div>
            )}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-l from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800/50">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t('smart_tip')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('graduate.analytics.smart_tip_text')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
