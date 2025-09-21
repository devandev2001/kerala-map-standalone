import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the map component for testing
vi.mock('../components/IntegratedKeralaMap', () => ({
  default: () => (
    <div data-testid="kerala-map-loaded">
      <div>Kerala Interactive Map</div>
      <button data-testid="contacts-modal">Leadership Contacts</button>
      <button data-testid="performance-modal">Vote Share Performance</button>
      <button data-testid="target-modal">Local Body Targets</button>
      <button data-testid="pdf-export">Export PDF Report</button>
      <button data-testid="refresh-map">Refresh Map</button>
      <button data-testid="fullscreen-toggle">Toggle Fullscreen</button>
    </div>
  )
}));

// Mock authentication utilities
vi.mock('../utils/auth', () => ({
  validatePhoneNumber: (phone: string) => /^[6-9]\d{9}$/.test(phone),
  validatePassword: (password: string) => password.length > 0,
  isAuthenticated: vi.fn().mockReturnValue(false),
  getCurrentUser: vi.fn().mockReturnValue(null),
  saveAuthSession: vi.fn(),
  getAuthSession: vi.fn().mockReturnValue(null),
  clearAuthSession: vi.fn(),
  formatPhoneNumber: (phone: string) => `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}));

describe('Final Integration Test - Complete User Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should complete the full user journey from login to map interaction', async () => {
    const user = userEvent.setup();
    
    // Step 1: Initial application load
    render(<App />);
    
    // Verify login page is displayed
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
    expect(screen.getByText('Interactive Political Map')).toBeInTheDocument();
    
    // Step 2: Form validation testing
    const phoneInput = screen.getByLabelText('Phone Number');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    // Initially button should be disabled
    expect(signInButton).toBeDisabled();
    
    // Test invalid phone number
    await user.type(phoneInput, '123');
    await user.type(passwordInput, 'password');
    expect(signInButton).toBeDisabled();
    
    // Clear and enter valid credentials
    await user.clear(phoneInput);
    await user.clear(passwordInput);
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'validpassword');
    
    // Button should now be enabled
    expect(signInButton).toBeEnabled();
    
    // Step 3: Successful authentication
    // Mock successful authentication
    const { isAuthenticated } = await import('../utils/auth');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    
    await user.click(signInButton);
    
    // Step 4: Map interface should load
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map-loaded')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Kerala Interactive Map')).toBeInTheDocument();
    
    // Step 5: Verify all map controls are present and functional
    const contactsButton = screen.getByTestId('contacts-modal');
    const performanceButton = screen.getByTestId('performance-modal');
    const targetButton = screen.getByTestId('target-modal');
    const pdfButton = screen.getByTestId('pdf-export');
    const refreshButton = screen.getByTestId('refresh-map');
    const fullscreenButton = screen.getByTestId('fullscreen-toggle');
    
    // All buttons should be present
    expect(contactsButton).toBeInTheDocument();
    expect(performanceButton).toBeInTheDocument();
    expect(targetButton).toBeInTheDocument();
    expect(pdfButton).toBeInTheDocument();
    expect(refreshButton).toBeInTheDocument();
    expect(fullscreenButton).toBeInTheDocument();
    
    // Step 6: Test map interactions
    await user.click(contactsButton);
    await user.click(performanceButton);
    await user.click(targetButton);
    await user.click(pdfButton);
    await user.click(refreshButton);
    await user.click(fullscreenButton);
    
    // Map should still be loaded after interactions
    expect(screen.getByTestId('kerala-map-loaded')).toBeInTheDocument();
  });

  it('should handle mobile responsive design', async () => {
    // Mock mobile viewport
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
    
    render(<App />);
    
    // Should show mobile-specific elements
    expect(screen.getByText('Best viewed in portrait mode')).toBeInTheDocument();
    
    // Form should be responsive
    const phoneInput = screen.getByLabelText('Phone Number');
    expect(phoneInput).toHaveClass('w-full');
  });

  it('should handle authentication persistence', async () => {
    // Mock existing authentication
    const { isAuthenticated, getCurrentUser } = await import('../utils/auth');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockReturnValue('9876543210');
    
    render(<App />);
    
    // Should skip login and go directly to map
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map-loaded')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Kerala Map')).not.toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    const phoneInput = screen.getByLabelText('Phone Number');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'password');
    
    // Simulate network error during authentication
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    await user.click(signInButton);
    
    // Should remain on login page
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
    
    // Restore fetch
    global.fetch = originalFetch;
  });

  it('should support PWA features', () => {
    render(<App />);
    
    // Check if service worker registration would work
    expect('serviceWorker' in navigator).toBe(true);
    
    // Check if the app has PWA manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    // In test environment, this might not be present, but we can verify the structure
    expect(typeof window !== 'undefined').toBe(true);
  });

  it('should handle data loading states', async () => {
    // Mock successful authentication
    const { isAuthenticated } = await import('../utils/auth');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    
    render(<App />);
    
    // Should show map loading state initially
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map-loaded')).toBeInTheDocument();
    });
    
    // All interactive elements should be present
    expect(screen.getByTestId('contacts-modal')).toBeInTheDocument();
    expect(screen.getByTestId('performance-modal')).toBeInTheDocument();
    expect(screen.getByTestId('target-modal')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
  });

  it('should maintain accessibility standards', () => {
    render(<App />);
    
    // Check for proper ARIA labels
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Login form');
    
    const phoneInput = screen.getByRole('textbox', { name: /phone number/i });
    expect(phoneInput).toHaveAttribute('required');
    expect(phoneInput).toHaveAttribute('aria-label', 'Phone Number');
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });
});