'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/i18n'
import NotificationBell from '@/components/NotificationBell'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'

interface TopbarProps {
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export default function Topbar({ onToggleSidebar, sidebarCollapsed }: TopbarProps) {
  const { t, dir } = useTranslation()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchValue('')
    }
  }

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

      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('search.global.placeholder')}
            className="w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 text-sm rounded-xl bg-gray-100 dark:bg-navy-800 border border-transparent focus:border-primary-300 dark:focus:border-primary-700 focus:outline-none focus:bg-white dark:focus:bg-navy-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </div>
  )
}
