'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import ar from './ar';
import en from './en';

type Locale = 'ar' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Locale, Record<string, string>> = { ar, en };

const I18nContext = createContext<I18nContextType>({
  locale: 'ar',
  setLocale: () => {},
  t: (key: string) => key,
  dir: 'rtl',
});

const STORAGE_KEY = 'locale';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ar';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'ar') return v;
  } catch {}
  return 'ar';
}

function saveLocale(v: Locale) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let val = translations[locale]?.[key];
    if (val === undefined) val = key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  }, [locale]);

  if (!ready) return null;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
