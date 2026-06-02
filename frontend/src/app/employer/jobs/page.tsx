'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Briefcase, Users, Eye, Plus, Search,
  Edit3, PauseCircle, XCircle, Clock, CheckCircle,
  Loader2, AlertCircle, Save,
} from 'lucide-react'
import { jobService } from '@/lib/api-services'
import type { JobPost } from '@/lib/types'
import { useTranslation } from '@/i18n'

const tabs = [
  { key: 'all' },
  { key: 'active' },
  { key: 'draft' },
  { key: 'closed' },
]

const statusConfig: Record<string, { class: string; icon: any }> = {
  active: { class: 'badge-success', icon: CheckCircle },
  published: { class: 'badge-success', icon: CheckCircle },
  draft: { class: 'badge-warning', icon: Clock },
  closed: { class: 'badge-danger', icon: XCircle },
}

const defaultForm = {
  title: '',
  description: '',
  employment_type: 'full_time',
  experience_level: 'mid',
  city: '',
  is_remote: false,
  salary_min: '',
  salary_max: '',
  vacancies: 1,
  deadline: '',
}

export default function JobsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchJobs()
  }, [isAuthenticated])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await jobService.listJobs({ page_size: 100 })
      setJobs(data.results || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingJob(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const openEditModal = (job: JobPost) => {
    setEditingJob(job)
    setForm({
      title: job.title,
      description: job.description || '',
      employment_type: job.employment_type || 'full_time',
      experience_level: job.experience_level || 'mid',
      city: job.city || '',
      is_remote: job.is_remote || false,
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      vacancies: job.vacancies || 1,
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        vacancies: Number(form.vacancies),
        deadline: form.deadline || null,
      }
      if (editingJob) {
        await jobService.updateJob(editingJob.id, payload)
      } else {
        await jobService.createJob(payload)
      }
      setShowModal(false)
      fetchJobs()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await jobService.publishJob(id)
      fetchJobs()
    } catch {
      setError(t('error'))
    }
  }

  const handleClose = async (id: string) => {
    try {
      await jobService.closeJob(id)
      fetchJobs()
    } catch {
      setError(t('error'))
    }
  }

  const activeJobs = jobs.filter((j) => j.status === 'active' || j.status === 'published')
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0)
  const totalViews = jobs.reduce((acc, j) => acc + (j.views_count || 0), 0)

  const getStatusKey = (status: string) => {
    if (status === 'published') return 'active'
    return status
  }

  const getStatusLabel = (status: string) => {
    if (status === 'active' || status === 'published') return t('published')
    if (status === 'draft') return t('draft')
    if (status === 'closed') return t('closed')
    return status
  }

  const filteredJobs = jobs.filter((job) => {
    const statusKey = getStatusKey(job.status)
    if (activeTab !== 'all' && statusKey !== activeTab) return false
    if (searchQuery && !job.title.includes(searchQuery) && !job.city?.includes(searchQuery)) return false
    return true
  })

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.jobs.title')}</h1>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('employer.jobs.add')}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-2xl">{activeJobs.length}</div>
            <div className="stat-label">{t('employer.jobs.stats.active')}</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-2xl">{totalApplicants}</div>
            <div className="stat-label">{t('employer.jobs.stats.applicants')}</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="stat-value text-2xl">{totalViews.toLocaleString('en-US')}</div>
            <div className="stat-label">{t('employer.jobs.stats.views')}</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                }`}
              >
                {tab.key === 'all' ? t('all') : tab.key === 'active' ? t('published') : tab.key === 'draft' ? t('draft') : t('closed')}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('search') as string}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pr-10 py-2 w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-800">
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.job')}</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.status')}</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('applicants')}</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('views')}</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('employment_type')}</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('posted_date')}</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.jobs.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const statusKey = getStatusKey(job.status)
                  const config = statusConfig[statusKey] || statusConfig.draft
                  const StatusIcon = config.icon
                  return (
                    <tr key={job.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.city || (job.is_remote ? t('remote') : t('unspecified'))}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`${config.class} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900 dark:text-white">{job.applications_count || 0}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{(job.views_count || 0).toLocaleString('en-US')}</td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.employment_type === 'full_time' ? t('full_time') :
                           job.employment_type === 'part_time' ? t('part_time') :
                           job.employment_type === 'contract' ? t('contract') :
                           job.employment_type === 'freelance' ? t('freelance') :
                           job.employment_type || '--'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{formatDate(job.published_at)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                            title={t('edit')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {(statusKey === 'draft') && (
                            <button
                              onClick={() => handlePublish(job.id)}
                              className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
                              title={t('publish')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {statusKey === 'active' && (
                            <button
                              onClick={() => handleClose(job.id)}
                              className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"
                              title={t('pause')}
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          )}
                          {statusKey !== 'closed' && statusKey !== 'draft' && (
                            <button
                              onClick={() => handleClose(job.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                              title={t('close')}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('no_results')}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingJob ? t('employer.jobs.modal.edit') : t('employer.jobs.modal.create')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.jobs.modal.title')}</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder={t('employer.jobs.modal.title_example')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.jobs.modal.description')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px] resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.jobs.modal.work_type')}</label>
                  <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="input-field">
                    <option value="full_time">{t('full_time')}</option>
                    <option value="part_time">{t('part_time')}</option>
                    <option value="contract">{t('contract')}</option>
                    <option value="freelance">{t('freelance')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('experience_level')}</label>
                  <select value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })} className="input-field">
                    <option value="entry">{t('entry_level')}</option>
                    <option value="mid">{t('mid_level')}</option>
                    <option value="senior">{t('senior_level')}</option>
                    <option value="lead">{t('lead_level')}</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')}</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder={t('city_example')} />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_remote} onChange={(e) => setForm({ ...form, is_remote: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('remote')}</span>
                  </label>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.jobs.modal.salary_min')}</label>
                  <input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.jobs.modal.salary_max')}</label>
                  <input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('vacancies')}</label>
                  <input type="number" value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })} className="input-field" min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('deadline')}</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleSubmit} disabled={saving || !form.title.trim()} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('loading') : editingJob ? t('save') : t('employer.jobs.modal.add_job')}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
