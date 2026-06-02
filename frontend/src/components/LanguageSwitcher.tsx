'use client'

import { useTranslation } from '@/i18n'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation()

  return (
    <button
      onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700/50 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 group"
      title={t('language')}
    >
      <Languages className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
      <span className="text-xs">{locale === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  )
}
