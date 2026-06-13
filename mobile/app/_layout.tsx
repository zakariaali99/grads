import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { darkColors, lightColors, applyTheme } from '../src/theme';
import { useAuthStore } from '../src/store/authStore';
import { useThemeStore } from '../src/store/themeStore';
import { I18nProvider } from '../src/i18n';

export default function RootLayout() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isDark = useThemeStore((s) => s.isDark);
  const initTheme = useThemeStore((s) => s.init);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    I18nManager.allowRTL(true);
    fetchProfile();
    initTheme();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <I18nProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(graduate)" />
          <Stack.Screen name="(employer)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(institution)" />
        </Stack>
      </GestureHandlerRootView>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
