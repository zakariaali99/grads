export const colors = {
  // Brand
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42D6',

  // Surface
  background: '#0A0E1A',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceLight: 'rgba(255, 255, 255, 0.08)',
  surfaceDark: 'rgba(0, 0, 0, 0.3)',

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',

  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#60A5FA',

  // Glass-card specific
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',
  glassShadow: 'rgba(0, 0, 0, 0.3)',

  // Gradients (used with LinearGradient)
  gradientPrimary: ['#6C63FF', '#4A42D6'] as const,
  gradientSuccess: ['#34D399', '#059669'] as const,
  gradientWarning: ['#FBBF24', '#D97706'] as const,
  gradientError: ['#EF4444', '#DC2626'] as const,
  gradientCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,

  // Tab bar
  tabBar: 'rgba(10, 14, 26, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  tabActive: '#6C63FF',
  tabInactive: 'rgba(255, 255, 255, 0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  tiny: { fontSize: 10, fontWeight: '400' as const, lineHeight: 14 },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const glassCardStyle = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.glassBorder,
  borderRadius: borderRadius.xl,
  ...shadows.md,
} as const;
