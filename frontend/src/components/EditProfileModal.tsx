'use client'

import { useState } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { useTranslation } from '@/i18n'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  initialData: {
    headline: string | null
    city: string | null
    available_for_work: boolean
    expected_salary: number | null
    current_position: string | null
    current_company: string | null
    is_employed: boolean
    linkedin_url: string | null
    github_url: string | null
    portfolio_url: string | null
    behance_url: string | null
    bio: string | null
  }
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ ...initialData })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('graduate.profile.edit')}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.headline')}</label>
            <input className="input-field" value={form.headline || ''} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder={t('graduate.profile.headline_placeholder')} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')}</label>
              <input className="input-field" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.current_position')}</label>
              <input className="input-field" value={form.current_position || ''} onChange={(e) => setForm({ ...form, current_position: e.target.value })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.current_company')}</label>
              <input className="input-field" value={form.current_company || ''} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.expected_salary')}</label>
              <input type="number" className="input-field" value={form.expected_salary || ''} onChange={(e) => setForm({ ...form, expected_salary: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bio')}</label>
            <textarea className="input-field min-h-[100px]" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('graduate.profile.social_links')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                <input className="input-field" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                <input className="input-field" value={form.github_url || ''} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('graduate.profile.portfolio')}</label>
                <input className="input-field" value={form.portfolio_url || ''} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Behance</label>
                <input className="input-field" value={form.behance_url || ''} onChange={(e) => setForm({ ...form, behance_url: e.target.value })} placeholder="https://behance.net/..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.available_for_work} onChange={(e) => setForm({ ...form, available_for_work: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('graduate.profile.available_for_work')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_employed} onChange={(e) => setForm({ ...form, is_employed: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('graduate.profile.is_employed')}</span>
            </label>
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
