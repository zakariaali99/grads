import { useThemeStore } from '../store/themeStore';
import { darkColors, lightColors } from '../theme';
import type { ColorScheme } from '../theme';

export function useColors(): ColorScheme {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? darkColors : lightColors;
}
