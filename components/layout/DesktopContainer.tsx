// Desktop container wrapper with max width and centered content
import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { MAX_CONTENT_WIDTH } from '@/lib/responsive';
import { useResponsive } from '@/hooks/useResponsive';

interface DesktopContainerProps {
  children: ReactNode;
  maxWidth?: number;
  noPadding?: boolean;
}

export function DesktopContainer({
  children,
  maxWidth = MAX_CONTENT_WIDTH,
  noPadding = false,
}: DesktopContainerProps) {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View
      style={[styles.container, { maxWidth }, noPadding && styles.noPadding]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});
