'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/i18n'
import { searchService } from '@/lib/api-services'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import {
  Search, X, Building2, GraduationCap, Briefcase,
  MapPin, ChevronLeft, ChevronRight, Loader2, Filter,
  ArrowUpDown, RotateCcw,
} from 'lucide-react'
import Link from 'next/link'

interface SearchItem {
  id: string
  [key: string]: any
}

interface SearchResultGroup {
  count: number
  results: SearchItem[]
}

interface GlobalSearchResponse {
  jobs: SearchResultGroup
  graduates: SearchResultGroup
  companies: SearchResultGroup
}

type TabKey = 'jobs' | 'graduates' | 'companies'

const TABS: { key: TabKey; icon: typeof Briefcase }[] = [
  { key: 'jobs', icon: Briefcase },
  { key: 'graduates', icon: GraduationCap },
  { key: 'companies', icon: Building2 },
]

const SORT_OPTIONS = [
  { value: '', label: 'search.global.sort.relevance' },
  { value: 'newest', label: 'search.global.sort.newest' },
  { value: 'oldest', label: 'search.global.sort.oldest' },
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, dir } = useTranslation()
  const query = searchParams.get('q') || ''

  const [activeTab, setActiveTab] = useState<TabKey>('jobs')
  const [results, setResults] = useState<GlobalSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? parseInt(p, 10) : 1
  })
  const [searchInput, setSearchInput] = useState(query)
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {}
    const city = searchParams.get('city')
    const employmentType = searchParams.get('employment_type')
    const experienceLevel = searchParams.get('experience_level')
    if (city) f.city = city
    if (employmentType) f.employment_type = employmentType
    if (experienceLevel) f.experience_level = experienceLevel
    return f
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState(() => searchParams.get('sort') || '')

  const debouncedSearchInput = useDebounce(searchInput, 300)

  const pageSize = 10

  const activeFilterCount = Object.keys(filters).filter((k) => filters[k]).length

  const updateURL = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams()
      const q = params.q ?? query
      if (q) sp.set('q', q)
      if (params.page && params.page !== '1') sp.set('page', params.page)
      if (params.sort) sp.set('sort', params.sort)
      if (params.city) sp.set('city', params.city)
      if (params.employment_type) sp.set('employment_type', params.employment_type)
      if (params.experience_level) sp.set('experience_level', params.experience_level)
      const newUrl = `/search${sp.toString() ? `?${sp.toString()}` : ''}`
      router.replace(newUrl, { scroll: false })
    },
    [query, router]
  )

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await searchService.globalSearch({
        query: query.trim(),
        filters,
        sort: sort || undefined,
        page,
        page_size: pageSize,
      })
      setResults(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }, [query, filters, sort, page, t])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  useEffect(() => {
    setSearchInput(query)
    setPage(1)
  }, [query])

  useEffect(() => {
    if (debouncedSearchInput.trim() !== query) {
      if (debouncedSearchInput.trim()) {
        router.replace(`/search?q=${encodeURIComponent(debouncedSearchInput.trim())}`, { scroll: false })
      } else {
        router.replace('/search', { scroll: false })
      }
    }
  }, [debouncedSearchInput, query, router])

  useEffect(() => {
    updateURL({
      page: page > 1 ? String(page) : undefined,
      sort: sort || undefined,
      city: filters.city || undefined,
      employment_type: filters.employment_type || undefined,
      experience_level: filters.experience_level || undefined,
    })
  }, [page, sort, filters, updateURL])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.replace(`/search?q=${encodeURIComponent(searchInput.trim())}`, { scroll: false })
    }
  }

  const activeResults = results ? results[activeTab] : null
  const totalCount = activeResults?.count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const clearAllFilters = () => {
    setFilters({})
    setSort('')
    setPage(1)
  }

  const renderJobCard = (job: any) => (
    <Link
      key={job.id}
      href={`/graduate/jobs/${job.id}`}
      className="block bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.company_name}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
          {job.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.city}
            </span>
          )}
          {job.employment_type && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-navy-700 text-xs">
              {t(job.employment_type)}
            </span>
          )}
          {job.experience_level && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-navy-700 text-xs">
              {t(job.experience_level)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )

  const renderGraduateCard = (grad: any) => (
    <Link
      key={grad.id}
      href={`/graduate/profile/${grad.id}`}
      className="block bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0">
          {(grad.user?.full_name || grad.user?.username || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {grad.user?.full_name || grad.user?.username}
          </h3>
          {grad.headline && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{grad.headline}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {grad.college_name && <span>{grad.college_name}</span>}
            {grad.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {grad.city}
              </span>
            )}
            {grad.skills?.slice(0, 3).map((s: any) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs"
              >
                {s.skill_name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )

  const renderCompanyCard = (company: any) => (
    <Link
      key={company.id}
      href={`/employer/company/${company.id}`}
      className="block bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
          {company.company_name?.[0] || 'C'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{company.company_name}</h3>
          {company.industry_name && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry_name}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {company.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {company.city}
              </span>
            )}
            {company.job_count > 0 && (
              <span className="text-xs">{company.job_count} {t('total_jobs')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {query ? t('search.global.results_for', { query }) : t('search.global.title')}
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('search.global.placeholder')}
              className="w-full ltr:pl-12 ltr:pr-12 rtl:pr-12 rtl:pl-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-navy-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); router.replace('/search', { scroll: false }) }}
                className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>

        <div className="flex gap-6">
          <aside className={cn('shrink-0 w-64 space-y-6', 'max-lg:hidden')}>
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {t('filter')}
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('search.global.filter.city')}
                </label>
                <input
                  value={filters.city || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                  placeholder={t('city')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {activeTab === 'jobs' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('search.global.filter.type')}
                  </label>
                  <select
                    value={filters.employment_type || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, employment_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">{t('all_types')}</option>
                    <option value="full_time">{t('full_time')}</option>
                    <option value="part_time">{t('part_time')}</option>
                    <option value="contract">{t('contract')}</option>
                    <option value="freelance">{t('freelance')}</option>
                    <option value="internship">{t('internship')}</option>
                    <option value="remote">{t('remote')}</option>
                  </select>
                </div>
              )}
              {(activeTab === 'jobs' || activeTab === 'graduates') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('search.global.filter.experience')}
                  </label>
                  <select
                    value={filters.experience_level || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, experience_level: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">{t('all_levels')}</option>
                    <option value="entry_level">{t('entry_level')}</option>
                    <option value="mid_level">{t('mid_level')}</option>
                    <option value="senior_level">{t('senior_level')}</option>
                    <option value="lead_level">{t('lead_level')}</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => { setFilters({}); setPage(1) }}
                className="w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
              >
                {t('reset') || 'Reset'}
              </button>
            </div>
          </aside>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-primary-500 text-white rounded-full shadow-lg flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('filter')}
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowFilters(false)}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-navy-800 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('filter')}</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('search.global.filter.city')}
                  </label>
                  <input
                    value={filters.city || ''}
                    onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                    placeholder={t('city')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy-900 text-sm"
                  />
                </div>
                <button
                  onClick={() => { setFilters({}); setPage(1); setShowFilters(false) }}
                  className="w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {t('reset') || 'Reset'}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <div className="flex gap-1 bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 flex-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key
                  const count = results ? results[tab.key]?.count ?? 0 : 0
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700'
                      )}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{t(`search.global.tab.${tab.key}`)}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-full text-xs',
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                              : 'bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ArrowUpDown className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1) }}
                    className="appearance-none bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 ltr:pr-10 rtl:pl-10 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                    ))}
                  </select>
                </div>
                {(activeFilterCount > 0 || sort) && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-200 dark:hover:border-red-800"
                    title={t('clear_all')}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('clear_all') || 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 mb-2">{error}</p>
                <button onClick={performSearch} className="text-primary-500 hover:underline text-sm">
                  {t('retry')}
                </button>
              </div>
            ) : !query ? (
              <div className="text-center py-20 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('search.global.placeholder')}</p>
              </div>
            ) : !activeResults || activeResults.results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('search.global.no_results', { query })}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {activeTab === 'jobs' && activeResults.results.map(renderJobCard)}
                  {activeTab === 'graduates' && activeResults.results.map(renderGraduateCard)}
                  {activeTab === 'companies' && activeResults.results.map(renderCompanyCard)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {dir === 'ltr' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      const start = Math.max(1, page - 5)
                      return start + i
                    })
                      .filter((p) => p <= totalPages)
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={cn(
                            'w-8 h-8 rounded-lg text-sm font-medium',
                            p === page
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {dir === 'ltr' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
