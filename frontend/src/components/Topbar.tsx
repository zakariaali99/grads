'use client'

import { useTranslation } from '@/i18n'
import NotificationBell from '@/components/NotificationBell'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface TopbarProps {
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export default function Topbar({ onToggleSidebar, sidebarCollapsed }: TopbarProps) {
  const { t, dir } = useTranslation()

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/30">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-500 dark:text-gray-400 transition-colors"
            title={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {sidebarCollapsed
              ? (dir === 'ltr' ? <PanelLeftOpen className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />)
              : (dir === 'ltr' ? <PanelLeftClose className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />)}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </div>
  )
}
