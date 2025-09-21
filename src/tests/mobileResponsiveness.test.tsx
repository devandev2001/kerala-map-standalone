/**
 * Mobile Responsiveness Tests for Kerala Map Standalone
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';

// Mock the mobile detection utility
jest.mock('../utils/mobileDetection', () => ({
  useMobileDetection: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: true,
    screenSize: 'mobile',
    orientation: 'portrait'
  }),
  optimizeTouchInteractions: jest.fn()
}));

// Mock the data loading utilities
jest.mock('../utils/loadACData', () => ({
  loadACData: () => Promise.resolve({})
}));

jest.mock('../utils/loadMandalData', () => ({
  loadMandalData: () => Promise.resolve({})
}));

jest.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: () => Promise.resolve(),
  getACVoteShareData: () => []
}));

jest.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: () => Promise.resolve(),
  getMandalVoteShareData: () => []
}));

jest.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: () => Promise.resolve(),
  getLocalBodyVoteShareData: () => []
}));

jest.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: () => Promise.resolve(),
  getOrgDistrictTargetData: () => []
}));

jest.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: () => Promise.resolve(),
  getACTargetData: () => []
}));

jest.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: () => Promise.resolve(),
  getMandalTargetData: () => []
}));

jest.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: () => Promise.resolve([])
}));

jest.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: () => Promise.resolve(),
  getMandalContactData: () => []
}));

jest.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: () => Promise.resolve(),
  getLocalBodyContactData: () => []
}));

jest.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: () => Promise.resolve(),
  getZoneTargetData: () => []
}));

describe('IntegratedKeralaMap Mobile Responsiveness', () => {
  beforeEach(() => {
    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  test('renders mobile-optimized controls', async () => {
    render(<IntegratedKeralaMap />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    });

    // Check that controls have mobile-friendly classes
    const refreshButton = screen.getByTitle('Refresh Map');
    expect(refreshButton).toHaveClass('touch-target');
    
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    expect(fullscreenButton).toHaveClass('touch-target');
  });

  test('navigation buttons are touch-friendly', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    });

    const contactsButton = screen.getByTitle('Leadership Contacts');
    const voteShareButton = screen.getByTitle('Vote Share Performance');
    const targetsButton = screen.getByTitle('Local Body Targets');

    // Check touch-friendly classes
    expect(contactsButton).toHaveClass('touch-target');
    expect(voteShareButton).toHaveClass('touch-target');
    expect(targetsButton).toHaveClass('touch-target');

    // Check active states work
    fireEvent.touchStart(contactsButton);
    expect(contactsButton).toHaveClass('active:scale-95');
  });

  test('modals are mobile-responsive', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    });

    // Open leadership modal
    const contactsButton = screen.getByTitle('Leadership Contacts');
    fireEvent.click(contactsButton);

    await waitFor(() => {
      const modal = screen.getByRole('dialog', { hidden: true });
      expect(modal).toBeInTheDocument();
    });

    // Check modal has mobile-optimized classes
    const modalContainer = document.querySelector('.fixed.inset-0');
    expect(modalContainer).toHaveClass('p-2', 'sm:p-4');
    
    const modalContent = document.querySelector('.bg-gray-900\\/95');
    expect(modalContent).toHaveClass('rounded-xl', 'sm:rounded-2xl');
    expect(modalContent).toHaveClass('max-h-\\[95vh\\]', 'sm:max-h-\\[90vh\\]');
  });

  test('iframe has mobile optimizations', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      const iframe = screen.getByTitle('Kerala Interactive Map');
      expect(iframe).toBeInTheDocument();
    });

    const iframe = screen.getByTitle('Kerala Interactive Map');
    
    // Check mobile-specific classes
    expect(iframe).toHaveClass('touch-manipulation');
    
    // Check mobile-specific styles are applied
    const styles = window.getComputedStyle(iframe);
    expect(styles.touchAction).toBe('manipulation');
    expect(styles.userSelect).toBe('none');
  });

  test('handles touch interactions properly', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle('Refresh Map');
    
    // Test touch events
    fireEvent.touchStart(refreshButton);
    fireEvent.touchEnd(refreshButton);
    
    // Should not throw errors and should handle touch events gracefully
    expect(refreshButton).toBeInTheDocument();
  });

  test('modal close buttons are touch-friendly', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });

    // Open performance modal
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);

    await waitFor(() => {
      const closeButton = screen.getByTitle('Close Modal');
      expect(closeButton).toBeInTheDocument();
    });

    const closeButton = screen.getByTitle('Close Modal');
    expect(closeButton).toHaveClass('touch-target');
    
    // Test closing modal with touch
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTitle('Close Modal')).not.toBeInTheDocument();
    });
  });

  test('responsive text sizes are applied', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    });

    // Open leadership modal to check text responsiveness
    const contactsButton = screen.getByTitle('Leadership Contacts');
    fireEvent.click(contactsButton);

    await waitFor(() => {
      const modalHeader = document.querySelector('h2');
      expect(modalHeader).toBeInTheDocument();
    });

    const modalHeader = document.querySelector('h2');
    expect(modalHeader).toHaveClass('text-lg', 'sm:text-2xl');
    expect(modalHeader).toHaveClass('truncate'); // Ensures text doesn't overflow
  });

  test('loading state is mobile-optimized', async () => {
    render(<IntegratedKeralaMap />);
    
    // Check loading indicator
    const loadingText = screen.getByText('Loading Kerala Map');
    expect(loadingText).toBeInTheDocument();
    
    // Loading should have appropriate mobile styling
    const loadingContainer = loadingText.closest('.absolute');
    expect(loadingContainer).toHaveClass('inset-0');
  });

  test('error state is mobile-friendly', async () => {
    // Mock iframe error
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'iframe') {
        const iframe = originalCreateElement.call(document, tagName);
        setTimeout(() => {
          const errorEvent = new Event('error');
          iframe.dispatchEvent(errorEvent);
        }, 100);
        return iframe;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      const errorText = screen.getByText('Map Loading Error');
      expect(errorText).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toHaveClass('px-6', 'py-3'); // Touch-friendly padding
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });
});

describe('Mobile Detection Utility', () => {
  test('detects mobile devices correctly', () => {
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });

    const { detectMobile } = require('../utils/mobileDetection');
    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isMobile).toBe(true);
    expect(mobileInfo.screenSize).toBe('mobile');
  });

  test('detects touch capability', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: true
    });

    const { detectMobile } = require('../utils/mobileDetection');
    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isTouchDevice).toBe(true);
  });

  test('provides optimal modal configuration for mobile', () => {
    const { getOptimalModalSize } = require('../utils/mobileDetection');
    
    const mobileConfig = getOptimalModalSize({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
      screenSize: 'mobile',
      orientation: 'portrait'
    });
    
    expect(mobileConfig.maxWidth).toBe('95vw');
    expect(mobileConfig.maxHeight).toBe('95vh');
    expect(mobileConfig.padding).toBe('0.5rem');
  });
});