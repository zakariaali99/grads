'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useStreakStore } from '@/store/streakStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import { graduateService, applicationService, interviewService, jobService, aiService } from '@/lib/api-services'
import { Loader2, Eye, FileText, Calendar, BookmarkCheck, Briefcase, Plus, MapPin } from 'lucide-react'
import type { GraduateProfile, PaginatedResponse, Interview, JobPost } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function GraduateDashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const { fetchStreak } = useStreakStore()
  const [profile, setProfile] = useState<GraduateProfile | null>(null)
  const [appCount, setAppCount] = useState(0)
  const [interviewCount, setInterviewCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    fetchStreak()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    Promise.all([
      graduateService.getMyProfile().catch(() => null),
      applicationService.list({ page: 1, page_size: 1 }).catch(() => null),
      interviewService.list().catch(() => null),
      graduateService.getSavedJobs().catch(() => null),
      aiService.jobRecommendations().catch(() => null),
    ])
      .then(([profileRes, appsRes, interviewsRes, savedRes, jobsRes]) => {
        if (profileRes) setProfile(profileRes.data)
        if (appsRes) setAppCount((appsRes.data as PaginatedResponse<any>).count ?? 0)
        if (interviewsRes) setInterviewCount((interviewsRes.data as Interview[]).length)
        if (savedRes) setSavedCount(Array.isArray(savedRes.data) ? savedRes.data.length : 0)
        if (jobsRes) setRecommendedJobs(Array.isArray(jobsRes.data) ? jobsRes.data : [])
      })
      .catch(() => setError(t('error')))
      .finally(() => setLoading(false))
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
      <DashboardLayout role="graduate">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const stats = [
    { label: t('profile_views'), value: profile?.profile_views ?? 0, icon: Eye },
    { label: t('graduate.dashboard.stats.applications'), value: appCount, icon: FileText },
    { label: t('interviews'), value: interviewCount, icon: Calendar },
    { label: t('saved_jobs'), value: savedCount, icon: BookmarkCheck },
  ]

  const skillsList = profile?.skills ?? []

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('graduate.dashboard.welcome', { name: user.full_name })}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('role.graduate')} • {user.is_verified ? t('verified') : t('unverified')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('profile_completion')}</div>
              <div className="text-lg font-bold text-primary-500">{user.profile_completion}%</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
              {(user.full_name || 'U')[0]}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <AdBanner size="medium" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('skills')}</h3>
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span key={skill.id} className="badge-primary">{skill.skill_name}</span>
                ))}
                <button className="badge border border-dashed border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer">
                  {t('add_skill')}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.dashboard.no_skills')}</p>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('graduate.dashboard.recommended')}</h3>
            {recommendedJobs.length > 0 ? (
              <div className="space-y-3">
                {recommendedJobs.slice(0, 3).map((job: any, i: number) => (
                  <div key={job.id ?? i} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800 card-hover cursor-pointer">
                    <h4 className="font-bold text-gray-900 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.company_name} • {job.city || job.company_city}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.dashboard.no_recommended')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
