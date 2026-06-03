import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  noPadding?: boolean;
};

export const GlassCard = ({ children, style, variant = 'default', noPadding = false }: GlassCardProps) => {
  const gradientMap = {
    default: colors.gradientCard,
    primary: colors.gradientPrimary,
    success: colors.gradientSuccess,
    warning: colors.gradientWarning,
    error: colors.gradientError,
  } as const;

  return (
    <LinearGradient
      colors={[...gradientMap[variant]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          ...shadows.md,
          padding: noPadding ? 0 : spacing.lg,
        },
        style,
      ]}
    >
      <View style={{ borderRadius: borderRadius.xl, overflow: 'hidden' }}>
        {children}
      </View>
    </LinearGradient>
  );
};
