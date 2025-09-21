/**
 * Mobile device detection and optimization utilities
 */

import React from 'react';

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

/**
 * Detect if the current device is mobile
 */
export const detectMobile = (): MobileInfo => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       (navigator as any).msMaxTouchPoints > 0;
  
  // Mobile detection patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];
  
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Screen size based detection
  const isMobileScreen = width <= 640;
  const isTabletScreen = width > 640 && width <= 1024;
  const isDesktopScreen = width > 1024;
  
  // Combined mobile detection
  const isMobile = isMobileUA || isMobileScreen;
  const isTablet = !isMobile && (isTabletScreen || (isTouchDevice && width <= 1024));
  const isDesktop = !isMobile && !isTablet;
  
  // Screen size category
  let screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) screenSize = 'mobile';
  else if (isTablet) screenSize = 'tablet';
  
  // Orientation
  const orientation = height > width ? 'portrait' : 'landscape';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    screenSize,
    orientation
  };
};

/**
 * Hook to get mobile device information with reactive updates
 */
export const useMobileDetection = () => {
  const [mobileInfo, setMobileInfo] = React.useState<MobileInfo>(() => detectMobile());
  
  React.useEffect(() => {
    const handleResize = () => {
      setMobileInfo(detectMobile());
    };
    
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(() => {
        setMobileInfo(detectMobile());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return mobileInfo;
};

/**
 * Optimize touch interactions for mobile devices
 */
export const optimizeTouchInteractions = () => {
  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Prevent context menu on long press
  document.addEventListener('contextmenu', (event) => {
    if ('ontouchstart' in window) {
      event.preventDefault();
    }
  });
  
  // Optimize scroll performance
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
};

/**
 * Get optimal modal size for current device
 */
export const getOptimalModalSize = (mobileInfo: MobileInfo) => {
  if (mobileInfo.isMobile) {
    return {
      maxWidth: '95vw',
      maxHeight: '95vh',
      padding: '0.5rem',
      borderRadius: '0.75rem'
    };
  } else if (mobileInfo.isTablet) {
    return {
      maxWidth: '90vw',
      maxHeight: '90vh',
      padding: '1rem',
      borderRadius: '1rem'
    };
  } else {
    return {
      maxWidth: '80vw',
      maxHeight: '90vh',
      padding: '1.5rem',
      borderRadius: '1.5rem'
    };
  }
};

/**
 * Get optimal table configuration for current device
 */
export const getOptimalTableConfig = (mobileInfo: MobileInfo) => {
  if (mobileInfo.isMobile) {
    return {
      fontSize: '0.7rem',
      padding: '0.375rem 0.25rem',
      headerFontSize: '0.65rem',
      showAllColumns: false,
      stackOnMobile: true
    };
  } else if (mobileInfo.isTablet) {
    return {
      fontSize: '0.8rem',
      padding: '0.5rem 0.375rem',
      headerFontSize: '0.75rem',
      showAllColumns: true,
      stackOnMobile: false
    };
  } else {
    return {
      fontSize: '0.875rem',
      padding: '0.75rem 0.5rem',
      headerFontSize: '0.875rem',
      showAllColumns: true,
      stackOnMobile: false
    };
  }
};

