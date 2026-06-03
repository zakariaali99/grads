import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

type SearchFieldProps = TextInputProps & {
  icon?: keyof typeof Ionicons.glyphMap;
};

export const SearchField = ({ icon = 'search-outline', style, ...props }: SearchFieldProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      },
      style,
    ]}
  >
    <Ionicons name={icon} size={20} color={colors.textMuted} />
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[
        typography.body,
        { flex: 1, color: colors.text, paddingVertical: spacing.xs },
      ]}
      {...props}
    />
  </View>
);
