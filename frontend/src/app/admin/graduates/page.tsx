'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, GraduationCap, MapPin, Building2, Award, BadgeCheck,
  BarChart3, Eye, Shield, AlertTriangle, ChevronLeft, ChevronRight,
  Star, BookOpen, Users, Verified, XCircle, CheckCircle, Trash2, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface AdminGraduate {
  id: string
  user: { id: string; full_name: string; email: string; avatar: string | null }
  college: string
  college_name: string
  graduation_year: number
  major: string
  city: string
  is_verified: boolean
  profile_completion: number
  is_employed: boolean
  current_company: string | null
  skills_count: number
  gpa: number | null
}

export default function AdminGraduatesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [graduates, setGraduates] = useState<AdminGraduate[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [verifyFilter, setVerifyFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailGraduateId, setDetailGraduateId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminGraduate | null>(null)
  const pageSize = 12

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadGraduates = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (collegeFilter !== 'all') params.college = collegeFilter
      if (cityFilter !== 'all') params.city = cityFilter
      if (yearFilter !== 'all') params.graduation_year = yearFilter
      if (verifyFilter === 'verified') params.is_verified = 'true'
      else if (verifyFilter === 'unverified') params.is_verified = 'false'
      const { data } = await adminService.listGraduates(params)
      setGraduates(data.results || data || [])
      setTotalCount(data.count || data.length || 0)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, collegeFilter, cityFilter, yearFilter, verifyFilter, currentPage])

  useEffect(() => { loadGraduates() }, [loadGraduates])

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(id)
      await adminService.verifyGraduate(id)
      await loadGraduates()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const colleges = Array.from(new Set(graduates.map((g) => g.college_name || g.college).filter(Boolean)))
  const cities = Array.from(new Set(graduates.map((g) => g.city).filter(Boolean)))
  const years = Array.from(new Set(graduates.map((g) => g.graduation_year).filter((y): y is number => y !== null))).sort()

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const verifiedCount = graduates.filter((g) => g.is_verified).length
  const employedCount = graduates.filter((g) => g.is_employed).length
  const avgCompletion = graduates.length > 0 ? Math.round(graduates.reduce((s, g) => s + (g.profile_completion || 0), 0) / graduates.length) : 0

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.graduates.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.graduates.description')}</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-800 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white dark:bg-navy-700 shadow-sm' : '')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-white dark:bg-navy-700 shadow-sm' : '')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('admin.graduates.stats.total'), value: totalCount.toLocaleString(), icon: GraduationCap, color: 'text-blue-600' },
            { label: t('admin.graduates.stats.verified'), value: verifiedCount.toLocaleString(), icon: BadgeCheck, color: 'text-emerald-600' },
            { label: t('admin.graduates.stats.avg_completion'), value: `${avgCompletion}%`, icon: BarChart3, color: 'text-amber-600' },
            { label: t('admin.graduates.stats.employed'), value: employedCount.toLocaleString(), icon: Building2, color: 'text-cyan-600' },
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
                placeholder={t('admin.graduates.search_placeholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={collegeFilter} onChange={(e) => { setCollegeFilter(e.target.value); setCurrentPage(1) }} className="input-field w-40">
                <option value="all">{t('admin.graduates.filter.all_colleges')}</option>
                {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1) }} className="input-field w-36">
                <option value="all">{t('all_cities')}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1) }} className="input-field w-32">
                <option value="all">{t('admin.graduates.filter.all_years')}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={verifyFilter} onChange={(e) => { setVerifyFilter(e.target.value); setCurrentPage(1) }} className="input-field w-36">
                <option value="all">{t('admin.graduates.filter.all_status')}</option>
                <option value="verified">{t('verified')}</option>
                <option value="unverified">{t('unverified')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadGraduates} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : graduates.length === 0 ? (
            <div className="py-12 text-center text-slate-500">{t('no_results')}</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {graduates.map((grad) => (
                <div key={grad.id} className="glass-card p-5 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                        {(grad.user?.full_name || '?').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{grad.user?.full_name}</h3>
                        <span className="text-xs text-slate-500">{grad.major}</span>
                      </div>
                    </div>
                    {grad.is_verified ? (
                      <BadgeCheck className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{grad.college_name || grad.college} - {grad.graduation_year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{grad.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-400" />
                      <span>{grad.skills_count || 0} {t('skills')}</span>
                    </div>
                    {grad.is_employed && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">{grad.current_company}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{t('profile_completion')}</span>
                      <span>{grad.profile_completion || 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${grad.profile_completion || 0}%` }} />
                    </div>
                  </div>
                  {detailGraduateId === grad.id && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-700/50 text-sm text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-slate-400">{t('email')}:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{grad.user?.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.graduates.detail.gpa')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{grad.gpa ?? '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.graduates.detail.employment_status')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{grad.is_employed ? `${t('admin.graduates.detail.employed_at')} ${grad.current_company}` : t('unemployed')}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('admin.graduates.detail.verification')}</span>
                        <p className="font-medium text-slate-900 dark:text-white">{grad.is_verified ? t('verified') : t('unverified')}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    {actionLoading === grad.id ? (
                      <div className="flex-1 flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setDetailGraduateId(detailGraduateId === grad.id ? null : grad.id)} className="btn-ghost text-xs flex-1"><Eye className="w-3.5 h-3.5" /> {t('view_details')}</button>
                        {!grad.is_verified && (
                          <button onClick={() => handleVerify(grad.id)} className="btn-ghost text-xs flex-1 text-emerald-600">
                            <Shield className="w-3.5 h-3.5" /> {t('admin.users.table.verification')}
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(grad)} className="btn-ghost text-xs flex-1 text-red-600">
                          <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.graduates.table.graduate')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('college')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('city')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('graduation_year')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('skills')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.verification')}</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {graduates.flatMap((grad) => {
                    const rows = []
                    rows.push(
                      <tr key={`row-${grad.id}`} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">{(grad.user?.full_name || '?').charAt(0)}</div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{grad.user?.full_name}</p>
                              <p className="text-xs text-slate-500">{grad.major}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{grad.college_name || grad.college}</td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{grad.city}</td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{grad.graduation_year}</td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{grad.skills_count || 0}</td>
                        <td className="py-3 px-2">
                          {grad.is_verified ? (
                            <BadgeCheck className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          )}
                        </td>
                        <td className="py-3 px-2 text-left">
                          <div className="flex items-center gap-1">
                            {actionLoading === grad.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            ) : (
                              <>
                                <button onClick={() => setDetailGraduateId(detailGraduateId === grad.id ? null : grad.id)} className="btn-ghost p-2"><Eye className="w-4 h-4" /></button>
                                {!grad.is_verified && (
                                  <button onClick={() => handleVerify(grad.id)} className="btn-ghost p-2 text-emerald-600">
                                    <Shield className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => setDeleteConfirm(grad)} className="btn-ghost p-2 text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                    if (detailGraduateId === grad.id) {
                      rows.push(
                        <tr key={`detail-${grad.id}`} className="bg-slate-50/50 dark:bg-navy-900/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.graduates.detail.email')}</span>
                                <p className="font-medium text-slate-900 dark:text-white">{grad.user?.email}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.graduates.detail.gpa')}</span>
                                <p className="font-medium text-slate-900 dark:text-white">{grad.gpa ?? '-'}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.graduates.detail.employment_status')}</span>
                                <p className="font-medium text-slate-900 dark:text-white">{grad.is_employed ? `${t('admin.graduates.detail.employed_at')} ${grad.current_company}` : t('unemployed')}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return rows
                  })}
                </tbody>
              </table>
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
                {t('admin.confirm_delete.message')} <strong>{deleteConfirm.user?.full_name}</strong>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">{t('admin.confirm_delete.cancel')}</button>
                <button onClick={async () => {
                  try { setActionLoading(deleteConfirm.id); await adminService.deleteGraduate(deleteConfirm.id); await loadGraduates() }
                  catch { setError(t('error')) }
                  finally { setActionLoading(null); setDeleteConfirm(null) }
                }} className="btn-primary flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white">
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
