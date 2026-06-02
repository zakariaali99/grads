'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { adService, type AdvertisementData } from '@/lib/api-services'
import { Megaphone, ExternalLink } from 'lucide-react'

interface AdBannerProps {
  size?: 'small' | 'medium' | 'large' | 'sidebar'
  className?: string
}

export default function AdBanner({ size = 'medium', className }: AdBannerProps) {
  const { t } = useTranslation()
  const [ads, setAds] = useState<AdvertisementData[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    adService.list(size).then(({ data }) => {
      const list = (data as any)?.results || (Array.isArray(data) ? data : [])
      setAds(list)
    }).catch(() => {})
  }, [size])

  useEffect(() => {
    if (ads.length < 2) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % ads.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [ads.length])

  if (ads.length === 0) return null

  const ad = ads[current]

  const sizeClasses = {
    small: 'h-20',
    medium: 'h-28',
    large: 'h-40',
    sidebar: 'h-64',
  }

  const handleClick = () => {
    if (ad.link_url) window.open(ad.link_url, '_blank', 'noopener')
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-500/5 dark:to-accent-500/5 border border-primary-200/50 dark:border-primary-800/30 flex items-center justify-center group cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300',
        sizeClasses[size],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent dark:from-primary-500/10 dark:to-transparent" />
      <div className="text-center relative z-10 px-4">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-2">
          <Megaphone className="w-5 h-5 text-primary-500" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
          {ad.title}
        </p>
        {ad.description && size !== 'small' && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {ad.description}
          </p>
        )}
        {ad.link_url && (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3 h-3" /> {t('ad.more') || 'المزيد'}
          </span>
        )}
      </div>
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, i) => (
            <span key={i} className={cn('w-1.5 h-1.5 rounded-full transition-all', i === current ? 'bg-primary-500 w-3' : 'bg-gray-300 dark:bg-gray-600')} />
          ))}
        </div>
      )}
    </div>
  )
}
