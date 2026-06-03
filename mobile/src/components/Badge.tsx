import React from 'react';
import { View, Text, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

type BadgeProps = {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
};

const variantStyles = {
  default: { bg: colors.surfaceLight, text: colors.textSecondary },
  primary: { bg: colors.primary + '30', text: colors.primaryLight },
  success: { bg: colors.success + '30', text: colors.success },
  warning: { bg: colors.warning + '30', text: colors.warning },
  error: { bg: colors.error + '30', text: colors.error },
  info: { bg: colors.info + '30', text: colors.info },
};

export const Badge = ({ label, variant = 'default', size = 'sm' }: BadgeProps) => {
  const v = variantStyles[variant];
  const isSm = size === 'sm';
  return (
    <View
      style={{
        backgroundColor: v.bg,
        paddingHorizontal: isSm ? spacing.sm : spacing.md,
        paddingVertical: isSm ? 2 : spacing.xs,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={[
          isSm ? typography.tiny : typography.small,
          { color: v.text, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};
