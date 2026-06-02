'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adService, type AdvertisementData } from '@/lib/api-services'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Megaphone, Plus, Edit3, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, AlertTriangle, X, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

export default function AdminAdsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const placementLabels: Record<string, string> = {
    small: t('admin.ads.placement.small'),
    medium: t('admin.ads.placement.medium'),
    large: t('admin.ads.placement.large'),
    sidebar: t('admin.ads.placement.sidebar'),
  }

  const [ads, setAds] = useState<AdvertisementData[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', placement: 'medium', link_url: '', is_active: true })

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  const loadAds = useCallback(async () => {
    try {
      setFetching(true)
      setError('')
      const { data } = await adService.admin.list()
      setAds((data as any)?.results || (Array.isArray(data) ? data : []))
    } catch {
      setError(t('error'))
    } finally {
      setFetching(false)
    }
  }, [t])

  useEffect(() => { loadAds() }, [loadAds])

  const resetForm = () => {
    setForm({ title: '', description: '', placement: 'medium', link_url: '', is_active: true })
    setEditId(null)
    setShowForm(false)
  }

  const openEdit = (ad: AdvertisementData) => {
    setForm({ title: ad.title, description: ad.description, placement: ad.placement, link_url: ad.link_url, is_active: ad.is_active })
    setEditId(ad.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      setActionLoading(editId || 0)
      if (editId) {
        await adService.admin.update(editId, form)
      } else {
        await adService.admin.create(form)
      }
      resetForm()
      await loadAds()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(id)
      await adService.admin.delete(id)
      await loadAds()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (ad: AdvertisementData) => {
    try {
      setActionLoading(ad.id)
      await adService.admin.update(ad.id, { is_active: !ad.is_active })
      await loadAds()
    } catch {
      setError(t('error'))
    } finally {
      setActionLoading(null)
    }
  }

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.ads.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.ads.description')}</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> {t('admin.ads.add')}
          </button>
        </div>

        {showForm && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editId ? t('admin.ads.edit') : t('admin.ads.new')}</h3>
              <button onClick={resetForm} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.ads.label.title')}</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder={t('admin.ads.label.title')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.ads.label.placement')}</label>
                <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="input-field">
                  {Object.entries(placementLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.ads.label.description')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} placeholder={t('admin.ads.label.description')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.ads.label.link')}</label>
                <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="input-field" placeholder="https://" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleSave} disabled={!form.title || actionLoading !== null} className="btn-primary">
                {actionLoading !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? t('update') : t('add')}
              </button>
              <button onClick={resetForm} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={loadAds} className="btn-ghost text-sm mr-auto">{t('retry')}</button>
          </div>
        )}

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : ads.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>{t('no_data')}</p>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> {t('admin.ads.add_first')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.ads.table.ad')}</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.ads.table.placement')}</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.ads.table.status')}</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.ads.table.clicks')}</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">{t('admin.ads.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{ad.title}</p>
                          {ad.description && <p className="text-xs text-slate-500 line-clamp-1">{ad.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">
                      {placementLabels[ad.placement] || ad.placement}
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn('badge', ad.is_active ? 'badge-success' : 'badge-danger')}>
                        {ad.is_active ? t('admin.ads.status.active') : t('admin.ads.status.inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{ad.click_count}</td>
                    <td className="py-3 px-2 text-left">
                      {actionLoading === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleActive(ad)} className="btn-ghost p-2" title={ad.is_active ? t('admin.ads.action.deactivate') : t('admin.ads.action.activate')}>
                            {ad.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEdit(ad)} className="btn-ghost p-2 text-blue-600" title={t('edit')}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(ad.id)} className="btn-ghost p-2 text-red-600" title={t('delete')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
