import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard } from './GlassCard';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon = 'sad-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md }}>
    <Ionicons name={icon} size={64} color={colors.textMuted} />
    <Text style={[typography.h3, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
    {message && (
      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
        {message}
      </Text>
    )}
    {actionLabel && onAction && (
      <TouchableOpacity
        onPress={onAction}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.lg,
          marginTop: spacing.md,
        }}
      >
        <Text style={[typography.bodyBold, { color: '#FFF' }]}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);
