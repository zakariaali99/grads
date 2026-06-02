'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { graduateService, jobService } from '@/lib/api-services'
import type { Skill, JobCategory } from '@/lib/types'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, Settings, Save, Plus, Trash2, Pencil, X, Check,
  Globe, Briefcase, BookOpen, GraduationCap, Megaphone,
  Search, Tag, Upload, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user: authUser, isAuthenticated, isLoading, fetchProfile } = useAuthStore()

  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)

  const [siteName, setSiteName] = useState('خريجون')
  const [siteDescription, setSiteDescription] = useState('منصة ربط الخريجين بسوق العمل')
  const [contactEmail, setContactEmail] = useState('admin@kharjoon.ly')

  const [categories, setCategories] = useState<JobCategory[]>([])
  const [newCatAr, setNewCatAr] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [editingCat, setEditingCat] = useState<number | null>(null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [newSkillName, setNewSkillName] = useState('')

  const [colleges, setColleges] = useState<{ id: number; name: string; university: string }[]>([])
  const [newCollege, setNewCollege] = useState('')
  const [newUniversity, setNewUniversity] = useState('')
  const [editingCollege, setEditingCollege] = useState<number | null>(null)

  const [announcements, setAnnouncements] = useState<{ id: number; title: string; content: string; createdAt: string; isPinned: boolean }[]>([])
  const [newAnnTitle, setNewAnnTitle] = useState('')
  const [newAnnContent, setNewAnnContent] = useState('')

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.user_type !== 'admin')) router.push('/login')
  }, [isLoading, isAuthenticated, authUser])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setFetching(true)
      setFetchError('')
      const [skillsRes, catsRes] = await Promise.allSettled([
        graduateService.getSkills({ page_size: 100 }),
        jobService.getCategories(),
      ])
      if (skillsRes.status === 'fulfilled') {
        const data = skillsRes.value.data as any
        setSkills(Array.isArray(data) ? data : data.results || [])
      }
      if (catsRes.status === 'fulfilled') {
        const data = catsRes.value.data as any
        setCategories(Array.isArray(data) ? data : data.results || [])
      }
    } catch {
      setFetchError(t('error'))
    } finally {
      setFetching(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
  }

  const filteredSkills = skills.filter((s) =>
    s.name_ar?.includes(skillSearch) || s.name_en?.includes(skillSearch)
  )

  const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  )

  if (isLoading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (fetchError) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{fetchError}</p>
          <button onClick={loadData} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.settings.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.settings.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <SectionCard title={t('admin.settings.general')} icon={Globe}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.settings.general.site_name')}</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.settings.general.site_desc')}</label>
                <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} className="input-field h-24 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('admin.settings.general.contact_email')}</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input-field" />
              </div>
              <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('admin.settings.general.save')}
              </button>
            </div>
          </SectionCard>

          <SectionCard title={t('admin.settings.categories')} icon={Briefcase}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder={t('admin.settings.categories.name_ar')} value={newCatAr} onChange={(e) => setNewCatAr(e.target.value)} className="input-field flex-1" />
                <input type="text" placeholder="English name" value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} className="input-field flex-1" dir="ltr" />
                <button onClick={() => {
                  if (!newCatAr.trim()) return
                  setCategories((prev) => [...prev, { id: String(Date.now()), name_ar: newCatAr, name_en: newCatEn || null, icon: null }])
                  setNewCatAr(''); setNewCatEn('')
                }} className="btn-primary shrink-0"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">{t('admin.settings.categories.empty')}</p>
                )}
                {categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-800">
                    {editingCat === idx ? (
                      <div className="flex gap-2 flex-1 ml-3">
                        <input defaultValue={cat.name_ar} className="input-field text-sm flex-1" />
                        <input defaultValue={cat.name_en || ''} className="input-field text-sm flex-1" dir="ltr" />
                        <button onClick={() => setEditingCat(null)} className="btn-ghost p-2 text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCat(null)} className="btn-ghost p-2 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name_ar}</span>
                          {cat.name_en && <span className="text-xs text-slate-400 mr-2">{cat.name_en}</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingCat(idx)} className="btn-ghost p-2"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setCategories((prev) => prev.filter((_, i) => i !== idx))} className="btn-ghost p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <SectionCard title={t('admin.settings.skills')} icon={BookOpen}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder={t('admin.settings.skills.search')} value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)} className="input-field pr-9 text-sm" />
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder={t('admin.settings.skills.add')} value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)} className="input-field text-sm w-40" />
                  <button onClick={() => {
                    if (!newSkillName.trim()) return
                    setSkills((prev) => [...prev, {
                      id: String(Date.now()), name_ar: newSkillName, name_en: null,
                      category: null, category_name: t('admin.settings.skills.other_category'), demand_score: 0,
                    }])
                    setNewSkillName('')
                  }} className="btn-primary shrink-0"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {filteredSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{skill.name_ar || skill.name_en}</span>
                      {skill.category_name && (
                        <span className="badge text-xs bg-slate-100 dark:bg-navy-700 text-slate-500 dark:text-slate-400">{skill.category_name}</span>
                      )}
                      {skill.demand_score > 70 && <span className="badge-warning text-xs">{t('popular')}</span>}
                    </div>
                    <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => setSkills((prev) => prev.filter((s) => s.id !== skill.id))}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {filteredSkills.length === 0 && <p className="text-sm text-slate-400 text-center py-4">{t('no_data')}</p>}
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-start gap-3 text-sm">
                <Upload className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-700 dark:text-amber-300 font-medium">{t('admin.settings.skills.bulk_import')}</p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">{t('admin.settings.skills.bulk_import_desc')}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t('admin.settings.colleges')} icon={GraduationCap}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="text" placeholder={t('admin.settings.colleges.name')} value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)} className="input-field flex-1" />
                <input type="text" placeholder={t('university')} value={newUniversity}
                  onChange={(e) => setNewUniversity(e.target.value)} className="input-field flex-1" />
                <button onClick={() => {
                  if (!newCollege.trim() || !newUniversity.trim()) return
                  setColleges((prev) => [...prev, { id: Date.now(), name: newCollege, university: newUniversity }])
                  setNewCollege(''); setNewUniversity('')
                }} className="btn-primary shrink-0"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {colleges.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">{t('no_data')}</p>
                )}
                {colleges.map((col) => (
                  <div key={col.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-800">
                    {editingCollege === col.id ? (
                      <div className="flex gap-2 flex-1 ml-3">
                        <input defaultValue={col.name} className="input-field text-sm flex-1" />
                        <input defaultValue={col.university} className="input-field text-sm flex-1" />
                        <button onClick={() => setEditingCollege(null)} className="btn-ghost p-2 text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCollege(null)} className="btn-ghost p-2 text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{col.name}</span>
                          <span className="text-xs text-slate-400 mr-2">{col.university}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingCollege(col.id)} className="btn-ghost p-2"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setColleges((prev) => prev.filter((c) => c.id !== col.id))} className="btn-ghost p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title={t('admin.settings.announcements')} icon={Megaphone}>
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('admin.settings.announcements.new')}</h3>
              <div className="space-y-4">
                <input type="text" placeholder={t('admin.settings.announcements.title')} value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)} className="input-field" />
                <textarea placeholder={t('admin.settings.announcements.content')} value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)} className="input-field h-24 resize-none" />
                <button onClick={() => {
                  if (!newAnnTitle.trim() || !newAnnContent.trim()) return
                  setAnnouncements((prev) => [{
                    id: Date.now(), title: newAnnTitle, content: newAnnContent,
                    createdAt: new Date().toISOString().split('T')[0], isPinned: false,
                  }, ...prev])
                  setNewAnnTitle(''); setNewAnnContent('')
                }} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  {t('admin.settings.announcements.publish')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">{t('no_data')}</p>
              )}
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">{ann.title}</h4>
                        {ann.isPinned && <span className="badge-warning text-xs">{t('pinned')}</span>}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{ann.content}</p>
                      <p className="text-xs text-slate-400 mt-2">{ann.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="btn-ghost p-2"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setAnnouncements((prev) => prev.filter((a) => a.id !== ann.id))}
                      className="btn-ghost p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
