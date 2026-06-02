'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import ar from './ar'
import en from './en'

type Locale = 'ar' | 'en'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  dir: 'rtl' | 'ltr'
}

const translations: Record<Locale, Record<string, string>> = { ar, en }

const I18nContext = createContext<I18nContextType>({
  locale: 'ar',
  setLocale: () => {},
  t: (key: string) => key,
  dir: 'rtl',
})

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ar'
  return (localStorage.getItem('locale') as Locale) || 'ar'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let val = translations[locale]?.[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v))
      })
    }
    return val
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
