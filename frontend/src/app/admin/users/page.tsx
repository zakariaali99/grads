'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/lib/api-services'
import type { User, PaginatedResponse } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Search, Users, UserCheck, UserX, Shield, ArrowUpDown,
  Eye, Ban, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Download, AlertTriangle, Verified, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface AdminUser extends User {
  is_banned?: boolean
  city?: string
  last_active?: string
}

const typeColors: Record<string, string> = {
  graduate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  employer: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
}

const typeLabels: Record<string, string> = {
  graduate: 'role.graduate',
  employer: 'role.employer',
  admin: 'role.admin',
}

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('date_joined')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null)
  const pageSize = 8

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadUsers = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const params: Record<string, any> = { page: currentPage, page_size: pageSize }
      if (search) params.search = search
      if (typeFilter !== 'all') params.user_type = typeFilter
      if (statusFilter !== 'all') params.is_banned = statusFilter === 'banned' ? 'true' : 'false'
      const { data } = await adminService.listUsers(params)
      setUsers(data.results as AdminUser[])
      setTotalCount(data.count)
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [search, typeFilter, statusFilter, currentPage])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleAction = async (action: () => Promise<any>, id: string) => {
    try {
      setActionLoading(id)
      await action()
      await loadUsers()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const stats = {
    total: totalCount,
    active: users.filter((u) => !u.is_banned).length,
    banned: users.filter((u) => u.is_banned).length,
    verified: users.filter((u) => u.is_verified).length,
  }

  const visibleUsers = [...users].sort((a, b) => {
    const aVal = (a as any)[sortField]?.toString() || ''
    const bVal = (b as any)[sortField]?.toString() || ''
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.users.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.users.description')}</p>
          </div>
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            {t('admin.users.export')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('admin.users.stats.total'), value: stats.total, icon: Users, color: 'text-blue-600' },
            { label: t('admin.users.stats.active'), value: stats.active, icon: UserCheck, color: 'text-emerald-600' },
            { label: t('admin.users.stats.banned'), value: stats.banned, icon: UserX, color: 'text-red-600' },
            { label: t('admin.users.stats.verified'), value: stats.verified, icon: Shield, color: 'text-amber-600' },
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
                placeholder={t('search_users')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input-field pr-10"
              />
            </div>
            <div className="flex gap-3">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }} className="input-field w-40">
                <option value="all">{t('all_types')}</option>
                <option value="graduate">{t('role.graduate')}</option>
                <option value="employer">{t('role.employer')}</option>
                <option value="admin">{t('role.admin')}</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="input-field w-40">
                <option value="all">{t('all')}</option>
                <option value="active">{t('active')}</option>
                <option value="banned">{t('banned')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={loadUsers} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
            </div>
          )}

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500">{t('no_results')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.user')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('user_type'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('admin.users.table.type')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.status')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.verification')}</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">
                      <button onClick={() => { setSortField('date_joined'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {t('admin.users.table.date_joined')} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.users.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.flatMap((u) => {
                    const rows = []
                    rows.push(
                      <tr key={`row-${u.id}`} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                              {(u.full_name || u.username || '?').charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{u.full_name || u.username}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn('badge', typeColors[u.user_type] || '')}>{t(typeLabels[u.user_type]) || u.user_type}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn('badge', u.is_banned ? 'badge-danger' : 'badge-success')}>
                            {u.is_banned ? t('banned') : t('active')}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {u.is_verified ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm">
                              <Verified className="w-4 h-4" /> {t('verified')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 text-sm">
                              <XCircle className="w-4 h-4" /> {t('unverified')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">
                          {u.date_joined ? new Date(u.date_joined).toLocaleDateString('ar') : '-'}
                        </td>
                        <td className="py-3 px-2 text-left">
                          <div className="flex items-center gap-1">
                            {actionLoading === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            ) : (
                              <>
                                <button onClick={() => setDetailUserId(detailUserId === u.id ? null : u.id)} className="btn-ghost p-2" title={t('view_details')}><Eye className="w-4 h-4" /></button>
                                {u.is_banned ? (
                                  <button onClick={() => handleAction(() => adminService.unbanUser(u.id), u.id)}
                                    className="btn-ghost p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title={t('unban')}>
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button onClick={() => handleAction(() => adminService.banUser(u.id), u.id)}
                                    className="btn-ghost p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" title={t('ban')}>
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                                {!u.is_verified && (
                                  <button onClick={() => handleAction(() => adminService.verifyUser(u.id), u.id)}
                                    className="btn-ghost p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title={t('admin.users.table.verification')}>
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => setDeleteConfirm(u)}
                                  className="btn-ghost p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title={t('delete')}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                    if (detailUserId === u.id) {
                      rows.push(
                        <tr key={`detail-${u.id}`} className="bg-slate-50/50 dark:bg-navy-900/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.users.detail.city')}</span>
                                <p className="font-medium">{u.city || '-'}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.users.detail.last_active')}</span>
                                <p className="font-medium">{u.last_active ? new Date(u.last_active).toLocaleString('ar') : '-'}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">{t('admin.users.detail.date_joined')}</span>
                                <p className="font-medium">{u.date_joined ? new Date(u.date_joined).toLocaleString('ar') : '-'}</p>
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
                {t('admin.confirm_delete.message')}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">{t('admin.confirm_delete.cancel')}</button>
                <button onClick={() => { handleAction(() => adminService.deleteUser(deleteConfirm.id), deleteConfirm.id); setDeleteConfirm(null) }}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white">
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
