// Animation utilities for the Exquizite app
import {
  withSpring,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

// Spring configurations
export const SpringConfig = {
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
  },
};

// Timing configurations
export const TimingConfig = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  },
  medium: {
    duration: 250,
    easing: Easing.out(Easing.cubic),
  },
  slow: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
};

// Card tap animation - scale down effect
export const createCardPressAnimation = (pressed: boolean) => {
  'worklet';
  return withSpring(pressed ? 0.98 : 1, SpringConfig.gentle);
};

// Bounce animation for success states
export const createBounceAnimation = () => {
  'worklet';
  return withSequence(
    withSpring(1.1, SpringConfig.bouncy),
    withSpring(1, SpringConfig.gentle)
  );
};

// Slide up with bounce for modals
export const createSlideUpAnimation = (show: boolean) => {
  'worklet';
  return show
    ? withSpring(0, SpringConfig.default)
    : withTiming(100, TimingConfig.fast);
};

// Fade animation
export const createFadeAnimation = (show: boolean) => {
  'worklet';
  return withTiming(show ? 1 : 0, TimingConfig.medium);
};

// Scale animation for pop effects
export const createScaleAnimation = (show: boolean) => {
  'worklet';
  return show
    ? withSpring(1, SpringConfig.bouncy)
    : withTiming(0, TimingConfig.fast);
};

// Rotation animation for loading spinners
export const createRotationAnimation = (rotating: boolean) => {
  'worklet';
  return rotating
    ? withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      })
    : withTiming(0, TimingConfig.fast);
};

// Pulse animation for AI indicators
export const createPulseAnimation = (value: number) => {
  'worklet';
  return withSequence(
    withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
  );
};

// Progress bar fill animation
export const createProgressAnimation = (progress: number) => {
  'worklet';
  return withSpring(progress, {
    damping: 20,
    stiffness: 90,
    mass: 1,
  });
};

// Shimmer animation for loading states
export const createShimmerAnimation = (value: number) => {
  'worklet';
  return interpolate(
    value,
    [0, 1],
    [-1, 1],
    Extrapolation.CLAMP
  );
};

// Card flip animation with 3D perspective
export const createFlipAnimation = (flipped: boolean) => {
  'worklet';
  return withSpring(flipped ? 180 : 0, {
    damping: 15,
    stiffness: 100,
  });
};

// Stagger delay for list items
export const getStaggerDelay = (index: number, baseDelay = 50) => {
  return index * baseDelay;
};

// Particle burst keyframes (used for achievements)
export const createParticleBurstAnimation = (delay: number = 0) => {
  'worklet';
  return withSequence(
    withTiming(0, { duration: delay }),
    withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) })
  );
};

// Glow effect animation
export const createGlowAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
    withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) })
  );
};
