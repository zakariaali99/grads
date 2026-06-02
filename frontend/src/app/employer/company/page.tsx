'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Building2, Globe, Phone, MapPin, Briefcase, Users,
  Edit3, ShieldCheck, CheckCircle, Star, AlertCircle,
  Loader2, Plus, Save, X,
} from 'lucide-react'
import { employerService } from '@/lib/api-services'
import type { CompanyProfile } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function CompanyPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const [createForm, setCreateForm] = useState({
    company_name: '',
    industry: '',
    company_size: '11-50',
    city: '',
    website: '',
    phone: '',
    description: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchCompany()
  }, [isAuthenticated])

  const fetchCompany = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await employerService.getMyCompany()
      setCompany(data)
      setDescription(data.description || '')
      setWebsite(data.website || '')
      setPhone(data.phone || '')
      setCity(data.city || '')
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setCompany(null)
      } else {
        setError(t('error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!company) return
    setSaving(true)
    setError(null)
    try {
      const { data } = await employerService.updateCompany(company.id, {
        description,
        website,
        phone,
        city,
      })
      setCompany(data)
      setDescription(data.description || '')
      setWebsite(data.website || '')
      setPhone(data.phone || '')
      setCity(data.city || '')
      setIsEditing(false)
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.company_name.trim()) {
      setError(t('company_name_required'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { data } = await employerService.createCompany(createForm)
      setCompany(data)
      setDescription(data.description || '')
      setWebsite(data.website || '')
      setPhone(data.phone || '')
      setCity(data.city || '')
      setIsCreating(false)
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error && !company && !isCreating) {
    return (
      <DashboardLayout role="employer">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={fetchCompany} className="btn-secondary mt-4">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  if (!company && !isCreating) {
    return (
      <DashboardLayout role="employer">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('employer.company.no_company_title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('employer.company.no_company_desc')}</p>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('employer.company.create')}
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (isCreating) {
    return (
      <DashboardLayout role="employer">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.company.create_title')}</h1>
            <button onClick={() => setIsCreating(false)} className="btn-ghost">
              <X className="w-4 h-4" />
              {t('cancel')}
            </button>
          </div>
          {error && (
            <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.company.form.name')}</label>
              <input
                type="text"
                value={createForm.company_name}
                onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                className="input-field"
                placeholder={t('employer.company.form.name_example')}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.company.form.city')}</label>
                <input
                  type="text"
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                  className="input-field"
                  placeholder={t('city_example')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company_size')}</label>
                <select
                  value={createForm.company_size}
                  onChange={(e) => setCreateForm({ ...createForm, company_size: e.target.value })}
                  className="input-field"
                >
                  <option value="1-10">1-10 {t('employees')}</option>
                  <option value="11-50">11-50 {t('employees')}</option>
                  <option value="51-200">51-200 {t('employees')}</option>
                  <option value="201-1000">201-1000 {t('employees')}</option>
                  <option value="1000+">{t('more_than')} 1000 {t('employees')}</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('industry')}</label>
                <input
                  type="text"
                  value={createForm.industry}
                  onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                  className="input-field"
                  placeholder={t('industry_example')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('website')}</label>
                <input
                  type="text"
                  value={createForm.website}
                  onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="+218 91 234 5678"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employer.company.form.description')}</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                placeholder={t('employer.company.form.description_placeholder')}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleCreate} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t('loading') : t('employer.company.form.submit')}
              </button>
              <button onClick={() => setIsCreating(false)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="glass-card p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-12 h-12" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {company!.company_name}
                  </h1>
                  {company!.is_verified && (
                    <span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('verified')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
{company!.industry_name || company!.industry || t('unspecified')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
{company!.company_size || t('unspecified')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company!.city || t('unspecified')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary">
                <Edit3 className="w-4 h-4" />
                {t('employer.company.edit_profile')}
              </button>
              {!company!.is_verified && (
                <button className="btn-primary">
                  <ShieldCheck className="w-4 h-4" />
                  {t('employer.company.verify')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{company!.total_jobs ?? company!.job_count ?? 0}</div>
              <div className="stat-label">{t('total_jobs')}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{company!.total_hires ?? 0}</div>
              <div className="stat-label">{t('total_hires')}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="stat-value text-2xl">{(company!.profile_views ?? 0).toLocaleString('en-US')}</div>
              <div className="stat-label">{t('profile_views')}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('employer.company.about')}</h3>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[120px] resize-none"
                  dir="rtl"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description || t('no_description')}</p>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('employer.company.contact_info')}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <Globe className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('website')}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 w-full"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{website || '--'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('phone')}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 w-full"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{phone || '--'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('city')}</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 w-full"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{city || '--'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <Briefcase className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('industry')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{company!.industry_name || company!.industry || t('unspecified')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                  <Users className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('employee_count')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{company!.company_size || t('unspecified')}</p>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? t('loading') : t('save')}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
