'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { authService } from '@/lib/api-services'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.passwordReset({ email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || t('forgot_password.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">خريجون</span>
            </Link>
            {sent ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('forgot_password.sent_title')}</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('forgot_password.sent_message', { email })}
                </p>
                <Link href="/login" className="btn-primary mt-4">
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgot_password.back_to_login')}
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('forgot_password')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('forgot_password.subtitle')}</p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('forgot_password.email_label')}
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input-field pr-12"
                    placeholder={t('forgot_password.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? t('loading') : t('forgot_password.send')}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/login" className="text-primary-500 font-medium hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgot_password.back_to_login')}
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
