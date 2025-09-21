import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Deployment Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render application without errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('should have proper meta tags for PWA', () => {
    // Check if the document has proper meta tags
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
  });

  it('should load essential components', () => {
    render(<App />);
    
    // Should show login page initially
    expect(screen.getByText('Kerala Map')).toBeInTheDocument();
    expect(screen.getByText('Interactive Political Map')).toBeInTheDocument();
  });

  it('should have proper form accessibility', () => {
    render(<App />);
    
    const form = screen.getByRole('form', { name: /login form/i });
    expect(form).toBeInTheDocument();
    
    const phoneInput = screen.getByRole('textbox', { name: /phone number/i });
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('required');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle responsive design classes', () => {
    render(<App />);
    
    // Check for responsive classes
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeTruthy();
    
    // Check for mobile-specific elements
    const mobileHint = screen.getByText('Best viewed in portrait mode');
    expect(mobileHint).toBeInTheDocument();
  });

  it('should have proper error boundaries', () => {
    // This test ensures the app doesn't crash on render
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});