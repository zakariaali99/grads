'use client'

import { useThemeStore } from '@/store/themeStore'
import { useTranslation } from '@/i18n'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()
  const { t } = useTranslation()

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 dark:text-gray-400 transition-colors"
      title={isDark ? t('theme.light_mode') : t('theme.dark_mode')}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
