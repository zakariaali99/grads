import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type AnimatedWrapperProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
};

export const FadeInView = ({ children, style, delay = 0, duration = 300 }: AnimatedWrapperProps) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
};

export const SlideUpView = ({ children, style, delay = 0, duration = 300 }: AnimatedWrapperProps) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export const ScaleInView = ({ children, style, delay = 0, duration = 300 }: AnimatedWrapperProps) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
        delay,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
};

export const StaggerView = ({
  children,
  index = 0,
  baseDelay = 80,
}: {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
}) => {
  return (
    <SlideUpView delay={baseDelay * index}>
      {children}
    </SlideUpView>
  );
};
