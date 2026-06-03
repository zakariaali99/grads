'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { authService } from '@/lib/api-services'
import { useAuthStore } from '@/store/authStore'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleDelete = async () => {
    setError('')
    setLoading(true)
    try {
      await authService.deleteAccount()
      setSuccess(true)
      setTimeout(() => {
        logout()
        router.push('/')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || t('delete_account.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('delete_account')}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('delete_account.success')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{t('delete_account.warning')}</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('delete_account.confirm')}
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={onClose} disabled={loading} className="btn-ghost">{t('cancel')}</button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                {t('delete_account')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
