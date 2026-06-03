'use client'

import { useTranslation } from '@/i18n'

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('terms.title')}</h1>
        <div className="glass-card p-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. {t('terms.intro')}</h2>
            <p>{t('terms.intro_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. {t('terms.eligibility')}</h2>
            <p>{t('terms.eligibility_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. {t('terms.accounts')}</h2>
            <p>{t('terms.accounts_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. {t('terms.content')}</h2>
            <p>{t('terms.content_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. {t('terms.privacy')}</h2>
            <p>{t('terms.privacy_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. {t('terms.limitation')}</h2>
            <p>{t('terms.limitation_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. {t('terms.contact')}</h2>
            <p>{t('terms.contact_desc')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
