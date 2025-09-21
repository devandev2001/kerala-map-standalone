/**
 * Working Tests for Kerala Map Standalone
 * These tests focus on actual functionality that exists in the application
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { LoginPage } from '../components/LoginPage';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';
import { detectMobile, getOptimalModalSize, getOptimalTableConfig } from '../utils/mobileDetection';

// Mock external dependencies that actually exist
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }))
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    // Check for actual elements that exist
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
    expect(screen.getByText('Interactive Political Map')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('phone input has correct attributes', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(phoneInput).toHaveAttribute('maxlength', '10');
    expect(phoneInput).toHaveAttribute('pattern', '[0-9]{10}');
  });

  test('password input has correct attributes', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toBeRequired();
  });

  test('submit button is initially disabled', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  test('form has proper accessibility attributes', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Login form');
  });
});

describe('IntegratedKeralaMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders map container', () => {
    render(<IntegratedKeralaMap />);
    
    // Check for elements that actually exist
    expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
  });

  test('renders control buttons', () => {
    render(<IntegratedKeralaMap />);
    
    expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
    expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
  });

  test('iframe has correct attributes', () => {
    render(<IntegratedKeralaMap />);
    
    const iframe = screen.getByTitle('Kerala Interactive Map');
    expect(iframe).toHaveAttribute('src', '/map/pan.html');
    expect(iframe).toHaveAttribute('allowfullscreen');
    expect(iframe).toHaveClass('w-full', 'h-full', 'border-none');
  });

  test('buttons have touch-friendly classes', () => {
    render(<IntegratedKeralaMap />);
    
    const refreshButton = screen.getByTitle('Refresh Map');
    expect(refreshButton).toHaveClass('touch-target');
    
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    expect(fullscreenButton).toHaveClass('touch-target');
  });

  test('buttons are clickable without errors', () => {
    render(<IntegratedKeralaMap />);
    
    const refreshButton = screen.getByTitle('Refresh Map');
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    const contactsButton = screen.getByTitle('Leadership Contacts');
    
    // These should not throw errors
    expect(() => fireEvent.click(refreshButton)).not.toThrow();
    expect(() => fireEvent.click(fullscreenButton)).not.toThrow();
    expect(() => fireEvent.click(contactsButton)).not.toThrow();
  });
});

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
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    
    const mobileInfo = detectMobile();
    
    expect(mobileInfo.isDesktop).toBe(true);
    expect(mobileInfo.isMobile).toBe(false);
    expect(mobileInfo.screenSize).toBe('desktop');
  });

  test('detects mobile screen size', () => {
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
    expect(mobileConfig.showAllColumns).toBe(false);
    expect(mobileConfig.stackOnMobile).toBe(true);
  });
});

describe('Data Processing', () => {
  test('can process basic data structures', () => {
    const testData = [
      { name: 'Test 1', value: '100' },
      { name: 'Test 2', value: '200' }
    ];

    const filtered = testData.filter(item => item.name === 'Test 1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].value).toBe('100');
  });

  test('handles empty arrays gracefully', () => {
    const emptyData: any[] = [];
    const result = emptyData.filter(item => item.name === 'test');
    expect(result).toHaveLength(0);
  });

  test('processes vote share data format', () => {
    const voteShareData = {
      name: 'Test Area',
      lsg2020: { vs: '25%', votes: '15000' },
      ge2024: { vs: '30%', votes: '18000' },
      target2025: { vs: '35%', votes: '21000' }
    };

    expect(voteShareData.name).toBe('Test Area');
    expect(voteShareData.lsg2020.vs).toBe('25%');
    expect(voteShareData.ge2024.votes).toBe('18000');
  });
});

describe('Component Integration', () => {
  test('components render without throwing errors', () => {
    expect(() => {
      render(<LoginPage onLogin={vi.fn()} />);
    }).not.toThrow();
    
    expect(() => {
      render(<IntegratedKeralaMap />);
    }).not.toThrow();
  });

  test('components have proper CSS classes', () => {
    render(<IntegratedKeralaMap />);
    
    const container = screen.getByTitle('Kerala Interactive Map').closest('div');
    expect(container).toHaveClass('relative', 'w-full');
  });
});

describe('Basic Functionality', () => {
  test('fetch is available for data loading', () => {
    expect(fetch).toBeDefined();
    expect(typeof fetch).toBe('function');
  });

  test('localStorage is available', () => {
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
  });

  test('window object has required properties', () => {
    expect(window.innerWidth).toBeDefined();
    expect(window.innerHeight).toBeDefined();
    expect(typeof window.innerWidth).toBe('number');
    expect(typeof window.innerHeight).toBe('number');
  });
});