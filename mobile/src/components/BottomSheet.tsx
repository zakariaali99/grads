import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

type BottomSheetOption = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  options: BottomSheetOption[];
  onClose: () => void;
};

export const BottomSheet = ({ visible, title, options, onClose }: BottomSheetProps) => {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: '#1a1e2e',
          borderTopLeftRadius: borderRadius.xxl,
          borderTopRightRadius: borderRadius.xxl,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderBottomWidth: 0,
          paddingTop: spacing.xl,
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
        }}
      >
        {title && (
          <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.lg }]}>
            {title}
          </Text>
        )}
        <ScrollView>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                onClose();
                opt.onPress();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: i < options.length - 1 ? 1 : 0,
                borderBottomColor: colors.glassBorder,
              }}
            >
              {opt.icon && <Ionicons name={opt.icon} size={22} color={opt.destructive ? colors.error : colors.textSecondary} />}
              <Text
                style={[
                  typography.body,
                  { color: opt.destructive ? colors.error : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
