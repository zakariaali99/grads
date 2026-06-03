'use client'

import { useState } from 'react'
import { X, Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { authService } from '@/lib/api-services'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const validate = () => {
    if (form.newPass.length < 8) return t('change_password.too_short')
    if (form.newPass !== form.confirm) return t('change_password.mismatch')
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      await authService.changePassword({
        old_password: form.current,
        new_password: form.newPass,
        new_password_confirm: form.confirm,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setForm({ current: '', newPass: '', confirm: '' })
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || t('change_password.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('change_password')}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('change_password.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('change_password.current')}</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={show.current ? 'text' : 'password'}
                  required
                  className="input-field pr-12 pl-12"
                  value={form.current}
                  onChange={(e) => setForm({ ...form, current: e.target.value })}
                />
                <button type="button" onClick={() => setShow({ ...show, current: !show.current })} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('change_password.new')}</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={show.newPass ? 'text' : 'password'}
                  required
                  className="input-field pr-12 pl-12"
                  value={form.newPass}
                  onChange={(e) => setForm({ ...form, newPass: e.target.value })}
                />
                <button type="button" onClick={() => setShow({ ...show, newPass: !show.newPass })} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {show.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('change_password.confirm')}</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={show.confirm ? 'text' : 'password'}
                  required
                  className="input-field pr-12 pl-12"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={onClose} className="btn-ghost">{t('cancel')}</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {t('change_password')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
