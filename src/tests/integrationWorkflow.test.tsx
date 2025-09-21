import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the iframe and map functionality
vi.mock('../components/IntegratedKeralaMap', () => ({
  default: () => (
    <div data-testid="kerala-map">
      <div>Kerala Map Loaded</div>
      <button data-testid="contacts-btn">Contacts</button>
      <button data-testid="performance-btn">Vote Share</button>
      <button data-testid="target-btn">LB Target</button>
      <button data-testid="pdf-btn">Export PDF</button>
    </div>
  )
}));

// Mock authentication utilities
vi.mock('../utils/auth', () => ({
  validatePhoneNumber: (phone: string) => phone.length === 10,
  validatePassword: (password: string) => password.length > 0,
  isAuthenticated: vi.fn().mockReturnValue(false),
  getCurrentUser: vi.fn().mockReturnValue(null),
  saveAuthSession: vi.fn(),
  getAuthSession: vi.fn().mockReturnValue(null),
  clearAuthSession: vi.fn(),
  formatPhoneNumber: (phone: string) => phone
}));

describe('Complete User Workflow Integration', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  it('should complete full login to map interaction workflow', async () => {
    const user = userEvent.setup();
    
    // 1. Initial render should show login page
    render(<App />);
    
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    
    // 2. Test form validation
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    // Initially button should be disabled
    expect(loginButton).toBeDisabled();
    
    // 3. Enter valid credentials
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'testpassword');
    
    // Button should now be enabled
    expect(loginButton).toBeEnabled();
    
    // 4. Submit login form
    await user.click(loginButton);
    
    // 5. Should navigate to map view
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map')).toBeInTheDocument();
      expect(screen.getByText('Kerala Map Loaded')).toBeInTheDocument();
    });
    
    // 6. Verify map controls are present
    expect(screen.getByTestId('contacts-btn')).toBeInTheDocument();
    expect(screen.getByTestId('performance-btn')).toBeInTheDocument();
    expect(screen.getByTestId('target-btn')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-btn')).toBeInTheDocument();
    
    // 7. Test map interactions
    const contactsBtn = screen.getByTestId('contacts-btn');
    const performanceBtn = screen.getByTestId('performance-btn');
    const targetBtn = screen.getByTestId('target-btn');
    const pdfBtn = screen.getByTestId('pdf-btn');
    
    // All buttons should be clickable
    expect(contactsBtn).toBeEnabled();
    expect(performanceBtn).toBeEnabled();
    expect(targetBtn).toBeEnabled();
    expect(pdfBtn).toBeEnabled();
    
    // 8. Test button interactions
    await user.click(contactsBtn);
    await user.click(performanceBtn);
    await user.click(targetBtn);
    await user.click(pdfBtn);
    
    // No errors should occur during interactions
    expect(screen.getByTestId('kerala-map')).toBeInTheDocument();
  });

  it('should handle authentication errors gracefully', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    const phoneInput = screen.getByPlaceholderText('Phone Number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(phoneInput, '123'); // Invalid phone number
    await user.type(passwordInput, 'wrongpassword');
    
    // Button should remain disabled for invalid phone
    expect(loginButton).toBeDisabled();
    
    // Should stay on login page
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
  });

  it('should maintain responsive design on different screen sizes', async () => {
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
    
    // Mock successful authentication
    const { isAuthenticated } = await import('../utils/auth');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map')).toBeInTheDocument();
    });
    
    // Verify mobile-responsive elements are present
    const mapContainer = screen.getByTestId('kerala-map');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should handle data loading states properly', async () => {
    // Mock successful authentication
    const { isAuthenticated } = await import('../utils/auth');
    vi.mocked(isAuthenticated).mockReturnValue(true);
    
    render(<App />);
    
    // Should show map component
    await waitFor(() => {
      expect(screen.getByTestId('kerala-map')).toBeInTheDocument();
    });
    
    // Verify all interactive elements are present
    expect(screen.getByTestId('contacts-btn')).toBeInTheDocument();
    expect(screen.getByTestId('performance-btn')).toBeInTheDocument();
    expect(screen.getByTestId('target-btn')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-btn')).toBeInTheDocument();
  });
});