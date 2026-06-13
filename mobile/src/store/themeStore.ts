import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
  init: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  toggle: () => {
    const next = !get().isDark;
    set({ isDark: next });
    AsyncStorage.setItem('theme', next ? 'dark' : 'light').catch(() => {});
  },
  setDark: (v) => {
    set({ isDark: v });
    AsyncStorage.setItem('theme', v ? 'dark' : 'light').catch(() => {});
  },
  init: async () => {
    try {
      const v = await AsyncStorage.getItem('theme');
      if (v === 'light') set({ isDark: false });
      else set({ isDark: true });
    } catch {
      set({ isDark: true });
    }
  },
}));
