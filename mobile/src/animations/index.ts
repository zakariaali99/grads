import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const animationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },
  springPress: {
    damping: 15,
    stiffness: 300,
    mass: 0.5,
  },
  stagger: {
    delay: 80,
  },
};

export const layoutAnimations = {
  fadeIn: () =>
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        animationConfig.duration.normal,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    ),
  slideUp: () =>
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        animationConfig.duration.normal,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.scaleXY,
      ),
    ),
  springIn: () =>
    LayoutAnimation.configureNext({
      duration: animationConfig.duration.normal,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    }),
};
