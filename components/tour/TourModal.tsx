import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useTour } from '@/contexts/TourContext';
import { TourSlide } from './TourSlide';
import { TourProgressDots } from './TourProgressDots';
import { Spacing, BorderRadius, Typography, Shadow } from '@/lib/constants';
import { isDesktopWeb } from '@/lib/platform-utils';

const SLIDE_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;

interface SlideContent {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const SLIDES: SlideContent[] = [
  {
    title: 'Build Your Vocabulary',
    description: 'Add words manually or use AI to generate themed vocabulary sets. Create up to 20 words per set.',
    icon: 'create-outline',
    iconColor: '#5B67E5',
  },
  {
    title: 'Organize Your Learning',
    description: 'Group words into themed sets like "Spanish Food" or "German Travel". Name your sets for easy access.',
    icon: 'library-outline',
    iconColor: '#10B981',
  },
  {
    title: 'Learn Your Way',
    description: 'Practice with 4 game modes: Flashcards, Match Pairs, Multiple Choice Quiz, and Fill in the Blank.',
    icon: 'game-controller-outline',
    iconColor: '#8B5CF6',
  },
  {
    title: 'Share Your Knowledge',
    description: 'Generate share links for your sets. Others can view and copy them to their library.',
    icon: 'share-social-outline',
    iconColor: '#E066FF',
  },
];

export function TourModal() {
  const { colors } = useTheme();
  const { isTourVisible, completeTour, skipTour } = useTour();
  const [currentSlide, setCurrentSlide] = useState(0);
  const translateX = useSharedValue(0);
  const isDesktop = Platform.OS === 'web' && isDesktopWeb();

  // Reset slide when modal opens
  useEffect(() => {
    if (isTourVisible) {
      setCurrentSlide(0);
      translateX.value = 0;
    }
  }, [isTourVisible]);

  // Keyboard navigation for web
  useEffect(() => {
    if (Platform.OS !== 'web' || !isTourVisible) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && currentSlide < SLIDES.length - 1) {
        goToNextSlide();
      } else if (event.key === 'ArrowLeft' && currentSlide > 0) {
        goToPreviousSlide();
      } else if (event.key === 'Escape') {
        skipTour();
      } else if (event.key === 'Enter') {
        if (currentSlide === SLIDES.length - 1) {
          completeTour();
        } else {
          goToNextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isTourVisible, currentSlide]);

  // Pan responder for swipe gestures (mobile)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDesktop,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isDesktop && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.value = gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldGoNext = gestureState.dx < -SWIPE_THRESHOLD && currentSlide < SLIDES.length - 1;
        const shouldGoPrev = gestureState.dx > SWIPE_THRESHOLD && currentSlide > 0;

        if (shouldGoNext) {
          goToNextSlide();
        } else if (shouldGoPrev) {
          goToPreviousSlide();
        } else {
          translateX.value = withSpring(0);
        }
      },
    })
  ).current;

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const goToNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      translateX.value = withTiming(-SLIDE_WIDTH, { duration: 300 }, () => {
        translateX.value = 0;
      });
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      translateX.value = withTiming(SLIDE_WIDTH, { duration: 300 }, () => {
        translateX.value = 0;
      });
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    skipTour();
  };

  const handleGetStarted = () => {
    completeTour();
  };

  const handleNext = () => {
    goToNextSlide();
  };

  const handleBack = () => {
    goToPreviousSlide();
  };

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <Modal
      visible={isTourVisible}
      transparent
      animationType="fade"
      onRequestClose={skipTour}
    >
      <View style={styles.overlay}>
        {/* Overlay Background */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
        )}

        {/* Modal Container */}
        <View style={[styles.modalContainer, isDesktop && styles.modalContainerDesktop]}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Skip
              </Text>
            </TouchableOpacity>

            {/* Slide Content */}
            <Animated.View
              style={[styles.slideContainer, animatedSlideStyle]}
              {...panResponder.panHandlers}
            >
              <TourSlide
                title={SLIDES[currentSlide].title}
                description={SLIDES[currentSlide].description}
                icon={SLIDES[currentSlide].icon}
                iconColor={SLIDES[currentSlide].iconColor}
              />
            </Animated.View>

            {/* Progress Dots */}
            <TourProgressDots
              total={SLIDES.length}
              current={currentSlide}
              activeColor={colors.primary}
              inactiveColor={colors.border}
            />

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {!isFirstSlide && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton, { borderColor: colors.border }]}
                  onPress={handleBack}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                  <Text style={[styles.buttonText, { color: colors.text }]} numberOfLines={1}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}

              {isLastSlide ? (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                    isFirstSlide ? styles.buttonFullWidth : styles.primaryButtonWithBack,
                  ]}
                  onPress={handleGetStarted}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]} numberOfLines={1}>
                    Get Started
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                    isFirstSlide ? styles.buttonFullWidth : styles.primaryButtonWithBack,
                  ]}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]} numberOfLines={1}>
                    Next
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContainerDesktop: {
    maxWidth: 600,
  },
  modal: {
    borderRadius: BorderRadius.cardLarge,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    ...Shadow.cardDeep,
    overflow: 'hidden',
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    fontWeight: '600',
  },
  slideContainer: {
    minHeight: 400,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.button,
    minHeight: 48,
    gap: Spacing.xs,
    ...Shadow.button,
  },
  backButton: {
    flex: 0.8,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryButton: {
    // Background color set dynamically
  },
  primaryButtonWithBack: {
    flex: 1.5,
  },
  buttonFullWidth: {
    flex: 1,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
    flexShrink: 1,
  },
});
