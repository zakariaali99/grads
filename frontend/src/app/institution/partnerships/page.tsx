'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import AdBanner from '@/components/AdBanner'
import {
  Loader2, Building2, Plus, ArrowLeft, Handshake,
  Calendar, Phone, Mail, FileText,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function InstitutionPartnershipsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', partnership_type: 'recruitment', contact_person_name: '', contact_email: '', contact_phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  const load = () => {
    if (!isAuthenticated) return
    api.get('/institution/partnerships/')
      .then((res) => { setPartnerships(res.data); setLoading(false) })
      .catch(() => { setError('Failed to load partnerships'); setLoading(false) })
  }

  useEffect(() => { load() }, [isAuthenticated])

  const createPartnership = async () => {
    setSubmitting(true)
    try {
      await api.post('/institution/partnerships/', form)
      setShowForm(false)
      setForm({ company: '', partnership_type: 'recruitment', contact_person_name: '', contact_email: '', contact_phone: '', notes: '' })
      load()
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    terminated: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('institution.partnerships.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{partnerships.length} {t('institution.partnerships.total')}</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('institution.partnerships.add')}
          </button>
        </header>

        {showForm && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('institution.partnerships.new')}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.company')}</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.type')}</label>
                <select value={form.partnership_type} onChange={(e) => setForm({ ...form, partnership_type: e.target.value })} className="input w-full">
                  <option value="recruitment">{t('institution.partnerships.type.recruitment')}</option>
                  <option value="training">{t('institution.partnerships.type.training')}</option>
                  <option value="research">{t('institution.partnerships.type.research')}</option>
                  <option value="sponsorship">{t('institution.partnerships.type.sponsorship')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.contact_name')}</label>
                <input type="text" value={form.contact_person_name} onChange={(e) => setForm({ ...form, contact_person_name: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.contact_email')}</label>
                <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.contact_phone')}</label>
                <input type="text" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.partnerships.form.notes')}</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input w-full" />
              </div>
            </div>
            <button onClick={createPartnership} disabled={submitting} className="btn-primary mt-4 flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('institution.partnerships.create')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : partnerships.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Handshake className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('institution.partnerships.empty_title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('institution.partnerships.empty_desc')}</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">{t('institution.partnerships.add_first')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {partnerships.map((p: any) => (
              <div key={p.id} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{p.company_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t(`institution.partnerships.type.${p.partnership_type}`)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {t(`institution.partnerships.status.${p.status}`)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p.contact_email}</div>
                  {p.contact_phone && <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {p.contact_phone}</div>}
                  {p.start_date && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {p.start_date}</div>}
                  {p.agreement_file && (
                    <a href={p.agreement_file} target="_blank" className="flex items-center gap-1 text-primary-500 hover:underline">
                      <FileText className="w-3.5 h-3.5" /> {t('institution.partnerships.view_agreement')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <AdBanner size="medium" />
        </div>
      </div>
    </DashboardLayout>
  )
}
