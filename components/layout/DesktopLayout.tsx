// Main desktop layout wrapper with sidebar
import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopSidebar } from './DesktopSidebar';
import { useTheme } from '@/contexts/ThemeContext';

interface DesktopLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function DesktopLayout({ children, hideSidebar = false }: DesktopLayoutProps) {
  const { isDesktop } = useResponsive();
  const { colors } = useTheme();

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideSidebar && <DesktopSidebar />}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
