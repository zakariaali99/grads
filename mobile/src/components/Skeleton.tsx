import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

const SkeletonBlock = ({ width = '100%', height = 16, borderRadius: br = borderRadius.sm, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: colors.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard = ({ style }: { style?: ViewStyle }) => (
  <View
    style={[
      {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.lg,
        gap: spacing.md,
      },
      style,
    ]}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <SkeletonBlock width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <SkeletonBlock width="60%" height={14} />
        <SkeletonBlock width="40%" height={12} />
      </View>
    </View>
    <SkeletonBlock width="100%" height={12} />
    <SkeletonBlock width="80%" height={12} />
  </View>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <View style={{ gap: spacing.md }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);
