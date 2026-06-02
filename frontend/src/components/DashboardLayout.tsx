'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import {
  LayoutDashboard, User, Briefcase, FileText, Calendar,
  MessageSquare, BarChart3, GraduationCap, LogOut,
  ShieldCheck, Building2, Users, Settings,
  PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen, Megaphone,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import StreakBadge from '@/components/StreakBadge'
import Topbar from '@/components/Topbar'

const navItems = {
  graduate: [
    { labelKey: 'nav.dashboard', href: '/graduate', icon: LayoutDashboard },
    { labelKey: 'nav.profile', href: '/graduate/profile', icon: User },
    { labelKey: 'nav.jobs', href: '/graduate/jobs', icon: Briefcase },
    { labelKey: 'nav.applications', href: '/graduate/applications', icon: FileText },
    { labelKey: 'nav.interviews', href: '/graduate/interviews', icon: Calendar },
    { labelKey: 'nav.messages', href: '/graduate/messages', icon: MessageSquare },
    { labelKey: 'nav.analytics', href: '/graduate/analytics', icon: BarChart3 },
  ],
  employer: [
    { labelKey: 'nav.dashboard', href: '/employer', icon: LayoutDashboard },
    { labelKey: 'nav.company', href: '/employer/company', icon: Building2 },
    { labelKey: 'nav.jobs', href: '/employer/jobs', icon: Briefcase },
    { labelKey: 'nav.candidates', href: '/employer/candidates', icon: Users },
    { labelKey: 'nav.interviews', href: '/employer/interviews', icon: Calendar },
    { labelKey: 'nav.messages', href: '/employer/messages', icon: MessageSquare },
    { labelKey: 'nav.reports', href: '/employer/analytics', icon: BarChart3 },
  ],
  admin: [
    { labelKey: 'nav.admin_dashboard', href: '/admin', icon: LayoutDashboard },
    { labelKey: 'nav.users', href: '/admin/users', icon: Users },
    { labelKey: 'nav.graduates', href: '/admin/graduates', icon: GraduationCap },
    { labelKey: 'nav.companies', href: '/admin/companies', icon: Building2 },
    { labelKey: 'nav.jobs', href: '/admin/jobs', icon: Briefcase },
    { labelKey: 'nav.verifications', href: '/admin/verifications', icon: ShieldCheck },
    { labelKey: 'nav.reports', href: '/admin/reports', icon: BarChart3 },
    { labelKey: 'nav.ads', href: '/admin/ads', icon: Megaphone },
    { labelKey: 'nav.settings', href: '/admin/settings', icon: Settings },
  ],
}

const roleConfig = {
  graduate: {
    labelKey: 'role.graduate' as const,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  employer: {
    labelKey: 'role.employer' as const,
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  },
  admin: {
    labelKey: 'role.admin' as const,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
}

export default function DashboardLayout({ children, role }: { children: React.ReactNode; role: 'graduate' | 'employer' | 'admin' }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { t, dir } = useTranslation()
  const config = roleConfig[role]
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <aside className={cn(
        "fixed rtl:right-0 ltr:left-0 top-0 bottom-0 bg-white dark:bg-navy-800 rtl:border-l ltr:border-r border-gray-200 dark:border-gray-700/50 flex flex-col z-40 shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo + Fold button */}
        <div className={cn("flex items-center pt-6 pb-4", collapsed ? "justify-center px-0" : "px-5")}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-bold gradient-text leading-none block">{t('app.name')}</span>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border mt-0.5",
                  config.color
                )}>
                  {t(config.labelKey)}
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-400 hover:text-primary-500 transition-colors"
                title={t('sidebar.collapse')}
              >
                {dir === 'ltr' ? <PanelLeftClose className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Streak */}
            <div className="px-4 mb-3">
              <StreakBadge compact />
            </div>
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-3" />
          </>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5 px-2">
          {navItems[role].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed
                    ? "justify-center p-2.5"
                    : "px-4 py-2.5",
                  isActive
                    ? "bg-gradient-to-l from-primary-50 to-white dark:from-primary-900/20 dark:to-navy-800 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700/50 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                {isActive && !collapsed && (
                  <span className="absolute rtl:right-0 ltr:left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-primary-500 to-accent-500" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-colors duration-200 shrink-0",
                  isActive ? "text-primary-500" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{t(item.labelKey)}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button when expanded, expand button when collapsed */}
        {collapsed && (
          <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-700/50 flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-400 hover:text-primary-500 transition-colors"
              title={t('sidebar.expand')}
            >
              {dir === 'ltr' ? <PanelLeftOpen className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* User section */}
        <div className={cn("border-t border-gray-100 dark:border-gray-700/50", collapsed ? "pt-2 pb-3" : "pt-3 pb-4 px-4")}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors group cursor-default">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {user?.full_name || user?.username || ''}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                <span>{t('logout')}</span>
              </button>
            </>
          )}
        </div>
      </aside>

      <main className={cn("min-h-screen transition-all duration-300", collapsed ? "rtl:lg:pr-16 ltr:lg:pl-16" : "rtl:lg:pr-64 ltr:lg:pl-64")}>
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} sidebarCollapsed={collapsed} />
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
