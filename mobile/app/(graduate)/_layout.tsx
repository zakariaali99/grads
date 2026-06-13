import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { darkColors, lightColors } from '../../src/theme';

export default function GraduateLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
