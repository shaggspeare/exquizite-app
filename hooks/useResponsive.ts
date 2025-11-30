// Hook for responsive design
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getScreenType } from '@/lib/responsive';

export function useResponsive() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>(() => getScreenType());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setScreenType(getScreenType());
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isDesktop: screenType === 'desktop',
    isTablet: screenType === 'tablet',
    isMobile: screenType === 'mobile',
    screenType,
  };
}
