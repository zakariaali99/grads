'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { interviewService } from '@/lib/api-services'
import {
  Calendar, Clock, Video, MapPin, Building2, Briefcase,
  Phone, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ExternalLink, Copy, FileText, Users, MessageSquare,
  ArrowLeft, ArrowRight, Loader2
} from 'lucide-react'
import type { Interview } from '@/lib/types'
import { useTranslation } from '@/i18n'

const INTERVIEW_TYPE_MAP: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  video: { icon: Video, label: 'graduate.interviews.type.video', color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  phone: { icon: Phone, label: 'graduate.interviews.type.phone', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  in_person: { icon: Building2, label: 'graduate.interviews.type.in_person', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  technical: { icon: Briefcase, label: 'graduate.interviews.type.technical', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
}

const STATUS_CONFIG: Record<string, { icon: any; label: string; style: string }> = {
  confirmed: { icon: CheckCircle, label: 'confirmed', style: 'badge-success' },
  pending: { icon: AlertCircle, label: 'pending', style: 'badge-warning' },
  completed: { icon: CheckCircle, label: 'completed', style: 'badge-primary' },
  accepted: { icon: CheckCircle, label: 'accepted', style: 'badge-success' },
  rejected: { icon: XCircle, label: 'rejected', style: 'badge-danger' },
  cancelled: { icon: XCircle, label: 'cancelled', style: 'badge-danger' },
}

function getInterviewTypeConfig(type: string) {
  return INTERVIEW_TYPE_MAP[type] || { icon: Video, label: type, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' }
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { icon: AlertCircle, label: status, style: 'badge-warning' }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ar-EG', {
    hour: '2-digit', minute: '2-digit',
  })
}

function InterviewCard({ interview, isPast }: { interview: Interview; isPast?: boolean }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const mode = getInterviewTypeConfig(interview.interview_type)
  const status = getStatusConfig(interview.status)

  return (
    <div className={`glass-card card-hover animate-fade-in ${isPast ? 'opacity-85' : ''}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
            {(interview.company_name || 'C')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{interview.job_title}</h3>
                <p className="text-sm text-primary-500">{interview.company_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={status.style}>{t(status.label)}</span>
                {interview.feedback && (
                  <span className="badge-primary text-xs">{interview.feedback}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${mode.bg}`}>
                <mode.icon className={`w-4 h-4 ${mode.color}`} />
                <span className={`text-xs font-medium ${mode.color}`}>{t(mode.label)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(interview.scheduled_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(interview.scheduled_at)} • {interview.duration_minutes} {t('minute')}</span>
              </div>
              {interview.location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{interview.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4">
              {!isPast && interview.status !== 'cancelled' && (
                <>
                  <button className="btn-primary text-sm py-2 px-4">
                    <Video className="w-4 h-4" />{t('join')}
                  </button>
                  <button className="btn-secondary text-sm py-2 px-4">
                    <MessageSquare className="w-4 h-4" />{t('message')}
                  </button>
                </>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-ghost text-sm mr-auto"
              >
                {t('details')}
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              {interview.applicant_name && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />المتقدم
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{interview.applicant_name}</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />{t('notes')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{interview.notes || t('no_notes')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InterviewsPage() {
  const { t } = useTranslation()
  const [allInterviews, setAllInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)

  const fetchInterviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await interviewService.list()
      setAllInterviews(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const now = new Date()
  const upcoming = allInterviews.filter((i) => new Date(i.scheduled_at) >= now && i.status !== 'cancelled' && i.status !== 'completed' && i.status !== 'rejected')
  const past = allInterviews.filter((i) => new Date(i.scheduled_at) < now || i.status === 'completed' || i.status === 'rejected' || i.status === 'cancelled')

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
          <button onClick={fetchInterviews} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">{t('graduate.interviews.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('graduate.interviews.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-bold text-primary-500">{upcoming.length}</span> {t('upcoming')}
            </span>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('upcoming')}</h2>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('no_data')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('no_data')}</p>
            </div>
          )}
        </div>

        {/* Past Interviews Toggle */}
        <button
          onClick={() => setShowPast(!showPast)}
          className="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-100 dark:bg-navy-800/50 hover:bg-gray-200 dark:hover:bg-navy-800 transition-colors mb-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-900 dark:text-white">{t('past')}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">({past.length})</span>
          </div>
          {showPast ? <ArrowRight className="w-5 h-5 text-gray-400" /> : <ArrowLeft className="w-5 h-5 text-gray-400" />}
        </button>

        {/* Past Interviews */}
        {showPast && (
          <div className="space-y-4 animate-slide-down">
            {past.length > 0 ? (
              past.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} isPast />
              ))
            ) : (
              <div className="glass-card p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('no_data')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
