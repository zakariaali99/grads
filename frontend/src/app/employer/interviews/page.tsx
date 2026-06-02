'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Calendar, Clock, MapPin, Video, Plus, User,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Save, Trash2,
} from 'lucide-react'
import { interviewService, applicationService } from '@/lib/api-services'
import type { Interview, JobApplication } from '@/lib/types'
import { useTranslation } from '@/i18n'

const interviewTypes: Record<string, { class: string; icon: any }> = {
  video: { class: 'badge-primary', icon: Video },
  in_person: { class: 'badge-success', icon: MapPin },
  phone: { class: 'badge-info', icon: Video },
  technical: { class: 'badge-warning', icon: Video },
}

const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-purple-500 to-purple-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
]

export default function InterviewsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    application: '',
    interview_type: 'video',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    notes: '',
  })

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
      const [interviewsRes, appsRes] = await Promise.all([
        interviewService.list(),
        applicationService.list({ page_size: 50 }),
      ])
      setInterviews(interviewsRes.data || [])
      setApplications(appsRes.data.results || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const upcoming = interviews.filter((i) => new Date(i.scheduled_at) > now)
  const past = interviews.filter((i) => new Date(i.scheduled_at) <= now)

  const openCreateModal = () => {
    setForm({
      application: applications[0]?.id || '',
      interview_type: 'video',
      scheduled_at: '',
      duration_minutes: 60,
      location: '',
      notes: '',
    })
    setShowModal(true)
  }

  const handleCreate = async () => {
    if (!form.application || !form.scheduled_at) return
    setSaving(true)
    setError(null)
    try {
      await interviewService.create(form)
      setShowModal(false)
      loadData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await interviewService.delete(id)
      loadData()
    } catch {
      setError(t('error'))
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    const hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'م' : 'ص'
    const h12 = hours % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  const getAppLabel = (appId: string) => {
    const app = applications.find((a) => a.id === appId)
    if (!app) return t('unspecified')
    return `${app.applicant_name} - ${app.job_title}`
  }

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.interviews.title')}</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('employer.interviews.schedule')}
        </button>
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            {t('employer.interviews.upcoming')}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({upcoming.length})</span>
          </h2>

          {upcoming.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500 dark:text-gray-400 mb-8">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{t('no_data')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {upcoming.map((interview, i) => {
                const typeConfig = interviewTypes[interview.interview_type] || interviewTypes.video
                const TypeIcon = typeConfig.icon
                return (
                  <div key={interview.id} className="glass-card p-5 card-hover">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold`}>
                          {interview.applicant_name?.[0] || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{interview.applicant_name || t('unspecified')}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{interview.job_title || '--'}</p>
                        </div>
                      </div>
                      <span className={typeConfig.class}>
                        <TypeIcon className="w-3 h-3" />
                        {t('employer.interviews.type.' + interview.interview_type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        {formatDate(interview.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary-500" />
                        {formatTime(interview.scheduled_at)}
                      </span>
                      <span className="text-xs text-gray-400">{interview.duration_minutes} {t('minute')}</span>
                    </div>

                    {interview.interview_type === 'video' || interview.interview_type === 'online' ? (
                      interview.location ? (
                        <a href={interview.location} target="_blank" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          {interview.location}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          {t('no_link_specified')}
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        {interview.location || t('no_location_specified')}
                      </p>
                    )}

                    {interview.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{interview.notes}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className={`text-xs font-medium flex items-center gap-1 ${
                        interview.status === 'confirmed' ? 'text-emerald-600' :
                        interview.status === 'pending' ? 'text-amber-600' :
                        'text-gray-500'
                      }`}>
                        {interview.status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> :
                         interview.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> :
                         <Clock className="w-3.5 h-3.5" />}
                        {interview.status === 'confirmed' ? t('employer.interviews.status.confirmed') :
                         interview.status === 'pending' ? t('pending') :
                         interview.status || '--'}
                      </span>
                      <button
                        onClick={() => handleDelete(interview.id)}
                        className="btn-ghost text-xs py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {past.length > 0 && (
            <>
              <button
                onClick={() => setShowPast(!showPast)}
                className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4 hover:text-primary-500 transition-colors"
              >
                {showPast ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                {t('employer.interviews.past')}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({past.length})</span>
              </button>

              {showPast && (
                <div className="grid md:grid-cols-2 gap-4 animate-slide-down">
                  {past.map((interview, i) => (
                    <div key={interview.id} className="glass-card p-5 opacity-80">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold`}>
                            {interview.applicant_name?.[0] || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{interview.applicant_name || t('unspecified')}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{interview.job_title || '--'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(interview.scheduled_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(interview.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatTime(interview.scheduled_at)}
                        </span>
                      </div>
                      {interview.feedback && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{t('notes')}: {interview.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('employer.interviews.modal.title')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.interviews.modal.candidate')}</label>
                <select value={form.application} onChange={(e) => setForm({ ...form, application: e.target.value })} className="input-field">
                  <option value="">{t('choose_candidate')}</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>{app.applicant_name} - {app.job_title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.interviews.modal.type')}</label>
                <select value={form.interview_type} onChange={(e) => setForm({ ...form, interview_type: e.target.value })} className="input-field">
                  <option value="video">{t('employer.interviews.type.video')}</option>
                  <option value="in_person">{t('employer.interviews.type.in_person')}</option>
                  <option value="phone">{t('employer.interviews.type.phone')}</option>
                  <option value="technical">{t('employer.interviews.type.technical')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('datetime')}</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.interviews.modal.duration')}</label>
                <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="input-field" min="15" step="15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {form.interview_type === 'online' ? t('employer.interviews.modal.link') : t('location')}
                </label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder={form.interview_type === 'online' ? 'https://meet.google.com/...' : t('company_location_placeholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field min-h-[80px] resize-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleCreate} disabled={saving || !form.application || !form.scheduled_at} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('loading') : t('employer.interviews.modal.schedule')}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
