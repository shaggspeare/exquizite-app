import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Spacing, BorderRadius, Typography } from '@/lib/constants';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getBackgroundColor = () => {
    if (disabled) {
      if (variant === 'primary') return colors.border;
      if (variant === 'secondary') return colors.card;
      return 'transparent';
    }
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.card;
    return 'transparent';
  };

  const getBorderColor = () => {
    if (disabled && variant === 'outline') return colors.border;
    if (variant === 'secondary') return colors.border;
    if (variant === 'outline') return colors.primary;
    return undefined;
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'secondary') return colors.text;
    if (variant === 'outline' || variant === 'text') return colors.primary;
    return colors.text;
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' || variant === 'outline' ? 1 : 0,
        },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    opacity: 0.8,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '500',
  },
});
