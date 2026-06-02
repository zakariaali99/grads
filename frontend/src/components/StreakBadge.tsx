'use client'

import { useEffect } from 'react'
import { Flame, Zap, Medal } from 'lucide-react'
import { useStreakStore } from '@/store/streakStore'
import { useTranslation } from '@/i18n'

export default function StreakBadge({ compact }: { compact?: boolean }) {
  const { currentStreak, longestStreak, totalActivities, todayActive, fetchStreak } = useStreakStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchStreak()
  }, [])

  const streakLevel = currentStreak >= 30 ? 'legendary' : currentStreak >= 14 ? 'on-fire' : currentStreak >= 7 ? 'consistent' : 'starter'

  const levelColors: Record<string, string> = {
    starter: 'from-gray-400 to-gray-300',
    consistent: 'from-amber-500 to-yellow-400',
    'on-fire': 'from-orange-500 to-red-500',
    legendary: 'from-purple-500 to-pink-500',
  }

  const levelIcons: Record<string, any> = {
    starter: Zap,
    consistent: Flame,
    'on-fire': Flame,
    legendary: Medal,
  }

  const Icon = levelIcons[streakLevel]

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-l from-primary-50/50 to-white dark:from-primary-900/10 dark:to-navy-800/50 border border-primary-100/50 dark:border-primary-800/20">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${levelColors[streakLevel]} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${currentStreak > 0 ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-gray-900 dark:text-white leading-none">{currentStreak}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{t('streak.days')}</span>
          </div>
        </div>
        {todayActive ? (
          <span className="text-[10px] text-emerald-500 font-medium whitespace-nowrap">✦ {t('streak.active_today')}</span>
        ) : (
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{longestStreak} {t('streak.max')}</span>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card p-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${levelColors[streakLevel]} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${currentStreak > 0 ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('streak.streak_days')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Medal className="w-3 h-3" />
              {t('streak.longest')}: {longestStreak}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {totalActivities} {t('streak.activity')}
            </span>
            {todayActive && (
              <span className="text-emerald-500 font-medium">✦ {t('streak.active_today')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
          style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">
          {streakLevel === 'legendary' ? t('streak.legendary') : streakLevel === 'on-fire' ? t('streak.on_fire') : streakLevel === 'consistent' ? t('streak.consistent') : t('streak.start_journey')}
        </span>
        {currentStreak < 30 && (
          <span className="text-xs text-gray-400">{30 - currentStreak} {t('streak.days_to_legend')}</span>
        )}
      </div>
    </div>
  )
}
