/**
 * Core Components Tests for Kerala Map Standalone
 * Simplified tests focusing on component rendering and basic interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { LoginPage } from '../components/LoginPage';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';

// Mock all external dependencies
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

vi.mock('../utils/whitelistCsv', () => ({
  loadWhitelistCsv: vi.fn().mockResolvedValue([])
}));

// Mock all data loading utilities
vi.mock('../utils/loadACData', () => ({
  loadACData: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: vi.fn().mockResolvedValue(),
  getACVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: vi.fn().mockResolvedValue(),
  getMandalVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: vi.fn().mockResolvedValue(),
  getLocalBodyVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: vi.fn().mockResolvedValue(),
  getOrgDistrictTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: vi.fn().mockResolvedValue(),
  getACTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: vi.fn().mockResolvedValue(),
  getMandalTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: vi.fn().mockResolvedValue([])
}));

vi.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: vi.fn().mockResolvedValue(),
  getMandalContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: vi.fn().mockResolvedValue(),
  getLocalBodyContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: vi.fn().mockResolvedValue(),
  getZoneTargetData: vi.fn().mockReturnValue([])
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form elements', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    expect(screen.getByText('Kerala Map Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('validates phone number input', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(loginButton);
    
    // Should show validation error for invalid phone number
    expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
  });

  test('validates password requirement', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(loginButton);
    
    // Should show validation error for missing password
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('shows loading state during authentication', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    fireEvent.click(loginButton);
    
    // Should show loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });
});

describe('IntegratedKeralaMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders map container and controls', () => {
    render(<IntegratedKeralaMap />);
    
    // Check for main container
    expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    
    // Check for control buttons
    expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
    expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<IntegratedKeralaMap />);
    
    expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we load the interactive map data')).toBeInTheDocument();
  });

  test('refresh button is clickable', () => {
    render(<IntegratedKeralaMap />);
    
    const refreshButton = screen.getByTitle('Refresh Map');
    expect(refreshButton).toBeInTheDocument();
    
    // Should not throw error when clicked
    fireEvent.click(refreshButton);
  });

  test('fullscreen button is clickable', () => {
    render(<IntegratedKeralaMap />);
    
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    expect(fullscreenButton).toBeInTheDocument();
    
    // Should not throw error when clicked
    fireEvent.click(fullscreenButton);
  });

  test('navigation buttons are present and clickable', () => {
    render(<IntegratedKeralaMap />);
    
    const contactsButton = screen.getByTitle('Leadership Contacts');
    const voteShareButton = screen.getByTitle('Vote Share Performance');
    const targetsButton = screen.getByTitle('Local Body Targets');
    
    expect(contactsButton).toBeInTheDocument();
    expect(voteShareButton).toBeInTheDocument();
    expect(targetsButton).toBeInTheDocument();
    
    // Should not throw errors when clicked
    fireEvent.click(contactsButton);
    fireEvent.click(voteShareButton);
    fireEvent.click(targetsButton);
  });

  test('has proper CSS classes for mobile responsiveness', () => {
    render(<IntegratedKeralaMap />);
    
    const container = screen.getByTitle('Kerala Interactive Map').closest('div');
    expect(container).toHaveClass('relative', 'w-full', 'bg-gradient-primary', 'h-full');
    
    // Check for touch-friendly classes on buttons
    const refreshButton = screen.getByTitle('Refresh Map');
    expect(refreshButton).toHaveClass('touch-target');
  });

  test('iframe has correct attributes', () => {
    render(<IntegratedKeralaMap />);
    
    const iframe = screen.getByTitle('Kerala Interactive Map');
    expect(iframe).toHaveAttribute('src', '/map/pan.html');
    expect(iframe).toHaveAttribute('allowfullscreen');
    expect(iframe).toHaveClass('w-full', 'h-full', 'border-none', 'touch-manipulation');
  });
});

describe('Component Integration', () => {
  test('components render without errors', () => {
    // Test that components can be rendered without throwing errors
    expect(() => {
      render(<LoginPage onLogin={vi.fn()} />);
    }).not.toThrow();
    
    expect(() => {
      render(<IntegratedKeralaMap />);
    }).not.toThrow();
  });

  test('components have proper accessibility attributes', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(loginButton).toHaveAttribute('type', 'submit');
  });

  test('map component has proper ARIA labels', () => {
    render(<IntegratedKeralaMap />);
    
    const iframe = screen.getByTitle('Kerala Interactive Map');
    expect(iframe).toHaveAttribute('title', 'Kerala Interactive Map');
    
    const refreshButton = screen.getByTitle('Refresh Map');
    expect(refreshButton).toHaveAttribute('title', 'Refresh Map');
    
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    expect(fullscreenButton).toHaveAttribute('title', 'Enter Fullscreen');
  });
});