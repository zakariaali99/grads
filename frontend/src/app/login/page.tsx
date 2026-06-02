'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/i18n'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      const user = useAuthStore.getState().user
      if (user?.user_type === 'admin') router.push('/admin')
      else if (user?.user_type === 'employer') router.push('/employer')
      else router.push('/graduate')
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">خريجون</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('login.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('welcome_back')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.username_label')}
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input-field pr-12"
                  placeholder="example@email.com"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  dir="auto"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-12 pl-12"
                  placeholder={t('login.password_placeholder')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-600 dark:text-gray-400">{t('remember_me')}</span>
              </label>
              <Link href="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                {t('forgot_password')}
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? t('loading') : t('login')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-400">{t('or')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary text-sm py-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="btn-secondary text-sm py-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('no_account')}{' '}
            <Link href="/register" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              {t('create_account')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
