import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
 useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Spacing } from '@/lib/constants';

interface TourProgressDotsProps {
  total: number;
  current: number;
  activeColor: string;
  inactiveColor: string;
}

export function TourProgressDots({
  total,
  current,
  activeColor,
  inactiveColor,
}: TourProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot
          key={index}
          isActive={index === current}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
      ))}
    </View>
  );
}

interface DotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

function Dot({ isActive, activeColor, inactiveColor }: DotProps) {
  const scale = useSharedValue(isActive ? 1.2 : 1);
  const opacity = useSharedValue(isActive ? 1 : 0.5);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withSpring(isActive ? 1 : 0.5);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
