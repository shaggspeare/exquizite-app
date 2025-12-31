import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TourSlide } from '../../../components/tour/TourSlide';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      textSecondary: '#666666',
    },
    isDark: false,
  }),
}));

describe('TourSlide', () => {
  it('renders with title and description', () => {
    render(
      <TourSlide
        title="Welcome"
        description="This is the welcome slide"
        icon="home"
        iconColor="#007AFF"
      />
    );
    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByText('This is the welcome slide')).toBeTruthy();
  });

  it('renders with different icon', () => {
    render(
      <TourSlide
        title="Create Sets"
        description="Create your own word sets"
        icon="add-circle"
        iconColor="#00C853"
      />
    );
    expect(screen.getByText('Create Sets')).toBeTruthy();
    expect(screen.getByText('Create your own word sets')).toBeTruthy();
  });

  it('renders with long description', () => {
    const longDescription = 'This is a very long description that should wrap to multiple lines and still be displayed correctly in the tour slide component.';
    render(
      <TourSlide
        title="Long Content"
        description={longDescription}
        icon="book"
        iconColor="#FF5722"
      />
    );
    expect(screen.getByText(longDescription)).toBeTruthy();
  });

  it('renders with special characters in text', () => {
    render(
      <TourSlide
        title="Learn & Practice!"
        description="Use AI-powered translations"
        icon="sparkles"
        iconColor="#9C27B0"
      />
    );
    expect(screen.getByText('Learn & Practice!')).toBeTruthy();
    expect(screen.getByText('Use AI-powered translations')).toBeTruthy();
  });
});
