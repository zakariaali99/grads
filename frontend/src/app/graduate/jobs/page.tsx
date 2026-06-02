'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import { jobService } from '@/lib/api-services'
import {
  Search, MapPin, Briefcase, Clock, Bookmark, BookmarkCheck,
  Star, ChevronDown, SlidersHorizontal, X, Building2,
  Banknote, Calendar, ExternalLink, Filter, ChevronLeft, ChevronRight,
  Loader2
} from 'lucide-react'
import type { JobPost, PaginatedResponse } from '@/lib/types'
import { useTranslation } from '@/i18n'

const ITEMS_PER_PAGE = 6

export default function JobsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { page: currentPage, page_size: ITEMS_PER_PAGE }
      if (searchQuery) params.search = searchQuery
      if (selectedLocation) params.city = selectedLocation
      if (selectedType) params.employment_type = selectedType
      if (selectedLevel) params.experience_level = selectedLevel
      const res = await jobService.listJobs(params)
      const data: PaginatedResponse<JobPost> = res.data
      setJobs(data.results)
      setTotalCount(data.count)
      setTotalPages(data.total_pages || Math.ceil(data.count / ITEMS_PER_PAGE))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [currentPage, selectedLocation, selectedType, selectedLevel])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1)
      else fetchJobs()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleSave = async (job: JobPost) => {
    try {
      await jobService.toggleSaveJob(job.id)
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
      )
    } catch {}
  }

  const locations = Array.from(new Set(jobs.map((j) => j.company_city).filter(Boolean)))

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">{t('graduate.jobs.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('graduate.jobs.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-sm py-2.5 ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400' : ''}`}
            >
              <Filter className="w-4 h-4" />
              {t('filter')}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">{totalCount} {t('graduate.jobs.count')}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-5 mb-6 animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_jobs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pr-12"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className={`grid sm:grid-cols-3 gap-3 transition-all duration-300 ${showFilters ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10 appearance-none"
              >
                <option value="">{t('all_cities')}</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="relative">
              <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10 appearance-none"
              >
                <option value="">{t('all_types')}</option>
                <option value="full_time">{t('full_time')}</option>
                <option value="part_time">{t('part_time')}</option>
                <option value="remote">{t('remote')}</option>
                <option value="internship">{t('internship')}</option>
                <option value="freelance">{t('freelance')}</option>
              </select>
            </div>
            <div className="relative">
              <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10 appearance-none"
              >
                <option value="">{t('all_levels')}</option>
                <option value="entry">{t('entry_level')}</option>
                <option value="mid">{t('mid_level')}</option>
                <option value="senior">{t('senior_level')}</option>
                <option value="lead">{t('lead_level')}</option>
              </select>
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
            <button onClick={fetchJobs} className="btn-primary">{t('retry')}</button>
          </div>
        )}

        {/* Job Cards */}
        {!loading && !error && (
          <>
            <div className="mb-6">
              <AdBanner size="medium" />
            </div>
            <div className="space-y-4 mb-8">
              {jobs.map((job) => (
                <div key={job.id} className="glass-card p-5 card-hover animate-fade-in relative overflow-hidden">
                  {job.is_featured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-l from-amber-500 to-amber-400 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl shadow-sm">
                        {t('featured')}
                      </div>
                    </div>
                  )}
                  {job.is_urgent && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold px-4 py-1 rounded-br-2xl shadow-sm">
                        {t('urgent')}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {(job.company_name || 'C')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
                          <p className="text-sm text-primary-500 font-medium">{job.company_name}</p>
                        </div>
                        <button
                          onClick={() => toggleSave(job)}
                          className={`btn-ghost p-2 ${job.is_saved ? 'text-primary-500' : 'text-gray-400'}`}
                        >
                          {job.is_saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.city || job.company_city}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.employment_type}</span>
                        {job.salary_min && job.salary_max && (
                          <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.salary_currency}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.time_ago}</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{job.experience_level}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills_list?.slice(0, 5).map((skill) => (
                          <span key={skill.id || skill.name_ar} className="badge-primary text-xs">{skill.name_ar}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => jobService.applyToJob(job.id, {}).then(() => {
                            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, has_applied: true } : j)))
                          }).catch(() => {})}
                          disabled={job.has_applied}
                          className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
                        >
                          <Briefcase className="w-4 h-4" />{job.has_applied ? t('applied') : t('apply_now')}
                        </button>
                        <button
                          onClick={() => router.push(`/graduate/jobs/${job.id}`)}
                          className="btn-secondary text-sm py-2 px-4"
                        >
                          <ExternalLink className="w-4 h-4" />{t('details')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('graduate.jobs.empty_title')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('graduate.jobs.empty_desc')}</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary text-sm py-2 px-3 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      page === currentPage
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary text-sm py-2 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
