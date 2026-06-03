'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { graduateService, cvService } from '@/lib/api-services'
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  Award, Clock, Edit2, CheckCircle, Plus, ExternalLink, ChevronRight,
  BookOpen, Globe, Github, Linkedin, ShieldCheck, Star,
  Building2, FileText, Trash2, Save, X, Loader2, Upload, Search
} from 'lucide-react'
import type { GraduateProfile, Education, Certification, Experience, Project, CV } from '@/lib/types'
import { useTranslation } from '@/i18n'
import EditProfileModal from '@/components/EditProfileModal'

type EducationForm = Pick<Education, 'degree' | 'field_of_study' | 'institution' | 'country' | 'start_date' | 'end_date' | 'is_current' | 'grade' | 'description'>
type ExperienceForm = Pick<Experience, 'title' | 'company' | 'location' | 'employment_type' | 'start_date' | 'end_date' | 'is_current' | 'description'>
type CertificationForm = Pick<Certification, 'name' | 'issuer' | 'issue_date' | 'expiry_date' | 'credential_id' | 'credential_url'>
type ProjectForm = Pick<Project, 'title' | 'description' | 'technologies' | 'url' | 'start_date' | 'end_date' | 'is_ongoing'>

const emptyEducation = (): EducationForm => ({
  degree: '', field_of_study: '', institution: '', country: null,
  start_date: '', end_date: null, is_current: false, grade: null, description: null,
})

const emptyExperience = (): ExperienceForm => ({
  title: '', company: '', location: null, employment_type: 'full_time',
  start_date: '', end_date: null, is_current: false, description: null,
})

const emptyCertification = (): CertificationForm => ({
  name: '', issuer: '', issue_date: '', expiry_date: null,
  credential_id: null, credential_url: null,
})

const emptyProject = (): ProjectForm => ({
  title: '', description: null, technologies: null, url: null,
  start_date: null, end_date: null, is_ongoing: false,
})

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship']

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string
}) {
  const { t } = useTranslation()
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('confirm_delete')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {title ? `${t('confirm_delete_message')} (${title})` : t('confirm_delete_message')}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Trash2 className="w-4 h-4" />{t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EducationModal({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void; onSave: (data: EducationForm) => Promise<void>; initial: EducationForm
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<EducationForm>(initial)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (isOpen) setForm(initial) }, [isOpen, initial])
  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form); onClose() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initial.degree ? t('graduate.profile.edit_education') : t('graduate.profile.add_education')}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.degree')}</label>
              <input className="input-field" value={form.degree} onChange={(e) => setForm({...form, degree: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.field_of_study')}</label>
              <input className="input-field" value={form.field_of_study} onChange={(e) => setForm({...form, field_of_study: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.institution')}</label>
            <input className="input-field" value={form.institution} onChange={(e) => setForm({...form, institution: e.target.value})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.start_date')}</label>
              <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} />
            </div>
            {!form.is_current && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.end_date')}</label>
                <input type="date" className="input-field" value={form.end_date || ''} onChange={(e) => setForm({...form, end_date: e.target.value || null})} />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({...form, is_current: e.target.checked, end_date: e.target.checked ? null : form.end_date})} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('graduate.profile.is_current')}</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.grade')}</label>
              <input className="input-field" value={form.grade || ''} onChange={(e) => setForm({...form, grade: e.target.value || null})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')}</label>
              <input className="input-field" value={form.country || ''} onChange={(e) => setForm({...form, country: e.target.value || null})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.description')}</label>
            <textarea className="input-field min-h-[80px]" value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value || null})} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ExperienceModal({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void; onSave: (data: ExperienceForm) => Promise<void>; initial: ExperienceForm
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ExperienceForm>(initial)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (isOpen) setForm(initial) }, [isOpen, initial])
  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form); onClose() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initial.title ? t('graduate.profile.edit_experience') : t('graduate.profile.add_experience')}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.company')}</label>
              <input className="input-field" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.employment_type')}</label>
              <select className="input-field" value={form.employment_type} onChange={(e) => setForm({...form, employment_type: e.target.value})}>
                {EMPLOYMENT_TYPES.map((et) => <option key={et} value={et}>{t(et)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.headline')}</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder={t('graduate.profile.headline_placeholder')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.start_date')}</label>
              <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} />
            </div>
            {!form.is_current && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.end_date')}</label>
                <input type="date" className="input-field" value={form.end_date || ''} onChange={(e) => setForm({...form, end_date: e.target.value || null})} />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({...form, is_current: e.target.checked, end_date: e.target.checked ? null : form.end_date})} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('graduate.profile.is_current')}</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.location')}</label>
            <input className="input-field" value={form.location || ''} onChange={(e) => setForm({...form, location: e.target.value || null})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.description')}</label>
            <textarea className="input-field min-h-[80px]" value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value || null})} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function CertificationModal({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void; onSave: (data: CertificationForm) => Promise<void>; initial: CertificationForm
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<CertificationForm>(initial)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (isOpen) setForm(initial) }, [isOpen, initial])
  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form); onClose() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initial.name ? t('graduate.profile.edit_certification') : t('graduate.profile.add_certification')}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.degree')}</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.issuer')}</label>
              <input className="input-field" value={form.issuer} onChange={(e) => setForm({...form, issuer: e.target.value})} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.issue_date')}</label>
              <input type="date" className="input-field" value={form.issue_date} onChange={(e) => setForm({...form, issue_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.expiry_date')}</label>
              <input type="date" className="input-field" value={form.expiry_date || ''} onChange={(e) => setForm({...form, expiry_date: e.target.value || null})} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.credential_id')}</label>
              <input className="input-field" value={form.credential_id || ''} onChange={(e) => setForm({...form, credential_id: e.target.value || null})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.credential_url')}</label>
              <input className="input-field" value={form.credential_url || ''} onChange={(e) => setForm({...form, credential_url: e.target.value || null})} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectModal({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void; onSave: (data: ProjectForm) => Promise<void>; initial: ProjectForm
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ProjectForm>(initial)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (isOpen) setForm(initial) }, [isOpen, initial])
  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form); onClose() }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initial.title ? t('graduate.profile.edit_project') : t('graduate.profile.add_project')}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.degree')}</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.description')}</label>
            <textarea className="input-field min-h-[80px]" value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value || null})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.technologies')}</label>
            <input className="input-field" value={form.technologies || ''} onChange={(e) => setForm({...form, technologies: e.target.value || null})} placeholder="HTML, CSS, JavaScript" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.project_url')}</label>
            <input className="input-field" value={form.url || ''} onChange={(e) => setForm({...form, url: e.target.value || null})} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.start_date')}</label>
              <input type="date" className="input-field" value={form.start_date || ''} onChange={(e) => setForm({...form, start_date: e.target.value || null})} />
            </div>
            {!form.is_ongoing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.end_date')}</label>
                <input type="date" className="input-field" value={form.end_date || ''} onChange={(e) => setForm({...form, end_date: e.target.value || null})} />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_ongoing} onChange={(e) => setForm({...form, is_ongoing: e.target.checked, end_date: e.target.checked ? null : form.end_date})} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('graduate.profile.is_current')}</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSkillModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean; onClose: () => void; onAdd: (skillId: string, proficiency: string, yearsExperience: number) => Promise<void>
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [proficiency, setProficiency] = useState('intermediate')
  const [yearsExperience, setYearsExperience] = useState(0)
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await graduateService.getSkills({ search: query })
        setResults(res.data || [])
      } catch { /* ignore */ } finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const handleAdd = async () => {
    if (!selected) return
    setAdding(true)
    try { await onAdd(selected.id, proficiency, yearsExperience); onClose() }
    finally { setAdding(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('graduate.profile.add_skill_modal')}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pr-10" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null) }} placeholder={t('graduate.profile.select_skill')} />
          </div>
          {searching && <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary-500" /></div>}
          {results.length > 0 && !selected && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {results.map((s: any) => (
                <button key={s.id} onClick={() => { setSelected(s); setQuery(s.name_ar || s.name_en || '') }} className="w-full text-right px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-sm text-gray-900 dark:text-white">
                  {s.name_ar || s.name_en}
                </button>
              ))}
            </div>
          )}
          {selected && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.proficiency')}</label>
                <select className="input-field" value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                  <option value="beginner">{t('graduate.profile.skill.beginner')}</option>
                  <option value="intermediate">{t('graduate.profile.skill.intermediate')}</option>
                  <option value="advanced">{t('graduate.profile.skill.advanced')}</option>
                  <option value="expert">{t('graduate.profile.skill.expert')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.years_experience')}</label>
                <input type="number" min="0" className="input-field" value={yearsExperience} onChange={(e) => setYearsExperience(Number(e.target.value))} />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-ghost">{t('cancel')}</button>
          <button onClick={handleAdd} disabled={!selected || adding} className="btn-primary">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('add')}
          </button>
        </div>
      </div>
    </div>
  )
}

const ProfileSection = ({ title, icon: Icon, children, onEdit, onAdd }: {
  title: string; icon: any; children: React.ReactNode; onEdit?: () => void; onAdd?: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button onClick={onAdd} className="btn-ghost text-emerald-500 hover:text-emerald-600">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('add')}</span>
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="btn-ghost text-primary-500 hover:text-primary-600">
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('edit')}</span>
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<GraduateProfile | null>(null)
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const [eduModal, setEduModal] = useState<{ open: boolean; initial: EducationForm; editId?: string }>({ open: false, initial: emptyEducation() })
  const [expModal, setExpModal] = useState<{ open: boolean; initial: ExperienceForm; editId?: string }>({ open: false, initial: emptyExperience() })
  const [certModal, setCertModal] = useState<{ open: boolean; initial: CertificationForm; editId?: string }>({ open: false, initial: emptyCertification() })
  const [projModal, setProjModal] = useState<{ open: boolean; initial: ProjectForm; editId?: string }>({ open: false, initial: emptyProject() })
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; onConfirm: () => void; title: string }>({ open: false, onConfirm: () => {}, title: '' })
  const [cvUploading, setCvUploading] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, eduRes, certRes, expRes, projRes, cvRes] = await Promise.all([
        graduateService.getMyProfile(),
        graduateService.getEducation(),
        graduateService.getCertifications(),
        graduateService.getExperience(),
        graduateService.getProjects(),
        cvService.list(),
      ])
      setProfile(profileRes.data)
      setEducation(eduRes.data)
      setCertifications(certRes.data)
      setExperience(expRes.data)
      setProjects(projRes.data)
      setCvs(cvRes.data?.results || cvRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleProfileSave = async (data: any) => {
    if (!profile) return
    const res = await graduateService.updateProfile(profile.id, data)
    setProfile(res.data)
  }

  const handleEduSave = async (data: EducationForm) => {
    if (eduModal.editId) {
      const res = await graduateService.updateEducation(eduModal.editId, data)
      setEducation((prev) => prev.map((e) => (e.id === eduModal.editId ? res.data : e)))
    } else {
      const res = await graduateService.createEducation(data)
      setEducation((prev) => [...prev, res.data])
    }
  }

  const handleEduDelete = (id: string) => {
    setDeleteConfirm({
      open: true, title: education.find((e) => e.id === id)?.degree || '',
      onConfirm: async () => {
        await graduateService.deleteEducation(id)
        setEducation((prev) => prev.filter((e) => e.id !== id))
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  const handleExpSave = async (data: ExperienceForm) => {
    if (expModal.editId) {
      const res = await graduateService.updateExperience(expModal.editId, data)
      setExperience((prev) => prev.map((e) => (e.id === expModal.editId ? res.data : e)))
    } else {
      const res = await graduateService.createExperience(data)
      setExperience((prev) => [...prev, res.data])
    }
  }

  const handleExpDelete = (id: string) => {
    setDeleteConfirm({
      open: true, title: experience.find((e) => e.id === id)?.title || '',
      onConfirm: async () => {
        await graduateService.deleteExperience(id)
        setExperience((prev) => prev.filter((e) => e.id !== id))
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  const handleCertSave = async (data: CertificationForm) => {
    if (certModal.editId) {
      const res = await graduateService.updateCertification(certModal.editId, data)
      setCertifications((prev) => prev.map((c) => (c.id === certModal.editId ? res.data : c)))
    } else {
      const res = await graduateService.createCertification(data)
      setCertifications((prev) => [...prev, res.data])
    }
  }

  const handleCertDelete = (id: string) => {
    setDeleteConfirm({
      open: true, title: certifications.find((c) => c.id === id)?.name || '',
      onConfirm: async () => {
        await graduateService.deleteCertification(id)
        setCertifications((prev) => prev.filter((c) => c.id !== id))
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  const handleProjSave = async (data: ProjectForm) => {
    if (projModal.editId) {
      const res = await graduateService.updateProject(projModal.editId, data)
      setProjects((prev) => prev.map((p) => (p.id === projModal.editId ? res.data : p)))
    } else {
      const res = await graduateService.createProject(data)
      setProjects((prev) => [...prev, res.data])
    }
  }

  const handleProjDelete = (id: string) => {
    setDeleteConfirm({
      open: true, title: projects.find((p) => p.id === id)?.title || '',
      onConfirm: async () => {
        await graduateService.deleteProject(id)
        setProjects((prev) => prev.filter((p) => p.id !== id))
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  const handleAddSkill = async (skillId: string, proficiency: string, yearsExperience: number) => {
    if (!profile) return
    const res = await graduateService.addSkill(profile.id, { skill: skillId, proficiency, years_experience: yearsExperience })
    setProfile((prev) => prev ? { ...prev, skills: [...prev.skills, res.data] } : prev)
  }

  const handleRemoveSkill = (skillId: string) => {
    if (!profile) return
    setDeleteConfirm({
      open: true, title: profile.skills.find((s) => s.id === skillId)?.skill_name || '',
      onConfirm: async () => {
        await graduateService.removeSkill(profile.id, { skill_id: skillId })
        setProfile((prev) => prev ? { ...prev, skills: prev.skills.filter((s) => s.id !== skillId) } : prev)
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', file.name)
      fd.append('language', 'ar')
      const res = await cvService.create(fd)
      setCvs((prev) => [...prev, res.data])
    } catch { /* ignore */ } finally {
      setCvUploading(false)
      e.target.value = ''
    }
  }

  const handleCvDelete = (id: string) => {
    setDeleteConfirm({
      open: true, title: cvs.find((c) => c.id === id)?.title || '',
      onConfirm: async () => {
        await cvService.delete(id)
        setCvs((prev) => prev.filter((c) => c.id !== id))
        setDeleteConfirm((d) => ({ ...d, open: false }))
      },
    })
  }

  if (loading) {
    return (
      <DashboardLayout role="graduate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout role="graduate">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error || t('unavailable')}</p>
          <button onClick={fetchAll} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  const displayedSkills = showAllSkills ? profile.skills : profile.skills.slice(0, 5)

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="glass-card p-8 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-32 gradient-primary opacity-10" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {(user?.full_name || 'U')[0]}
              </div>
              {profile.user.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-white dark:border-navy-800">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.user.full_name}</h1>
                {profile.user.is_verified && <ShieldCheck className="w-6 h-6 text-primary-500" />}
              </div>
              <p className="text-lg text-primary-500 font-medium mb-3">{profile.headline || t('role.graduate')}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.city}</span>}
                {profile.current_position && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{profile.current_position}</span>}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{profile.available_for_work ? t('available_for_work') : t('unavailable')}</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                {profile.user.is_verified && <span className="badge-success">{t('verified')}</span>}
                {profile.college_name && <span className="badge-primary">{profile.college_name}</span>}
                {profile.available_for_work && <span className="badge-warning">{t('graduate.profile.looking_for_job')}</span>}
              </div>
              <div className="flex justify-center sm:justify-start gap-3 mt-4">
                <button onClick={() => setEditModalOpen(true)} className="btn-primary text-sm py-2 px-4"><Edit2 className="w-4 h-4" />{t('graduate.profile.edit')}</button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <div className="text-2xl font-bold text-primary-500">{profile.user.profile_completion}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile_completion')}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="gradient-primary h-2 rounded-full" style={{ width: `${profile.user.profile_completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 animate-fade-in">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 text-primary-500" />{profile.user.email}
            </span>
            {profile.user.phone && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-primary-500" />{profile.user.phone}
              </span>
            )}
            {profile.linkedin_url && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Linkedin className="w-4 h-4 text-primary-500" />{profile.linkedin_url}
              </span>
            )}
            {profile.github_url && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Github className="w-4 h-4 text-primary-500" />{profile.github_url}
              </span>
            )}
            {profile.portfolio_url && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ExternalLink className="w-4 h-4 text-primary-500" />{profile.portfolio_url}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileSection title={t('bio')} icon={User} onEdit={() => setEditModalOpen(true)}>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {profile.user.bio || t('graduate.profile.no_bio')}
              </p>
            </ProfileSection>

            <ProfileSection
              title={t('graduate.profile.experience')}
              icon={Briefcase}
              onAdd={() => setExpModal({ open: true, initial: emptyExperience(), editId: undefined })}
            >
              {experience.length > 0 ? (
                <div className="space-y-5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pr-6 pb-5 border-r-2 border-primary-200 dark:border-primary-800 last:pb-0 group">
                      <div className="absolute -right-2 top-0 w-4 h-4 rounded-full bg-primary-500 border-2 border-white dark:border-navy-800" />
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-sm text-primary-500 font-medium">{exp.company}</p>
                        </div>
                        <span className="badge-primary text-xs whitespace-nowrap">{t(exp.employment_type)}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {exp.start_date} - {exp.is_current ? t('present') : exp.end_date}
                      </p>
                      {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exp.description}</p>}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setExpModal({ open: true, initial: exp, editId: exp.id })} className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                          <Edit2 className="w-3 h-3" />{t('edit')}
                        </button>
                        <button onClick={() => handleExpDelete(exp.id)} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />{t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_experience')}</p>
              )}
            </ProfileSection>

            <ProfileSection
              title={t('education')}
              icon={GraduationCap}
              onAdd={() => setEduModal({ open: true, initial: emptyEducation(), editId: undefined })}
            >
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50 group">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{edu.degree} - {edu.field_of_study}</h4>
                        <p className="text-sm text-primary-500">{edu.institution}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>{edu.start_date} - {edu.is_current ? t('present') : edu.end_date}</span>
                          {edu.grade && <><span>•</span><span>{t('gpa')}: {edu.grade}</span></>}
                        </div>
                        {edu.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{edu.description}</p>}
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEduModal({ open: true, initial: edu, editId: edu.id })} className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                            <Edit2 className="w-3 h-3" />{t('edit')}
                          </button>
                          <button onClick={() => handleEduDelete(edu.id)} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />{t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_education')}</p>
              )}
            </ProfileSection>

            <ProfileSection
              title={t('projects')}
              icon={FileText}
              onAdd={() => setProjModal({ open: true, initial: emptyProject(), editId: undefined })}
            >
              {projects.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50 card-hover group">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{project.title}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setProjModal({ open: true, initial: project, editId: project.id })} className="text-xs text-primary-500 hover:text-primary-600"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleProjDelete(project.id)} className="text-xs text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {project.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.technologies.split(',').map((t) => (
                            <span key={t.trim()} className="badge-primary text-xs">{t.trim()}</span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium">
                          <ExternalLink className="w-3.5 h-3.5" /> {t('view_details')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_projects')}</p>
              )}
            </ProfileSection>
          </div>

          <div className="space-y-6">
            <ProfileSection
              title={t('skills')}
              icon={Star}
              onAdd={() => setSkillModalOpen(true)}
            >
              {profile.skills.length > 0 ? (
                <div className="space-y-3">
                  {displayedSkills.map((skill) => (
                    <div key={skill.id} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skill_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {skill.proficiency === 'expert' ? t('graduate.profile.skill.expert') : skill.proficiency === 'advanced' ? t('graduate.profile.skill.advanced') : skill.proficiency === 'intermediate' ? t('graduate.profile.skill.intermediate') : t('graduate.profile.skill.beginner')}
                          </span>
                          <button onClick={() => handleRemoveSkill(skill.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${skill.proficiency === 'expert' ? 95 : skill.proficiency === 'advanced' ? 80 : skill.proficiency === 'intermediate' ? 60 : 40}%`,
                            background: skill.proficiency === 'expert' || skill.proficiency === 'advanced'
                              ? 'linear-gradient(to right, #0a66c2, #06b6d4)'
                              : skill.proficiency === 'intermediate'
                              ? 'linear-gradient(to right, #0a66c2, #60a5fa)'
                              : 'linear-gradient(to right, #94a3b8, #cbd5e1)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_skills')}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {profile.skills.length > 5 && (
                  <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                    {showAllSkills ? t('see_less') : `+${profile.skills.length - 5} ${t('skills')}`}
                    <ChevronRight className={`w-4 h-4 transition-transform ${showAllSkills ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
            </ProfileSection>

            <ProfileSection
              title={t('certifications')}
              icon={Award}
              onAdd={() => setCertModal({ open: true, initial: emptyCertification(), editId: undefined })}
            >
              {certifications.length > 0 ? (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50 group">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{cert.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issuer} • {cert.issue_date}</p>
                            {cert.credential_id && <p className="text-xs text-primary-500 mt-0.5">{cert.credential_id}</p>}
                          </div>
                          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setCertModal({ open: true, initial: cert, editId: cert.id })} className="text-xs text-primary-500 hover:text-primary-600"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleCertDelete(cert.id)} className="text-xs text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_certifications')}</p>
              )}
            </ProfileSection>

            <ProfileSection title={t('upload_cv')} icon={FileText}>
              <div className="space-y-3">
                {cvs.length > 0 && (
                  <div className="space-y-2">
                    {cvs.map((cv) => (
                      <div key={cv.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{cv.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{cv.language === 'ar' ? t('arabic') : t('english')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleCvDelete(cv.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                  {cvUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">{cvUploading ? t('loading') : t('upload_cv')}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} disabled={cvUploading} />
                </label>
              </div>
            </ProfileSection>

            <ProfileSection title={t('language')} icon={Globe}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">العربية</span>
                  <span className="text-xs badge-success">{t('native') || 'لغة أم'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">الإنجليزية</span>
                  <span className="text-xs badge-primary">{t('advanced') || 'متقدم'}</span>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleProfileSave}
        initialData={{
          headline: profile.headline,
          city: profile.city,
          available_for_work: profile.available_for_work,
          expected_salary: profile.expected_salary,
          current_position: profile.current_position,
          current_company: profile.current_company,
          is_employed: profile.is_employed,
          linkedin_url: profile.linkedin_url,
          github_url: profile.github_url,
          portfolio_url: profile.portfolio_url,
          behance_url: profile.behance_url,
          bio: profile.user.bio,
        }}
      />

      <EducationModal
        isOpen={eduModal.open}
        onClose={() => setEduModal({ open: false, initial: emptyEducation(), editId: undefined })}
        onSave={handleEduSave}
        initial={eduModal.initial}
      />

      <ExperienceModal
        isOpen={expModal.open}
        onClose={() => setExpModal({ open: false, initial: emptyExperience(), editId: undefined })}
        onSave={handleExpSave}
        initial={expModal.initial}
      />

      <CertificationModal
        isOpen={certModal.open}
        onClose={() => setCertModal({ open: false, initial: emptyCertification(), editId: undefined })}
        onSave={handleCertSave}
        initial={certModal.initial}
      />

      <ProjectModal
        isOpen={projModal.open}
        onClose={() => setProjModal({ open: false, initial: emptyProject(), editId: undefined })}
        onSave={handleProjSave}
        initial={projModal.initial}
      />

      <AddSkillModal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        onAdd={handleAddSkill}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm((d) => ({ ...d, open: false }))}
        onConfirm={deleteConfirm.onConfirm}
        title={deleteConfirm.title}
      />
    </DashboardLayout>
  )
}
