'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import {
  Loader2, Search, Plus, ArrowLeft, Users, GraduationCap,
  Briefcase, Mail, Calendar, ChevronDown, Filter, Download,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function InstitutionGraduatesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [graduates, setGraduates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (yearFilter) params.set('graduation_year', yearFilter)
    setLoading(true)
    api.get(`/institution/graduates/?${params}`)
      .then((res) => { setGraduates(res.data); setLoading(false) })
      .catch(() => { setError('Failed to load graduates'); setLoading(false) })
  }, [isAuthenticated, search, statusFilter, yearFilter])

  const statusColors: Record<string, string> = {
    enrolled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    graduated: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    withdrew: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    suspended: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  }

  const exportCSV = () => {
    const headers = 'Student ID,Name,Email,Major,Status,GPA,Graduation Year,Employed\n'
    const rows = graduates.map((g: any) =>
      `${g.student_id},"${g.graduate_name}",${g.graduate_email},"${g.major}",${g.status},${g.gpa ?? ''},${g.graduation_year ?? ''},${g.is_employed ? 'Yes' : 'No'}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'graduates.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="institution">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('institution.graduates.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{graduates.length} {t('institution.graduates.total')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="btn-ghost flex items-center gap-2">
              <Download className="w-4 h-4" /> {t('export')}
            </button>
            <button onClick={() => router.push('/institution/graduates/import')} className="btn-ghost flex items-center gap-2">
              <Plus className="w-4 h-4" /> {t('institution.graduates.import')}
            </button>
            <button onClick={() => router.push('/institution/graduates/import')} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> {t('institution.graduates.add')}
            </button>
          </div>
        </header>

        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('institution.graduates.search_placeholder')}
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input py-2 text-sm min-w-[130px]">
              <option value="">{t('institution.graduates.all_statuses')}</option>
              <option value="enrolled">{t('institution.graduates.status.enrolled')}</option>
              <option value="graduated">{t('institution.graduates.status.graduated')}</option>
              <option value="withdrew">{t('institution.graduates.status.withdrew')}</option>
              <option value="suspended">{t('institution.graduates.status.suspended')}</option>
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="input py-2 text-sm min-w-[120px]">
              <option value="">{t('institution.graduates.all_years')}</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : graduates.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('institution.graduates.empty_title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('institution.graduates.empty_desc')}</p>
            <button onClick={() => router.push('/institution/graduates/import')} className="btn-primary">
              {t('institution.graduates.import_first')}
            </button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-800">
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.name')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.student_id')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.major')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.status')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.gpa')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.graduation_year')}</th>
                    <th className="text-right p-4 font-semibold text-gray-600 dark:text-gray-400">{t('institution.graduates.table.employed')}</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {graduates.map((g: any) => (
                    <tr
                      key={g.id}
                      onClick={() => router.push(`/institution/graduates/${g.id}`)}
                      className="border-b border-gray-100 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-800/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-white text-xs font-bold">
                            {(g.graduate_name || '?')[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{g.graduate_name}</div>
                            <div className="text-xs text-gray-400">{g.graduate_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{g.student_id}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{g.major}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[g.status] || 'bg-gray-100 text-gray-600'}`}>
                          {t(`institution.graduates.status.${g.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{g.gpa ?? '--'}</td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">{g.graduation_year ?? '--'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${g.is_employed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          {g.is_employed ? t('yes') : t('no')}
                        </span>
                      </td>
                      <td className="p-4">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <AdBanner size="medium" />
        </div>
      </div>
    </DashboardLayout>
  )
}
