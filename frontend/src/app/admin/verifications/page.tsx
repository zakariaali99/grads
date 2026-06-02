'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, CheckCircle, XCircle, Clock, FileText, Users,
  Building2, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, BadgeCheck, Shield, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface PendingItem {
  id: string
  name: string
  type: 'graduate' | 'company'
  detail: string
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [items, setItems] = useState<PendingItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'graduates' | 'companies'>('graduates')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [notesInput, setNotesInput] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const pageSize = 5

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadVerifications = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const results: PendingItem[] = []

      if (activeTab === 'graduates') {
        const { data: gradData } = await adminService.listGraduates({ is_verified: 'false', page_size: 50 })
        const grads = gradData.results || gradData || []
        grads.forEach((g: any) => {
          results.push({
            id: g.id,
            name: g.user?.full_name || g.user?.username || t('unknown'),
            type: 'graduate',
            detail: `${g.college_name || g.college || '-'} - ${g.graduation_year || '-'}`,
            submittedDate: g.created_at || g.user?.date_joined || '',
            status: 'pending',
          })
        })
      }

      if (activeTab === 'companies') {
        const { data: compData } = await adminService.listCompanies({ is_verified: 'false', page_size: 50 })
        const comps = compData.results || compData || []
        comps.forEach((c: any) => {
          results.push({
            id: c.id,
            name: c.company_name || t('unknown'),
            type: 'company',
            detail: `${c.industry_name || c.industry || '-'} - ${c.city || '-'}`,
            submittedDate: c.created_at || '',
            status: 'pending',
          })
        })
      }

      setItems(results)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [activeTab, t])

  useEffect(() => { loadVerifications() }, [loadVerifications])

  const handleApprove = async (item: PendingItem) => {
    try {
      setActionLoading(item.id)
      if (item.type === 'graduate') {
        await adminService.verifyGraduate(item.id)
      } else {
        await adminService.verifyCompany(item.id)
      }
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: 'approved' } : i))
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = (item: PendingItem) => {
    const note = notesInput[item.id]
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: 'rejected', notes: note || t('request_rejected') } : i))
  }

  const filtered = items.filter((item) => {
    if (!search) return true
    const q = search.trim().toLowerCase()
    return item.name.toLowerCase().includes(q)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const pendingGrad = items.filter((r) => r.type === 'graduate' && r.status === 'pending').length
  const pendingComp = items.filter((r) => r.type === 'company' && r.status === 'pending').length
  const approvedCount = items.filter((r) => r.status === 'approved').length
  const rejectedCount = items.filter((r) => r.status === 'rejected').length

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.verifications.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.verifications.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('admin.verifications.stats.pending'), value: pendingGrad + pendingComp, icon: Clock, color: 'text-amber-600' },
            { label: t('admin.verifications.stats.approved'), value: approvedCount, icon: BadgeCheck, color: 'text-emerald-600' },
            { label: t('admin.verifications.stats.rejected'), value: rejectedCount, icon: XCircle, color: 'text-red-600' },
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex bg-slate-100 dark:bg-navy-800 rounded-xl p-1">
              <button onClick={() => { setActiveTab('graduates'); setCurrentPage(1); setSearch(''); setItems([]) }}
                className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'graduates' ? 'bg-white dark:bg-navy-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Users className="w-4 h-4 inline ml-2" />
                {t('nav.graduates')}
                <span className="mr-2 badge-warning text-xs px-1.5 py-0.5">{pendingGrad}</span>
              </button>
              <button onClick={() => { setActiveTab('companies'); setCurrentPage(1); setSearch(''); setItems([]) }}
                className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'companies' ? 'bg-white dark:bg-navy-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Building2 className="w-4 h-4 inline ml-2" />
                {t('nav.companies')}
                <span className="mr-2 badge-warning text-xs px-1.5 py-0.5">{pendingComp}</span>
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={t('search')} value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input-field pr-9 text-sm" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadVerifications} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : paged.length === 0 ? (
            <div className="py-12 text-center text-slate-500">{search ? t('no_results') : t('admin.verifications.empty.no_requests')}</div>
          ) : (
            <div className="space-y-4">
              {paged.map((req) => (
                <div key={req.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0',
                        req.type === 'graduate' ? 'bg-gradient-to-br from-primary-400 to-accent-500' : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                      )}>
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{req.name}</h3>
                        <p className="text-sm text-slate-500">{req.detail}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {req.submittedDate ? new Date(req.submittedDate).toLocaleDateString('ar') : '-'}
                          </span>
                          {req.status === 'approved' && (
                            <span className="badge-success text-xs"><CheckCircle className="w-3 h-3 ml-1" />{t('accepted')}</span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="badge-danger text-xs"><XCircle className="w-3 h-3 ml-1" />{t('rejected')}</span>
                          )}
                          {req.status === 'pending' && (
                            <span className="badge-warning text-xs"><Clock className="w-3 h-3 ml-1" />{t('admin.verifications.status.pending')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {req.status === 'rejected' && req.notes && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
                      <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{req.notes}</span>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <textarea
                        placeholder={t('admin.verifications.notes_placeholder')}
                        value={notesInput[req.id] || ''}
                        onChange={(e) => setNotesInput((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        className="input-field text-sm mb-3 h-20 resize-none"
                      />
                      <div className="flex items-center gap-3">
                        {actionLoading === req.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                        ) : (
                          <>
                            <button onClick={() => handleApprove(req)} className="btn-primary text-sm">
                              <CheckCircle className="w-4 h-4" />
                              {t('admin.verifications.action.approve')}
                            </button>
                            <button onClick={() => handleReject(req)}
                              className="btn-secondary text-sm text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <XCircle className="w-4 h-4" />
                              {t('admin.verifications.action.reject')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {req.status !== 'pending' && (
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => router.push(req.type === 'graduate' ? '/admin/graduates' : '/admin/companies')} className="btn-ghost text-sm">
                        <Eye className="w-4 h-4" /> {t('view_details')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">
                {t('pagination', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, filtered.length), total: filtered.length })}
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
      </div>
    </DashboardLayout>
  )
}
