import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { GlassCard } from './GlassCard';

type ErrorWidgetProps = {
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
};

export const ErrorWidget = ({ message, onRetry, onGoBack }: ErrorWidgetProps) => (
  <GlassCard variant="error" style={{ margin: spacing.lg, alignItems: 'center', gap: spacing.md }}>
    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
    <Text style={[typography.bodyBold, { color: colors.text, textAlign: 'center' }]}>
      {message || 'Something went wrong'}
    </Text>
    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: colors.error,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.lg,
          }}
        >
          <Text style={[typography.bodyBold, { color: '#FFF' }]}>Retry</Text>
        </TouchableOpacity>
      )}
      {onGoBack && (
        <TouchableOpacity
          onPress={onGoBack}
          style={{
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.textMuted,
          }}
        >
          <Text style={[typography.bodyBold, { color: colors.textSecondary }]}>Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  </GlassCard>
);
