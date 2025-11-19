import { View, StyleSheet, ViewStyle } from 'react-native';
import { Spacing, BorderRadius, Shadow } from '@/lib/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function Card({ children, style, noPadding = false }: CardProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.card },
      noPadding && styles.noPadding,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    ...Shadow.card,
  },
  noPadding: {
    padding: 0,
  },
});
