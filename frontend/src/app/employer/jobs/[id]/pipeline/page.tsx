'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Skeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import {
  ArrowRight, Users, Star, Calendar, ChevronDown,
  FileText, X, Loader2, AlertCircle, CheckCircle,
  Plus, Trash2, Save,
} from 'lucide-react'
import { jobService, pipelineService } from '@/lib/api-services'
import type { JobApplication, PipelineStage, ApplicationStage, Scorecard, ScorecardCriterion, ScorecardResult } from '@/lib/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

export default function PipelinePage() {
  const { t, dir } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [stageMap, setStageMap] = useState<Record<string, ApplicationStage>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [movingApp, setMovingApp] = useState<string | null>(null)
  const [showScorecard, setShowScorecard] = useState(false)
  const [scorecards, setScorecards] = useState<Scorecard[]>([])
  const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | null>(null)
  const [criteria, setCriteria] = useState<ScorecardCriterion[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<ScorecardResult[]>([])
  const [activeScorecardTab, setActiveScorecardTab] = useState<'rate' | 'results'>('rate')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [appsRes, stagesRes, scorecardsRes] = await Promise.all([
        jobService.getJobApplications(jobId),
        pipelineService.getStages(),
        pipelineService.getScorecards(jobId),
      ])
      const apps: JobApplication[] = appsRes.data
      setApplications(apps)
      if (apps.length > 0) setJobTitle(apps[0].job_title)
      else {
        const jobRes = await jobService.getJob(jobId)
        setJobTitle(jobRes.data.title)
      }
      setStages(stagesRes.data)
      setScorecards(scorecardsRes.data)

      const sMap: Record<string, ApplicationStage> = {}
      await Promise.all(
        apps.map(async (app) => {
          try {
            const res = await pipelineService.getApplicationStage(app.id)
            sMap[app.id] = res.data
          } catch {}
        })
      )
      setStageMap(sMap)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }, [jobId, t])

  useEffect(() => { fetchData() }, [fetchData])

  const moveStage = async (appId: string, stageId: string) => {
    setMovingApp(appId)
    try {
      const res = await pipelineService.updateApplicationStage(appId, stageId)
      setStageMap((prev) => ({ ...prev, [appId]: res.data }))
    } catch {
      setError(t('error'))
    } finally {
      setMovingApp(null)
    }
  }

  const getAppStageId = (app: JobApplication): string => {
    return stageMap[app.id]?.stage || stages[0]?.id?.toString() || ''
  }

  const getStageByApp = (app: JobApplication): PipelineStage | undefined => {
    const stageId = getAppStageId(app)
    return stages.find((s) => s.id.toString() === stageId)
  }

  const openScorecard = async (app: JobApplication) => {
    setSelectedApp(app)
    setShowScorecard(true)
    setActiveScorecardTab('rate')
    setScores({})
    setComments({})
    setSelectedScorecard(null)
    setCriteria([])
    setResults([])
    try {
      const res = await pipelineService.getResults(app.id)
      setResults(res.data)
    } catch {}
  }

  const loadScorecardCriteria = async (sc: Scorecard) => {
    setSelectedScorecard(sc)
    setScores({})
    setComments({})
    try {
      const res = await pipelineService.getCriteria(sc.id)
      setCriteria(res.data)
    } catch {
      setError(t('error'))
    }
  }

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [criterionId]: value }))
  }

  const handleCommentChange = (criterionId: string, value: string) => {
    setComments((prev) => ({ ...prev, [criterionId]: value }))
  }

  const submitScorecard = async () => {
    if (!selectedApp || !selectedScorecard) return
    setSubmitting(true)
    try {
      const scoresData = criteria.map((c) => ({
        criterion: c.id,
        score: scores[c.id] || 0,
        comment: comments[c.id] || '',
      }))
      await pipelineService.submitResult({
        application: selectedApp.id,
        scorecard: selectedScorecard.id,
        scores: scoresData,
      })
      setActiveScorecardTab('results')
      const res = await pipelineService.getResults(selectedApp.id)
      setResults(res.data)
    } catch {
      setError(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const appsByStage: Record<string, JobApplication[]> = {}
  stages.forEach((s) => { appsByStage[s.id.toString()] = [] })
  applications.forEach((app) => {
    const stageId = getAppStageId(app)
    if (appsByStage[stageId]) appsByStage[stageId].push(app)
    else {
      const firstStage = stages[0]
      if (firstStage) appsByStage[firstStage.id.toString()].push(app)
    }
  })

  if (loading) {
    return (
      <DashboardLayout role="employer">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] flex-1 space-y-3">
                <Skeleton className="h-10 w-full" />
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <Link
              href={`/employer/jobs/${jobId}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors mb-2 group"
            >
              <ArrowRight className={cn("w-4 h-4 transition-transform", dir === 'rtl' ? "rotate-180" : "")} />
              {t('back')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('employer.pipeline.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{jobTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="stat-card px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              <span className="font-semibold">{applications.length}</span>
              <span className="text-xs text-gray-500">{t('employer.pipeline.total_applications')}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Kanban Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {stages.map((stage) => {
            const appList = appsByStage[stage.id.toString()] || []
            return (
              <div key={stage.id} className="min-w-[280px] w-[280px] shrink-0">
                <div
                  className="rounded-xl p-3 mb-3 text-white font-semibold text-sm flex items-center justify-between"
                  style={{ backgroundColor: stage.color }}
                >
                  <span>{dir === 'rtl' ? stage.name_ar : stage.name}</span>
                  <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs">{appList.length}</span>
                </div>
                <div className="space-y-3">
                  {appList.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      {t('employer.pipeline.no_candidates')}
                    </div>
                  )}
                  {appList.map((app) => {
                    const currentStage = getStageByApp(app)
                    return (
                      <div
                        key={app.id}
                        className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(app.applicant_name || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {app.applicant_name}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {app.match_score && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {Math.round(app.match_score)}% {t('match')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <select
                            value={currentStage?.id?.toString() || ''}
                            onChange={(e) => {
                              e.stopPropagation()
                              moveStage(app.id, e.target.value)
                            }}
                            disabled={movingApp === app.id}
                            className="input-field text-xs py-1.5 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {dir === 'rtl' ? s.name_ar : s.name}
                              </option>
                            ))}
                          </select>
                          {movingApp === app.id && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary-500 shrink-0" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openScorecard(app)
                          }}
                          className="mt-2 w-full text-xs py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          {t('employer.pipeline.scorecard')}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Applicant Detail Drawer */}
      {selectedApp && !showScorecard && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-navy-800 h-full overflow-y-auto rtl:border-l ltr:border-r border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedApp.applicant_name}</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                  {(selectedApp.applicant_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('match_score')}</p>
                  {selectedApp.match_score ? (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${Math.min(Math.round(selectedApp.match_score), 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(selectedApp.match_score)}%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">--</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-navy-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('status')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {getStageByApp(selectedApp) ? (dir === 'rtl' ? getStageByApp(selectedApp)!.name_ar : getStageByApp(selectedApp)!.name) : '--'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-navy-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('posted_date')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {new Date(selectedApp.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedApp.notes && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('notes')}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-navy-900 rounded-xl p-3">{selectedApp.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t('employer.pipeline.move_to')}</p>
                <select
                  value={getStageByApp(selectedApp)?.id?.toString() || ''}
                  onChange={(e) => {
                    moveStage(selectedApp.id, e.target.value)
                  }}
                  className="input-field"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {dir === 'rtl' ? s.name_ar : s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => openScorecard(selectedApp)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t('employer.pipeline.scorecard')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {showScorecard && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('employer.pipeline.scorecard')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{selectedApp.applicant_name}</p>
              </div>
              <button onClick={() => setShowScorecard(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {scorecards.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('no_data')}</p>
              </div>
            ) : (
              <>
                {/* Scorecard selector */}
                <div className="px-6 pt-4">
                  <div className="flex gap-2 flex-wrap">
                    {scorecards.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => loadScorecardCriteria(sc)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                          selectedScorecard?.id === sc.id
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-navy-600'
                        )}
                      >
                        {sc.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs: Rate / Results */}
                {selectedScorecard && (
                  <div className="px-6 pt-4 flex gap-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveScorecardTab('rate')}
                      className={cn(
                        'pb-2 text-sm font-medium border-b-2 transition-colors',
                        activeScorecardTab === 'rate'
                          ? 'text-primary-500 border-primary-500'
                          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                      )}
                    >
                      {t('employer.pipeline.score')}
                    </button>
                    <button
                      onClick={() => setActiveScorecardTab('results')}
                      className={cn(
                        'pb-2 text-sm font-medium border-b-2 transition-colors',
                        activeScorecardTab === 'results'
                          ? 'text-primary-500 border-primary-500'
                          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                      )}
                    >
                      {t('employer.pipeline.score')} ({results.length})
                    </button>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {activeScorecardTab === 'rate' && selectedScorecard && (
                    <>
                      {criteria.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('no_data')}</p>
                      )}
                      {criteria.map((c) => (
                        <div key={c.id} className="bg-gray-50 dark:bg-navy-900 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {dir === 'rtl' ? c.name_ar : c.name}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('employer.pipeline.max_score')}: {c.max_points}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={c.max_points}
                              step={0.5}
                              value={scores[c.id] ?? 0}
                              onChange={(e) => handleScoreChange(c.id, parseFloat(e.target.value))}
                              className="flex-1 accent-primary-500"
                            />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-center">
                              {scores[c.id] ?? 0}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={t('employer.pipeline.comment') as string}
                            value={comments[c.id] || ''}
                            onChange={(e) => handleCommentChange(c.id, e.target.value)}
                            className="input-field text-sm mt-2"
                          />
                        </div>
                      ))}
                      {criteria.length > 0 && (
                        <button
                          onClick={submitScorecard}
                          disabled={submitting}
                          className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {t('employer.pipeline.submit_score')}
                        </button>
                      )}
                    </>
                  )}

                  {activeScorecardTab === 'results' && (
                    <>
                      {results.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('no_data')}</p>
                      ) : (
                        results.map((r) => (
                          <div key={r.id} className="bg-gray-50 dark:bg-navy-900 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{r.scorecard_title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(r.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold text-primary-500">{Math.round(r.total_score)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('employer.pipeline.score')}</p>
                              </div>
                            </div>
                            {r.scores?.length > 0 && (
                              <div className="space-y-1.5">
                                {r.scores.map((s) => (
                                  <div key={s.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{s.criterion}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{s.score}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {r.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{r.notes}</p>
                            )}
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
