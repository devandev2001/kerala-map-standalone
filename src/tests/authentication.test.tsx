/**
 * Authentication Flow Tests for Kerala Map Standalone
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import LoginPage from '../components/LoginPage';
import App from '../App';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
};

// Mock the supabase client module
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock CSV whitelist loader
vi.mock('../utils/whitelistCsv', () => ({
  loadWhitelistCsv: vi.fn().mockResolvedValue([
    { phone: '9876543210', password: 'test123' },
    { phone: '9876543211', password: 'admin123' }
  ])
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders login form correctly', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    
    expect(screen.getByText('Kerala Map Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Test invalid phone number
    await user.type(phoneInput, '123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
    });
  });

  test('validates password requirement', async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Test missing password
    await user.type(phoneInput, '9876543210');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('successful Supabase authentication', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', phone: '9876543210' } },
      error: null
    });
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'test123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        phone: '+919876543210',
        password: 'test123'
      });
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test('fallback to CSV whitelist authentication', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    
    // Mock Supabase failure
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'test123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  test('handles authentication failure', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    
    // Mock both Supabase and CSV failures
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });
    
    vi.mocked(require('../utils/whitelistCsv').loadWhitelistCsv).mockResolvedValue([
      { phone: '9876543211', password: 'different123' }
    ]);
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'wrong123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid phone number or password')).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  test('shows loading state during authentication', async () => {
    const user = userEvent.setup();
    
    // Mock slow authentication
    mockSupabaseClient.auth.signInWithPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: { user: { id: '123' } },
        error: null
      }), 1000))
    );
    
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'test123');
    await user.click(loginButton);
    
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  test('remembers login state', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', phone: '9876543210' } },
      error: null
    });
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(phoneInput, '9876543210');
    await user.type(passwordInput, 'test123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isAuthenticated', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userPhone', '9876543210');
    });
  });
});

describe('App Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('shows login page when not authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('Kerala Map Login')).toBeInTheDocument();
  });

  test('shows map when authenticated', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'isAuthenticated') return 'true';
      if (key === 'userPhone') return '9876543210';
      return null;
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
  });

  test('handles logout correctly', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'isAuthenticated') return 'true';
      if (key === 'userPhone') return '9876543210';
      return null;
    });
    
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Simulate logout (this would be triggered by a logout button in the actual app)
    fireEvent.click(screen.getByTitle('Logout'));
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('isAuthenticated');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userPhone');
      expect(screen.getByText('Kerala Map Login')).toBeInTheDocument();
    });
  });

  test('handles session restoration on app load', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: '123', phone: '9876543210' } } },
      error: null
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
  });

  test('handles authentication state changes', async () => {
    let authCallback: Function;
    
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    
    render(<App />);
    
    // Simulate authentication state change
    authCallback('SIGNED_IN', { user: { id: '123', phone: '9876543210' } });
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Simulate sign out
    authCallback('SIGNED_OUT', null);
    
    await waitFor(() => {
      expect(screen.getByText('Kerala Map Login')).toBeInTheDocument();
    });
  });
});

describe('Authentication Security', () => {
  test('sanitizes phone number input', async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    
    // Test input sanitization
    await user.type(phoneInput, '98-765-43210');
    expect(phoneInput).toHaveValue('9876543210');
    
    await user.clear(phoneInput);
    await user.type(phoneInput, '+91 98765 43210');
    expect(phoneInput).toHaveValue('9876543210');
  });

  test('prevents SQL injection in phone number', async () => {
    const user = userEvent.setup();
    render(<LoginPage onLogin={vi.fn()} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    
    // Test malicious input
    await user.type(phoneInput, "'; DROP TABLE users; --");
    expect(phoneInput).toHaveValue('');
  });

  test('limits login attempts', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' }
    });
    
    vi.mocked(require('../utils/whitelistCsv').loadWhitelistCsv).mockResolvedValue([]);
    
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const phoneInput = screen.getByPlaceholderText('Enter phone number');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await user.clear(phoneInput);
      await user.clear(passwordInput);
      await user.type(phoneInput, '9876543210');
      await user.type(passwordInput, 'wrong123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid phone number or password')).toBeInTheDocument();
      });
    }
    
    // Should show rate limiting message after 5 attempts
    await waitFor(() => {
      expect(screen.getByText(/too many failed attempts/i)).toBeInTheDocument();
    });
  });
});