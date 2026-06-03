'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, Building2, MapPin, Briefcase, BadgeCheck, Shield,
  Eye, AlertTriangle, Star, Users, ChevronLeft, ChevronRight,
  Globe, Clock, CheckCircle, Trash2, X, ToggleLeft, ToggleRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface AdminCompany {
  id: string
  company_name: string
  industry: string
  industry_name: string
  company_size: string
  city: string
  website: string | null
  description: string | null
  is_verified: boolean
  is_featured: boolean
  total_jobs: number
  job_count: number
  total_hires: number
  created_at: string
  user: { id: string; full_name: string; email: string }
}

const sizeLabels: Record<string, string> = {
  '1-10': 'admin.companies.size.small',
  '11-50': 'admin.companies.size.medium',
  '51-200': 'admin.companies.size.large',
  '201-1000': 'admin.companies.size.very_large',
  '1000+': 'admin.companies.size.huge',
}

export default function AdminCompaniesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [verifyFilter, setVerifyFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailCompanyId, setDetailCompanyId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminCompany | null>(null)
  const pageSize = 9

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadCompanies = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (industryFilter !== 'all') params.industry = industryFilter
      if (cityFilter !== 'all') params.city = cityFilter
      if (verifyFilter === 'verified') params.is_verified = 'true'
      else if (verifyFilter === 'unverified') params.is_verified = 'false'
      const { data } = await adminService.listCompanies(params)
      setCompanies(data.results || data || [])
      setTotalCount(data.count || data.length || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, industryFilter, cityFilter, verifyFilter, currentPage])

  useEffect(() => { loadCompanies() }, [loadCompanies])

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(id)
      await adminService.verifyCompany(id)
      await loadCompanies()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      setActionLoading(id)
      await adminService.toggleFeaturedCompany(id)
      await loadCompanies()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id)
      await adminService.deleteCompany(id)
      setDeleteConfirm(null)
      await loadCompanies()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const industries = Array.from(new Set(companies.map((c) => c.industry_name || c.industry).filter(Boolean)))
  const cities = Array.from(new Set(companies.map((c) => c.city).filter(Boolean)))

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const verifiedCount = companies.filter((c) => c.is_verified).length
  const pendingCount = companies.filter((c) => !c.is_verified).length
  const featuredCount = companies.filter((c) => c.is_featured).length

  if (isLoading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.companies.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.companies.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('admin.companies.stats.total'), value: totalCount, icon: Building2, color: 'text-blue-600' },
            { label: t('verified'), value: verifiedCount, icon: BadgeCheck, color: 'text-emerald-600' },
            { label: t('admin.companies.stats.pending'), value: pendingCount, icon: Clock, color: 'text-amber-600' },
            { label: t('featured'), value: featuredCount, icon: Star, color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('admin.companies.search_placeholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setCurrentPage(1) }} className="input-field w-44">
                <option value="all">{t('admin.companies.filter.all_industries')}</option>
                {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1) }} className="input-field w-36">
                <option value="all">{t('all_cities')}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={verifyFilter} onChange={(e) => { setVerifyFilter(e.target.value); setCurrentPage(1) }} className="input-field w-36">
                <option value="all">{t('admin.companies.filter.all_status')}</option>
                <option value="verified">{t('verified')}</option>
                <option value="unverified">{t('unverified')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadCompanies} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-slate-500">{t('no_results')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div key={company.id} className="glass-card p-5 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {(company.company_name || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{company.company_name}</h3>
                        <p className="text-xs text-slate-500 truncate">{company.industry_name || company.industry}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {company.is_featured && (
                        <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5">
                          <Star className="w-3 h-3" />
                        </span>
                      )}
                      {company.is_verified ? (
                        <BadgeCheck className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{company.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{t(sizeLabels[company.company_size]) || company.company_size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{company.job_count || company.total_jobs || 0} {t('admin.companies.label.jobs')}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline truncate">{company.website.replace('https://', '')}</a>
                      </div>
                    )}
                  </div>

                  {company.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{company.description}</p>
                  )}

                  {detailCompanyId === company.id && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-700/50 text-sm text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.companies.detail.email')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{company.user?.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.companies.detail.industry')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{company.industry_name || company.industry}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.companies.detail.total_hires')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{company.total_hires || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.companies.detail.account_manager')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{company.user?.full_name || '-'}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">
                      {company.created_at ? new Date(company.created_at).toLocaleDateString('ar') : '-'}
                    </span>
                    <div className="flex items-center gap-1">
                      {actionLoading === company.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      ) : (
                        <>
                          <button onClick={() => handleToggleFeatured(company.id)} className="btn-ghost p-2" title={company.is_featured ? t('admin.companies.action.unfeature') : t('admin.companies.action.feature')}>
                            {company.is_featured ? <ToggleRight className="w-4 h-4 text-purple-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDetailCompanyId(detailCompanyId === company.id ? null : company.id)} className="btn-ghost p-2"><Eye className="w-4 h-4" /></button>
                          {!company.is_verified && (
                            <button onClick={() => handleVerify(company.id)} className="btn-ghost p-2 text-emerald-600">
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirm(company)} className="btn-ghost p-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                {t('pagination.from_to', { from: Math.min((currentPage - 1) * pageSize + 1, totalCount), to: Math.min(currentPage * pageSize, totalCount), total: totalCount })}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-ghost p-2 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', p === currentPage ? 'bg-primary-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800')}
                  >{p}</button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-ghost p-2 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.confirm_delete.title')}</h3>
                <button onClick={() => setDeleteConfirm(null)} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {t('admin.confirm_delete.message')} <strong>{deleteConfirm.company_name}</strong>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">{t('admin.confirm_delete.cancel')}</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white">
                  <Trash2 className="w-4 h-4" /> {t('admin.confirm_delete.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
