'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Building2, Search, Shield, ArrowLeft, Moon, Sun, Menu, UserPlus, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/i18n'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  const { t } = useTranslation()
  const [dark, setDark] = useState(false)

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary-500" />
            <span className="text-xl font-bold gradient-text">خريجون</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="btn-ghost">
                <LogIn className="w-4 h-4" />
                {t('login')}
              </Link>
              <Link href="/register" className="btn-primary">
                <UserPlus className="w-4 h-4" />
                {t('register')}
              </Link>
            <button onClick={toggleDark} className="btn-ghost p-2">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <button className="md:hidden btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 border border-primary-200 dark:border-primary-800">
              <Shield className="w-4 h-4" />
              {t('landing.hero.badge')}
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              {t('landing.hero.title_start')}{' '}
              <span className="gradient-text">{t('landing.hero.title_end')}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.description')}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary-lg group"
              >
                {t('landing.hero.cta')}
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary-lg"
              >
                <LogIn className="w-5 h-5" />
                {t('login')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.features.title')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: GraduationCap,
                title: t('landing.features.graduate.title'),
                desc: t('landing.features.graduate.desc'),
                color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
              },
              {
                icon: Building2,
                title: t('landing.features.employer.title'),
                desc: t('landing.features.employer.desc'),
                color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
              },
              {
                icon: Search,
                title: t('landing.features.institution.title'),
                desc: t('landing.features.institution.desc'),
                color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
              },
            ].map((feat) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                className="glass-card p-8 card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feat.color}`}>
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '10,000+', label: t('landing.stats.graduates') },
              { value: '500+', label: t('landing.stats.companies') },
              { value: '2,000+', label: t('landing.stats.jobs') },
              { value: '95%', label: t('landing.stats.satisfaction') },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-l from-primary-500 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.cta.title')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              {t('landing.cta.description')}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-base font-bold text-primary-600 shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-[0.97]"
              >
                <UserPlus className="w-5 h-5" />
                {t('landing.hero.signup_free')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="text-lg font-bold gradient-text">خريجون</span>
          </div>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {t('landing.footer.copyright')} {new Date().getFullYear()} خريجون
          </p>
        </div>
      </footer>
    </div>
  )
}
