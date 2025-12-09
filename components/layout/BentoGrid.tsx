// Bento Grid layout component for desktop
import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { BorderRadius, Spacing } from '@/lib/constants';

interface BentoGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export function BentoGrid({
  children,
  columns = 2,
  gap = Spacing.lg,
}: BentoGridProps) {
  const { isDesktop } = useResponsive();

  // On mobile, show single column
  if (!isDesktop) {
    return <View style={styles.mobileContainer}>{children}</View>;
  }

  return <View style={[styles.grid, { gap }]}>{children}</View>;
}

interface BentoCardProps {
  children: ReactNode;
  span?: 1 | 2; // How many columns to span
  aspectRatio?: number;
  noPadding?: boolean;
}

export function BentoCard({
  children,
  span = 1,
  aspectRatio,
  noPadding = false,
}: BentoCardProps) {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          flex: isDesktop ? span : 1,
        },
        aspectRatio && { aspectRatio },
        noPadding && styles.noPadding,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    minWidth: 0,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
  mobileContainer: {
    width: '100%',
    gap: Spacing.md,
  },
});
