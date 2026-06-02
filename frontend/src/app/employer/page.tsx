'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import { Loader2, Users, Briefcase, Eye, TrendingUp, AlertCircle, Inbox } from 'lucide-react'
import { jobService, applicationService } from '@/lib/api-services'
import type { JobPost, JobApplication } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function EmployerDashboardPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.listJobs({ page_size: 50 }),
        applicationService.list({ page_size: 5 }),
      ])
      setJobs(jobsRes.data.results || [])
      setRecentApplications(appsRes.data.results || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const activeJobs = jobs.filter((j) => j.status === 'active' || j.status === 'published')
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0)
  const totalViews = jobs.reduce((acc, j) => acc + (j.views_count || 0), 0)
  const conversionRate = totalViews > 0 ? ((totalApplicants / totalViews) * 100).toFixed(1) : '0.0'

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('employer.dashboard.welcome', { name: user?.full_name })}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={loadData} className="btn-secondary mt-4">{t('retry')}</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="stat-value">{activeJobs.length}</div>
              <div className="stat-label">{t('active_jobs')}</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="stat-value">{totalApplicants}</div>
              <div className="stat-label">{t('employer.dashboard.total_applicants')}</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="stat-value">{totalViews.toLocaleString('en-US')}</div>
              <div className="stat-label">{t('employer.dashboard.job_views')}</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="stat-value">{conversionRate}%</div>
              <div className="stat-label">{t('conversion_rate')}</div>
            </div>
          </div>

          <div className="mb-6">
            <AdBanner size="medium" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('employer.dashboard.recent_applicants')}</h3>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('employer.dashboard.no_applicants')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800 flex items-center justify-between card-hover cursor-pointer">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{app.applicant_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.job_title}</p>
                      </div>
                      <div className="text-left">
                        <div className={`text-lg font-bold ${(app.match_score || 0) >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {app.match_score ?? '--'}%
                        </div>
                        <div className="text-xs text-gray-400">{t('match')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('employer.dashboard.active_jobs_section')}</h3>
              {activeJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('employer.dashboard.no_active_jobs')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800 card-hover cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-white">{job.title}</h4>
                        <span className="badge-success">{t('published')}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.applications_count || 0} {t('employer.dashboard.applicant_count')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
