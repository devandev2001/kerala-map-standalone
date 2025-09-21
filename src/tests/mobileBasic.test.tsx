/**
 * Basic Mobile Functionality Tests
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { detectMobile, getOptimalModalSize, getOptimalTableConfig } from '../utils/mobileDetection';

describe('Mobile Detection Utilities', () => {
  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  test('detects desktop correctly', () => {
    // Ensure desktop dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    
    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isDesktop).toBe(true);
    expect(mobileInfo.isMobile).toBe(false);
    expect(mobileInfo.screenSize).toBe('desktop');
  });

  test('detects mobile screen size', () => {
    // Set mobile dimensions
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

    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isMobile).toBe(true);
    expect(mobileInfo.screenSize).toBe('mobile');
  });

  test('detects tablet screen size', () => {
    // Set tablet dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isTablet).toBe(true);
    expect(mobileInfo.screenSize).toBe('tablet');
  });

  test('detects touch capability', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: true
    });

    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isTouchDevice).toBe(true);
  });

  test('provides optimal modal size for mobile', () => {
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
    expect(mobileConfig.borderRadius).toBe('0.75rem');
  });

  test('provides optimal modal size for tablet', () => {
    const tabletConfig = getOptimalModalSize({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isTouchDevice: true,
      screenSize: 'tablet',
      orientation: 'landscape'
    });
    
    expect(tabletConfig.maxWidth).toBe('90vw');
    expect(tabletConfig.maxHeight).toBe('90vh');
    expect(tabletConfig.padding).toBe('1rem');
    expect(tabletConfig.borderRadius).toBe('1rem');
  });

  test('provides optimal modal size for desktop', () => {
    const desktopConfig = getOptimalModalSize({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      screenSize: 'desktop',
      orientation: 'landscape'
    });
    
    expect(desktopConfig.maxWidth).toBe('80vw');
    expect(desktopConfig.maxHeight).toBe('90vh');
    expect(desktopConfig.padding).toBe('1.5rem');
    expect(desktopConfig.borderRadius).toBe('1.5rem');
  });

  test('provides optimal table config for mobile', () => {
    const mobileConfig = getOptimalTableConfig({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
      screenSize: 'mobile',
      orientation: 'portrait'
    });
    
    expect(mobileConfig.fontSize).toBe('0.7rem');
    expect(mobileConfig.headerFontSize).toBe('0.65rem');
    expect(mobileConfig.showAllColumns).toBe(false);
    expect(mobileConfig.stackOnMobile).toBe(true);
  });

  test('provides optimal table config for tablet', () => {
    const tabletConfig = getOptimalTableConfig({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isTouchDevice: true,
      screenSize: 'tablet',
      orientation: 'landscape'
    });
    
    expect(tabletConfig.fontSize).toBe('0.8rem');
    expect(tabletConfig.headerFontSize).toBe('0.75rem');
    expect(tabletConfig.showAllColumns).toBe(true);
    expect(tabletConfig.stackOnMobile).toBe(false);
  });

  test('provides optimal table config for desktop', () => {
    const desktopConfig = getOptimalTableConfig({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      screenSize: 'desktop',
      orientation: 'landscape'
    });
    
    expect(desktopConfig.fontSize).toBe('0.875rem');
    expect(desktopConfig.headerFontSize).toBe('0.875rem');
    expect(desktopConfig.showAllColumns).toBe(true);
    expect(desktopConfig.stackOnMobile).toBe(false);
  });

  test('detects orientation correctly', () => {
    // Portrait orientation
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

    let mobileInfo = detectMobile();
    expect(mobileInfo.orientation).toBe('portrait');

    // Landscape orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375,
    });

    mobileInfo = detectMobile();
    expect(mobileInfo.orientation).toBe('landscape');
  });
});