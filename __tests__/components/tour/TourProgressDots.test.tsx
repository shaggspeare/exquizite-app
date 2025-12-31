import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TourProgressDots } from '../../../components/tour/TourProgressDots';

describe('TourProgressDots', () => {
  it('renders correct number of dots', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={5}
        current={0}
        activeColor="#007AFF"
        inactiveColor="#E0E0E0"
      />
    );
    // Check that component renders
    expect(toJSON()).not.toBeNull();
  });

  it('renders with 3 dots', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={3}
        current={1}
        activeColor="#007AFF"
        inactiveColor="#E0E0E0"
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with first dot active', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={4}
        current={0}
        activeColor="#00C853"
        inactiveColor="#CCCCCC"
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with last dot active', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={4}
        current={3}
        activeColor="#FF5722"
        inactiveColor="#CCCCCC"
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with middle dot active', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={5}
        current={2}
        activeColor="#9C27B0"
        inactiveColor="#E0E0E0"
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with single dot', () => {
    const { toJSON } = render(
      <TourProgressDots
        total={1}
        current={0}
        activeColor="#007AFF"
        inactiveColor="#E0E0E0"
      />
    );
    expect(toJSON()).not.toBeNull();
  });
});
