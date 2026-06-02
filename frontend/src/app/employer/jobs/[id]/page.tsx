'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Briefcase, Users, Loader2, ArrowRight, CheckCircle, XCircle,
  Clock, Star, User, Calendar, Search, ChevronDown,
  AlertCircle,
} from 'lucide-react'
import { jobService, applicationService } from '@/lib/api-services'
import type { JobApplication } from '@/lib/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

const applicationStatusConfig: Record<string, { class: string; labelKey: string }> = {
  pending: { class: 'badge-warning', labelKey: 'pending' },
  reviewed: { class: 'badge-info', labelKey: 'pending' },
  shortlisted: { class: 'badge-success', labelKey: 'shortlisted' },
  interview: { class: 'badge-primary', labelKey: 'interview' },
  accepted: { class: 'badge-success', labelKey: 'accepted' },
  rejected: { class: 'badge-danger', labelKey: 'rejected' },
  withdrawn: { class: 'badge-secondary', labelKey: 'withdrawn' },
}

export default function JobApplicantsPage() {
  const { t, dir } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')

  const fetchApplications = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await jobService.getJobApplications(id)
      const apps: JobApplication[] = res.data
      setApplications(apps)
      if (apps.length > 0) setJobTitle(apps[0].job_title)
      else {
        const jobRes = await jobService.getJob(id)
        setJobTitle(jobRes.data.title)
      }
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [id])

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId)
    try {
      await applicationService.updateStatus(appId, status)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      )
    } catch { setError(t('error')) }
    finally { setUpdatingId(null) }
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/employer/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors mb-4 group"
        >
          <ArrowRight className={cn("w-4 h-4 transition-transform", dir === 'rtl' ? "rotate-180" : "")} />
          {t('employer.jobs.applicants.back_to_jobs')}
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {jobTitle ? t('employer.jobs.applicants.title', { title: jobTitle }) : t('loading')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {stats.total} {t('applicants')}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="stat-card text-center py-3">
            <div className="stat-value text-lg">{stats.total}</div>
            <div className="stat-label text-xs">{t('all')}</div>
          </div>
          <div className="stat-card text-center py-3">
            <div className="stat-value text-lg text-amber-600">{stats.shortlisted}</div>
            <div className="stat-label text-xs">{t('shortlisted')}</div>
          </div>
          <div className="stat-card text-center py-3">
            <div className="stat-value text-lg text-blue-600">{stats.interview}</div>
            <div className="stat-label text-xs">{t('interview')}</div>
          </div>
          <div className="stat-card text-center py-3">
            <div className="stat-value text-lg text-emerald-600">{stats.accepted}</div>
            <div className="stat-label text-xs">{t('accepted')}</div>
          </div>
          <div className="stat-card text-center py-3">
            <div className="stat-value text-lg text-red-600">{stats.rejected}</div>
            <div className="stat-label text-xs">{t('rejected')}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('employer.jobs.applicants.no_applicants')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('employer.jobs.applicants.no_applicants_desc')}</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-800">
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('employer.jobs.applicants.table.candidate')}</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.status')}</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('match_score')}</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('employer.jobs.applicants.table.applied_date')}</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const statusCfg = applicationStatusConfig[app.status] || applicationStatusConfig.pending
                    return (
                      <tr key={app.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {(app.applicant_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{app.applicant_name}</p>
                              {app.match_score && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-amber-400" />
                                  {Math.round(app.match_score)}%
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`${statusCfg.class} text-xs`}>
                            {t(statusCfg.labelKey)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {app.match_score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                  style={{ width: `${Math.min(Math.round(app.match_score), 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(app.match_score)}%</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">--</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {app.status === 'pending' && (
                              <button
                                onClick={() => updateStatus(app.id, 'shortlisted')}
                                disabled={updatingId === app.id}
                                className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors disabled:opacity-40"
                                title={t('shortlisted')}
                              >
                                {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                              </button>
                            )}
                            {app.status === 'shortlisted' && (
                              <button
                                onClick={() => updateStatus(app.id, 'interview')}
                                disabled={updatingId === app.id}
                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors disabled:opacity-40"
                                title={t('employer.jobs.applicants.action.interview')}
                              >
                                {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                              </button>
                            )}
                            {app.status !== 'accepted' && app.status !== 'rejected' && app.status !== 'withdrawn' && (
                              <>
                                <button
                                  onClick={() => updateStatus(app.id, 'accepted')}
                                  disabled={updatingId === app.id}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors disabled:opacity-40"
                                  title={t('accepted')}
                                >
                                  {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => updateStatus(app.id, 'rejected')}
                                  disabled={updatingId === app.id}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-40"
                                  title={t('rejected')}
                                >
                                  {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
