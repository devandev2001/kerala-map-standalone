// Authentication utilities for session management

export interface AuthSession {
  phoneNumber: string;
  fullName?: string;
  loginTime: number;
  isAuthenticated: boolean;
}

const SESSION_KEY = 'kerala-map-auth-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save authentication session to localStorage
 */
export function saveAuthSession(phoneNumber: string, fullName?: string): void {
  const session: AuthSession = {
    phoneNumber,
    fullName,
    loginTime: Date.now(),
    isAuthenticated: true
  };
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save auth session:', error);
  }
}

/**
 * Get current authentication session from localStorage
 */
export function getAuthSession(): AuthSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    const session: AuthSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() - session.loginTime > SESSION_DURATION) {
      clearAuthSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get auth session:', error);
    clearAuthSession();
    return null;
  }
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  const session = getAuthSession();
  return session?.isAuthenticated === true;
}

/**
 * Get current user's phone number
 */
export function getCurrentUser(): string | null {
  const session = getAuthSession();
  return session?.phoneNumber || null;
}

/**
 * Get current user's full name
 */
export function getCurrentUserName(): string | null {
  const session = getAuthSession();
  return session?.fullName || null;
}

/**
 * Clear authentication session (logout)
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear auth session:', error);
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Validate password (basic validation)
 */
export function validatePassword(password: string): boolean {
  return password.trim().length > 0;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length === 10) {
    return `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  }
  return phoneNumber;
}