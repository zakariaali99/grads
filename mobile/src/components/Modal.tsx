import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

type ModalProps = {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export const Modal = ({ visible, title, children, onClose }: ModalProps) => {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
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
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          padding: spacing.xl,
          marginHorizontal: spacing.xl,
          width: '85%',
          maxHeight: '80%',
        }}
      >
        {title && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
            <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
        {children}
      </View>
    </View>
  );
};
