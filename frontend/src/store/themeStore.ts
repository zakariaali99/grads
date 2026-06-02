import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (val: boolean) => void
}

const getInitialDark = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored !== null) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialDark = getInitialDark()
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', initialDark)
  }
  return {
    isDark: initialDark,
    toggle: () =>
      set((state) => {
        const newVal = !state.isDark
        localStorage.setItem('theme', newVal ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', newVal)
        return { isDark: newVal }
      }),
    setDark: (val) => {
      localStorage.setItem('theme', val ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', val)
      set({ isDark: val })
    },
  }
})
