'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { applicationService } from '@/lib/api-services'
import {
  FileText, Send, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, Calendar, Building2, MapPin, Briefcase, ChevronDown,
  Search, BarChart3, ListFilter, Star, MessageSquare, Trash2,
  Loader2
} from 'lucide-react'
import type { JobApplication, PaginatedResponse } from '@/lib/types'
import { useTranslation } from '@/i18n'

const statuses = [
  { key: 'all', label: 'all' as const },
  { key: 'pending', label: 'pending' as const },
  { key: 'shortlisted', label: 'shortlisted' as const },
  { key: 'interview', label: 'interview' as const },
  { key: 'accepted', label: 'accepted' as const },
  { key: 'rejected', label: 'rejected' as const },
]

const statusStyles: Record<string, string> = {
  pending: 'badge-warning',
  shortlisted: 'badge-primary',
  interview: 'badge-success',
  accepted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  rejected: 'badge-danger',
}

const statusLabels: Record<string, string> = {
  pending: 'pending',
  shortlisted: 'shortlisted',
  interview: 'interview',
  accepted: 'accepted',
  rejected: 'rejected',
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  shortlisted: AlertCircle,
  interview: Calendar,
  accepted: CheckCircle,
  rejected: XCircle,
}

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { page: 1, page_size: 50 }
      if (activeTab !== 'all') params.status = activeTab
      const res = await applicationService.list(params)
      setApplications((res.data as PaginatedResponse<JobApplication>).results)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [activeTab])

  const filtered = applications.filter((app) =>
    app.job_title.includes(searchTerm) || app.company_name.includes(searchTerm)
  )

  const stats = [
    { label: t('total_applications'), value: applications.length, icon: FileText, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: t('pending'), value: applications.filter((a) => a.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: t('shortlisted'), value: applications.filter((a) => a.status === 'shortlisted').length, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: t('interviews'), value: applications.filter((a) => a.status === 'interview').length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('accepted'), value: applications.filter((a) => a.status === 'accepted').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('rejected'), value: applications.filter((a) => a.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  ]

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">{t('graduate.applications.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('graduate.applications.subtitle')}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card text-center animate-fade-in">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value text-2xl">{stat.value}</div>
              <div className="stat-label text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="glass-card p-4 mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setActiveTab(status.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === status.key
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                  }`}
                >
                  {t(status.label)}
                  <span className={`mr-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === status.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {status.key === 'all' ? applications.length : applications.filter((a) => a.status === status.key).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-10 py-2 text-sm w-48"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass-card p-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchApplications} className="btn-primary">{t('retry')}</button>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filtered.map((app) => {
              const StatusIcon = statusIcons[app.status] || Clock
              return (
                <div key={app.id} className="glass-card card-hover animate-fade-in overflow-hidden">
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(app.company_name || 'C')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{app.job_title}</h3>
                            <p className="text-sm text-primary-500">{app.company_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={statusStyles[app.status] || 'badge-primary'}>{t(statusLabels[app.status] || app.status)}</span>
                            {app.match_score != null && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <Star className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{app.match_score}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(app.applied_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === app.id && (
                    <div className="px-5 pb-5 pt-0 animate-slide-up">
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-primary-500" />{t('notes')}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{app.notes || t('no_notes')}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary-500" />{t('match_score')}
                            </h4>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                  className="h-3 rounded-full gradient-primary transition-all"
                                  style={{ width: `${app.match_score || 0}%` }}
                                />
                              </div>
                              <span className="text-lg font-bold text-primary-500">{app.match_score || 0}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          {app.status === 'interview' && (
                            <button onClick={() => router.push('/graduate/interviews')} className="btn-primary text-sm py-2 px-4">
                              <Calendar className="w-4 h-4" />{t('view_interview_details')}
                            </button>
                          )}
                          {app.status === 'pending' && (
                            <button className="btn-primary text-sm py-2 px-4">
                              <Send className="w-4 h-4" />{t('follow_up')}
                            </button>
                          )}
                          <button onClick={() => router.push('/graduate/jobs')} className="btn-secondary text-sm py-2 px-4">
                            <Eye className="w-4 h-4" />{t('view_job')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="glass-card p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('graduate.applications.empty_title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('graduate.applications.empty_desc')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
