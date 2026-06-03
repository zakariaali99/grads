'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Skeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import {
  Briefcase, Users, UserCheck, FileText, ArrowRight,
  Loader2, AlertCircle, ChevronRight, Layers,
} from 'lucide-react'
import { jobService, pipelineService } from '@/lib/api-services'
import type { JobPost, PipelineStage } from '@/lib/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

export default function PipelineOverviewPage() {
  const { t, dir } = useTranslation()
  const router = useRouter()

  const [jobs, setJobs] = useState<JobPost[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [stageCounts, setStageCounts] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [jobsRes, stagesRes] = await Promise.all([
          jobService.listJobs({ page_size: 100 }),
          pipelineService.getStages(),
        ])
        const jobsData: JobPost[] = jobsRes.data.results || []
        setJobs(jobsData)
        setStages(stagesRes.data)

        const counts: Record<string, Record<string, number>> = {}
        await Promise.all(
          jobsData.map(async (job) => {
            try {
              const appsRes = await jobService.getJobApplications(job.id)
              const apps: any[] = appsRes.data
              const jobCounts: Record<string, number> = {}
              await Promise.all(
                apps.map(async (app) => {
                  try {
                    const stageRes = await pipelineService.getApplicationStage(app.id)
                    const stageId = stageRes.data.stage?.toString()
                    if (stageId) {
                      jobCounts[stageId] = (jobCounts[stageId] || 0) + 1
                    }
                  } catch {}
                })
              )
              counts[job.id] = jobCounts
              const total = apps.length
              if (!counts[job.id]) counts[job.id] = {}
              counts[job.id]._total = total
            } catch {}
          })
        )
        setStageCounts(counts)
      } catch {
        setError(t('error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  const totalInPipeline = Object.values(stageCounts).reduce((acc, s) => acc + (s._total || 0), 0)
  const interviewStage = stages.find((s) => s.name.toLowerCase().includes('interview') || s.name_ar.includes('مقابلة'))
  const offerStage = stages.find((s) => s.name.toLowerCase().includes('offer') || s.name_ar.includes('عرض'))
  const inInterview = interviewStage
    ? Object.values(stageCounts).reduce((acc, s) => acc + (s[interviewStage.id.toString()] || 0), 0)
    : 0
  const offersSent = offerStage
    ? Object.values(stageCounts).reduce((acc, s) => acc + (s[offerStage.id.toString()] || 0), 0)
    : 0

  if (loading) {
    return (
      <DashboardLayout role="employer">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.pipeline.overview_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('employer.pipeline.title')}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{totalInPipeline}</div>
              <div className="stat-label">{t('employer.pipeline.total_in_pipeline')}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{inInterview}</div>
              <div className="stat-label">{t('employer.pipeline.in_interview')}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{offersSent}</div>
              <div className="stat-label">{t('employer.pipeline.offers_sent')}</div>
            </div>
          </div>
        </div>

        {/* Job List */}
        {jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t('no_jobs')}
            description={t('employer.dashboard.no_active_jobs')}
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-800">
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('employer.jobs.table.job')}</th>
                    {stages.map((s) => (
                      <th key={s.id} className="text-center py-4 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">
                        {dir === 'rtl' ? s.name_ar : s.name}
                      </th>
                    ))}
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('all')}</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const counts = stageCounts[job.id] || {}
                    const total = counts._total || 0
                    return (
                      <tr key={job.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {(job.title || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{job.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {job.applications_count || 0} {t('applicants')}
                              </p>
                            </div>
                          </div>
                        </td>
                        {stages.map((s) => (
                          <td key={s.id} className="py-4 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {counts[s.id.toString()] || 0}
                              </span>
                              {total > 0 && (
                                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${Math.round(((counts[s.id.toString()] || 0) / total) * 100)}%`, backgroundColor: s.color }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className="py-4 px-6 text-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {total > 0 && (
                            <Link
                              href={`/employer/jobs/${job.id}/pipeline`}
                              className={cn(
                                "inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors",
                                dir === 'rtl' ? "flex-row" : ""
                              )}
                            >
                              {t('view_details')}
                              <ChevronRight className={cn("w-4 h-4", dir === 'rtl' ? "rotate-180" : "")} />
                            </Link>
                          )}
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
