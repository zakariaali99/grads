import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: number;
};

export const Avatar = ({ uri, name, size = 48 }: AvatarProps) => {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary + '40',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }}
    >
      <Text style={[typography.bodyBold, { color: colors.primaryLight, fontSize: size * 0.35 }]}>
        {initials}
      </Text>
    </View>
  );
};
