'use client'

import { useTranslation } from '@/i18n'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('privacy.title')}</h1>
        <div className="glass-card p-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. {t('privacy.collection')}</h2>
            <p>{t('privacy.collection_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. {t('privacy.usage')}</h2>
            <p>{t('privacy.usage_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. {t('privacy.sharing')}</h2>
            <p>{t('privacy.sharing_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. {t('privacy.cookies')}</h2>
            <p>{t('privacy.cookies_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. {t('privacy.security')}</h2>
            <p>{t('privacy.security_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. {t('privacy.rights')}</h2>
            <p>{t('privacy.rights_desc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. {t('privacy.contact')}</h2>
            <p>{t('privacy.contact_desc')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
