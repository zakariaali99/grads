'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, ArrowLeft, GraduationCap, Briefcase, Mail, Calendar,
  Building2, DollarSign, MapPin, Save, AlertCircle,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function GraduateDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [graduate, setGraduate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [employment, setEmployment] = useState({ is_employed: false, employment_details: null as any })
  const [feedback, setFeedback] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !params.id) return
    api.get(`/institution/graduates/${params.id}/`)
      .then((res) => {
        setGraduate(res.data)
        setEmployment({ is_employed: res.data.is_employed, employment_details: res.data.employment_details })
        setLoading(false)
      })
      .catch(() => { setError('Failed to load graduate'); setLoading(false) })

    api.get('/institution/feedback/', { params: { graduate: params.id } })
      .then((res) => setFeedback(res.data))
      .catch(() => {})
  }, [isAuthenticated, params.id])

  const saveEmployment = async () => {
    setSaving(true)
    try {
      const res = await api.patch(`/institution/graduates/${params.id}/update_employment/`, employment)
      setGraduate((prev: any) => ({ ...prev, ...res.data }))
      setSaving(false)
    } catch {
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

  if (error) {
    return (
      <DashboardLayout role="institution">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push('/institution/graduates')} className="btn-primary">{t('back')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (!graduate) return null

  return (
    <DashboardLayout role="institution">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/institution/graduates')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('institution.graduates.back')}
        </button>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-white text-xl font-bold">
              {(graduate.graduate_name || '?')[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{graduate.graduate_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{graduate.graduate_email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <GraduationCap className="w-4 h-4" /> {t('institution.graduates.detail.major')}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">{graduate.major}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" /> {t('institution.graduates.detail.enrollment_year')}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">{graduate.enrollment_year}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" /> {t('institution.graduates.detail.graduation_year')}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">{graduate.graduation_year || '--'}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">GPA</div>
              <div className="font-semibold text-gray-900 dark:text-white">{graduate.gpa ?? '--'}</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.graduates.detail.employment_tracking')}</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={employment.is_employed}
                onChange={(e) => setEmployment({ ...employment, is_employed: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 dark:border-navy-600 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{t('institution.graduates.detail.is_employed')}</span>
            </label>

            {employment.is_employed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.graduates.detail.company')}</label>
                  <input
                    type="text"
                    value={employment.employment_details?.company || ''}
                    onChange={(e) => setEmployment({ ...employment, employment_details: { ...employment.employment_details, company: e.target.value } })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.graduates.detail.position')}</label>
                  <input
                    type="text"
                    value={employment.employment_details?.position || ''}
                    onChange={(e) => setEmployment({ ...employment, employment_details: { ...employment.employment_details, position: e.target.value } })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.graduates.detail.salary')}</label>
                  <input
                    type="number"
                    value={employment.employment_details?.salary || ''}
                    onChange={(e) => setEmployment({ ...employment, employment_details: { ...employment.employment_details, salary: e.target.value } })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('institution.graduates.detail.start_date')}</label>
                  <input
                    type="date"
                    value={employment.employment_details?.start_date || ''}
                    onChange={(e) => setEmployment({ ...employment, employment_details: { ...employment.employment_details, start_date: e.target.value } })}
                    className="input w-full"
                  />
                </div>
              </div>
            )}

            <button onClick={saveEmployment} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>

        {feedback.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.graduates.detail.curriculum_feedback')}</h2>
            <div className="space-y-4">
              {feedback.map((f: any) => (
                <div key={f.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{f.course_name}</span>
                    <span className="text-sm text-amber-500">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
