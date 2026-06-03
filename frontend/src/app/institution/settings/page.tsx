'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Save, School, Globe,
  FileText, AlertCircle, CheckCircle,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function InstitutionSettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/institution/profiles/me/')
      .then((res) => { setProfile(res.data); setLoading(false) })
      .catch(() => { setError('Failed to load profile'); setLoading(false) })
  }, [isAuthenticated])

  const updateField = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  const save = async () => {
    if (!profile) return
    setSaving(true); setSaved(false); setError(null)
    try {
      await api.patch(`/institution/profiles/${profile.id}/`, profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <DashboardLayout role="institution">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) return null

  return (
    <DashboardLayout role="institution">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('institution.settings.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('institution.settings.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" /> {t('saved')}
              </span>
            )}
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? t('saving') : t('save')}
            </button>
          </div>
        </header>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            <School className="w-5 h-5 inline ml-2 text-primary-500" />
            {t('institution.settings.basic_info')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.name')}</label>
              <input type="text" value={profile.institution_name || ''} onChange={(e) => updateField('institution_name', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.name_en')}</label>
              <input type="text" value={profile.institution_name_en || ''} onChange={(e) => updateField('institution_name_en', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.type')}</label>
              <select value={profile.institution_type || 'university'} onChange={(e) => updateField('institution_type', e.target.value)} className="input w-full">
                <option value="university">{t('institution.settings.type_university')}</option>
                <option value="college">{t('institution.settings.type_college')}</option>
                <option value="institute">{t('institution.settings.type_institute')}</option>
                <option value="school">{t('institution.settings.type_school')}</option>
                <option value="training_center">{t('institution.settings.type_training_center')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.license')}</label>
              <input type="text" value={profile.license_number || ''} readOnly className="input w-full opacity-60" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            <Globe className="w-5 h-5 inline ml-2 text-primary-500" />
            {t('institution.settings.contact_info')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.website')}</label>
              <input type="url" value={profile.website || ''} onChange={(e) => updateField('website', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.phone')}</label>
              <input type="text" value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.city')}</label>
              <input type="text" value={profile.city || ''} onChange={(e) => updateField('city', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.country')}</label>
              <input type="text" value={profile.country || ''} onChange={(e) => updateField('country', e.target.value)} className="input w-full" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.address')}</label>
            <textarea value={profile.address || ''} onChange={(e) => updateField('address', e.target.value)} rows={3} className="input w-full" />
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            <FileText className="w-5 h-5 inline ml-2 text-primary-500" />
            {t('institution.settings.description_section')}
          </h3>
          <textarea value={profile.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={5} className="input w-full" />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.settings.stats')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.student_count')}</label>
              <input type="number" value={profile.student_count || 0} onChange={(e) => updateField('student_count', parseInt(e.target.value) || 0)} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.settings.graduate_count')}</label>
              <input type="number" value={profile.graduate_count || 0} disabled className="input w-full opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
