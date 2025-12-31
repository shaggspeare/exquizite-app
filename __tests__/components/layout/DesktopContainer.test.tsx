import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DesktopContainer } from '../../../components/layout/DesktopContainer';

// Mock useResponsive hook
const mockIsDesktop = jest.fn();

jest.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    isDesktop: mockIsDesktop(),
    isMobile: !mockIsDesktop(),
    isTablet: false,
    width: mockIsDesktop() ? 1200 : 375,
    height: 800,
  }),
}));

jest.mock('@/lib/responsive', () => ({
  MAX_CONTENT_WIDTH: 1200,
}));

describe('DesktopContainer', () => {
  beforeEach(() => {
    mockIsDesktop.mockReset();
  });

  it('renders children directly on mobile', () => {
    mockIsDesktop.mockReturnValue(false);
    render(
      <DesktopContainer>
        <Text>Mobile content</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('Mobile content')).toBeTruthy();
  });

  it('renders children in container on desktop', () => {
    mockIsDesktop.mockReturnValue(true);
    render(
      <DesktopContainer>
        <Text>Desktop content</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('Desktop content')).toBeTruthy();
  });

  it('applies custom maxWidth on desktop', () => {
    mockIsDesktop.mockReturnValue(true);
    render(
      <DesktopContainer maxWidth={800}>
        <Text>Custom width</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('Custom width')).toBeTruthy();
  });

  it('applies noPadding on desktop', () => {
    mockIsDesktop.mockReturnValue(true);
    render(
      <DesktopContainer noPadding>
        <Text>No padding</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('No padding')).toBeTruthy();
  });

  it('renders multiple children on desktop', () => {
    mockIsDesktop.mockReturnValue(true);
    render(
      <DesktopContainer>
        <Text>First child</Text>
        <Text>Second child</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('First child')).toBeTruthy();
    expect(screen.getByText('Second child')).toBeTruthy();
  });

  it('renders multiple children on mobile', () => {
    mockIsDesktop.mockReturnValue(false);
    render(
      <DesktopContainer>
        <Text>First child</Text>
        <Text>Second child</Text>
      </DesktopContainer>
    );
    expect(screen.getByText('First child')).toBeTruthy();
    expect(screen.getByText('Second child')).toBeTruthy();
  });
});
