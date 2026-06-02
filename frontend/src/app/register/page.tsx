'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, User, Building2, Loader2, ChevronLeft, Mail, Lock, Phone, UserPlus, Check, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/i18n'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { register } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    user_type: '',
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    accepted_terms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || t('register.error'))
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
        className="w-full max-w-lg relative"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">خريجون</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('register.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('register.subtitle')}</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>1</div>
            <div className={`w-16 h-1 rounded transition-all ${
              step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>2</div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm mb-4"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">{t('register.choose_type')}</p>
              <button
                onClick={() => { setForm({ ...form, user_type: 'graduate' }); setStep(2) }}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all text-right card-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('register.graduate.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('register.graduate.desc')}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </button>
              <button
                onClick={() => { setForm({ ...form, user_type: 'employer' }); setStep(2) }}
                className="w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all text-right card-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('register.employer.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('register.employer.desc')}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.first_name')}</label>
                  <input type="text" required className="input-field" placeholder="أحمد"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.last_name')}</label>
                  <input type="text" required className="input-field" placeholder="محمد"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('username')}</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" required className="input-field pr-12" placeholder="ahmed123"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" required className="input-field pr-12" placeholder="ahmed@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('register.phone')}</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" className="input-field pr-12" placeholder="+218 91 234 5678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" required className="input-field pr-12" placeholder="********"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('register.password_hint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('confirm_password')}</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" required className="input-field pr-12" placeholder="********"
                    value={form.password_confirm}
                    onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-navy-800">
                <input type="checkbox" checked={form.accepted_terms} required
                  onChange={(e) => setForm({ ...form, accepted_terms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('register.agree')}{' '}
                  <Link href="/terms" className="text-primary-500 hover:underline font-medium">{t('register.terms')}</Link>
                  {' '}{t('register.and')}{' '}
                  <Link href="/privacy" className="text-primary-500 hover:underline font-medium">{t('register.privacy')}</Link>
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  {t('back')}
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  {loading ? t('loading') : t('register')}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('have_account')}{' '}
            <Link href="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              {t('login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
