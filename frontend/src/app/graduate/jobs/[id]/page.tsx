'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import { jobService } from '@/lib/api-services'
import {
  Briefcase, MapPin, Banknote, Clock, BookmarkCheck,
  Star, GraduationCap, ArrowRight, Loader2,
  CheckCircle, AlertCircle, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobPost } from '@/lib/types'
import { useTranslation } from '@/i18n'

const emplTypeLabels: Record<string, string> = {
  full_time: 'full_time',
  part_time: 'part_time',
  freelance: 'freelance',
  contract: 'contract',
  internship: 'internship',
  remote: 'remote',
}

const expLevelLabels: Record<string, string> = {
  entry: 'entry_level',
  junior: 'entry_level',
  mid: 'mid_level',
  senior: 'senior_level',
  lead: 'lead_level',
  executive: 'senior_level',
}

export default function JobDetailPage() {
  const { t, dir } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    jobService.getJob(id)
      .then((res) => {
        setJob(res.data)
        jobService.incrementView(id).catch(() => {})
      })
      .catch(() => setError(t('error')))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!job || job.has_applied) return
    setApplying(true)
    try {
      await jobService.applyToJob(job.id, {})
      setJob({ ...job, has_applied: true, applications_count: job.applications_count + 1 })
    } catch { setError(t('error')) }
    finally { setApplying(false) }
  }

  const handleToggleSave = async () => {
    if (!job) return
    setSaving(true)
    try {
      await jobService.toggleSaveJob(job.id)
      setJob({ ...job, is_saved: !job.is_saved })
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/graduate/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors mb-4 group"
        >
          <ArrowRight className={cn("w-4 h-4 transition-transform", dir === 'rtl' ? "rotate-180" : "")} />
          {t('graduate.jobs.detail.back_to_jobs')}
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => router.refresh()} className="btn-primary">{t('retry')}</button>
          </div>
        )}

        {!loading && !error && !job && (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('graduate.jobs.detail.not_found')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('graduate.jobs.detail.not_found_desc')}</p>
            <Link href="/graduate/jobs" className="btn-primary">{t('graduate.jobs.detail.back_to_jobs')}</Link>
          </div>
        )}

        {job && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero section */}
            <div className="glass-card p-6 lg:p-8 relative overflow-hidden">
              {job.is_featured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-l from-amber-500 to-amber-400 text-white text-xs font-bold px-5 py-1.5 rounded-bl-2xl shadow-sm">
                    {t('featured')}
                  </div>
                </div>
              )}
              {job.is_urgent && (
                <div className="absolute top-0 left-0">
                  <div className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold px-5 py-1.5 rounded-br-2xl shadow-sm">
                    {t('urgent')}
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-primary-500/20">
                    {(job.company_name || 'C')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-primary-500 font-medium">{job.company_name}</span>
                      {job.company_verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {t('verified')}
                        </span>
                      )}
                      <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.city || job.company_city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:flex-shrink-0">
                  <button
                    onClick={handleApply}
                    disabled={job.has_applied || applying}
                    className="btn-primary py-3 px-6 disabled:opacity-50"
                  >
                    {applying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                    {job.has_applied ? t('applied') : t('apply_now')}
                  </button>
                  <button
                    onClick={handleToggleSave}
                    disabled={saving}
                    className={`btn-secondary p-3 ${job.is_saved ? 'text-primary-500 border-primary-300 dark:border-primary-700' : ''}`}
                    title={t('save_job')}
                  >
                    <BookmarkCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('graduate.jobs.detail.posted')}: {job.time_ago}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.applications_count || 0} {t('applicants')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <ExternalLink className="w-4 h-4" />
                  <span>{job.views_count || 0} {t('views')}</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {job.description && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('description')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('graduate.jobs.detail.responsibilities')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('requirements')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('graduate.jobs.detail.benefits')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{job.benefits}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t('job_details')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('employment_type')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t(emplTypeLabels[job.employment_type] || job.employment_type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('experience_level')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t(expLevelLabels[job.experience_level] || job.experience_level)}</p>
                      </div>
                    </div>
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('salary')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {job.salary_min?.toLocaleString()}{job.salary_min && job.salary_max ? ' - ' : ''}{job.salary_max?.toLocaleString()}{' '}{job.salary_currency}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('location')}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.city || job.company_city}</p>
                      </div>
                    </div>
                    {job.vacancies > 1 && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('vacancies')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.vacancies}</p>
                        </div>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('deadline')}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(job.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Skills */}
                {job.skills_list && job.skills_list.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">{t('graduate.jobs.detail.required_skills')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_list.map((skill) => (
                        <span key={skill.id || skill.name_ar} className="badge-primary">{skill.name_ar}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad */}
                <AdBanner size="small" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


