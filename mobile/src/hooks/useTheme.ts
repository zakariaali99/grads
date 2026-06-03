import { useColorScheme } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows, glassCardStyle } from '../theme';

export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';

  return {
    isDark,
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    glassCardStyle,
    scheme,
  };
};
