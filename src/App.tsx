import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import IntegratedKeralaMap from './components/IntegratedKeralaMap';
import { isAuthenticated, getCurrentUser, getCurrentUserName, clearAuthSession } from './utils/auth';
import { LogOut, User, AlertTriangle, RotateCcw, Maximize2 } from 'lucide-react';

// Error Boundary Component for graceful error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/20">
            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-red-200 mb-6">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication status on app initialization
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        const userName = getCurrentUserName();
        
        setIsLoggedIn(authenticated);
        setCurrentUser(user);
        setCurrentUserName(userName);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // Clear potentially corrupted session
        clearAuthSession();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setCurrentUserName(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        console.warn('⚠️ App initialization timeout - forcing completion');
        setIsInitializing(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle global keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault();
            // Handle PDF export if logged in
            if (isLoggedIn) {
              const exportButton = document.querySelector('[title="Export PDF Report"]') as HTMLButtonElement;
              if (exportButton) {
                exportButton.click();
              }
            }
            break;
          case 'h':
            event.preventDefault();
            // Handle help modal if logged in
            if (isLoggedIn) {
              const helpButton = document.querySelector('[title="Help & Instructions"]') as HTMLButtonElement;
              if (helpButton) {
                helpButton.click();
              }
            }
            break;
        }
      }

      // Handle Escape key to close modals
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1];
          const closeButton = lastModal.querySelector('[aria-label*="close"], [title*="Close"]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }

      // Handle F11 for fullscreen toggle
      if (event.key === 'F11') {
        event.preventDefault();
        const fullscreenButton = document.querySelector('[title*="fullscreen"], [title*="Fullscreen"]') as HTMLButtonElement;
        if (fullscreenButton) {
          fullscreenButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  // Handle successful login
  const handleLogin = (phoneNumber: string, fullName?: string) => {
    setIsLoggedIn(true);
    setCurrentUser(phoneNumber);
    setCurrentUserName(fullName || null);
  };

  // Handle logout
  const handleLogout = () => {
    try {
      clearAuthSession();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setCurrentUserName(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setIsLoggedIn(false);
      setCurrentUser(null);
      setCurrentUserName(null);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Kerala Map...</p>
          <p className="text-white/70 text-sm mt-2">If this takes too long, try refreshing the page</p>
          <button
            onClick={() => {
              // Clear caches and reload if loading takes too long
              if ('caches' in window) {
                caches.keys().then(cacheNames => {
                  return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                  );
                }).then(() => {
                  window.location.reload();
                });
              } else {
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
          >
            Force Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {!isLoggedIn ? (
          // Show login page if not authenticated
          <LoginPage onLogin={handleLogin} />
        ) : (
          // Show map application if authenticated
          <div className="relative w-full h-screen overflow-hidden">
            {/* New Header Design - Top Section */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50">
              <div className="flex items-center justify-between px-6 py-4">
                {/* Left side - User info */}
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-700/50 rounded-lg px-4 py-2 flex items-center space-x-3 border border-slate-600/50">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="text-white">
                      <div className="text-sm font-medium">
                        {currentUserName || 'User'}
                      </div>
                      <div className="text-xs text-slate-300">
                        {currentUser ? `+91 ${currentUser}` : '+91 9745895354'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-600"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-700/50"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>

                {/* Center - BJP Logo and Mission */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">BJP</span>
                  </div>
                  <div className="text-white">
                    <div className="text-lg font-semibold">BJP Mission 2025</div>
                  </div>
                </div>

                {/* Right side - Empty space for balance */}
                <div className="w-48"></div>
              </div>
            </div>

            {/* Navigation Bar - Second Section */}
            <div className="absolute top-20 left-0 right-0 z-40 bg-slate-700/95 backdrop-blur-md border-b border-slate-600/50">
              <div className="flex items-center justify-between px-6 py-3">
                {/* Left side - Control buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={async () => {
                      const container = document.getElementById('integrated-map-container');
                      if (!container) return;

                      try {
                        if (!document.fullscreenElement) {
                          await container.requestFullscreen();
                        } else {
                          await document.exitFullscreen();
                        }
                      } catch (error) {
                        console.error('Fullscreen error:', error);
                      }
                    }}
                    className="w-10 h-10 bg-slate-600/80 hover:bg-slate-500/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => {
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    className="w-10 h-10 bg-slate-600/80 hover:bg-slate-500/80 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    title="Refresh Map"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                {/* Center - Action buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      // Trigger performance modal directly
                      const event = new CustomEvent('show-performance-modal');
                      window.dispatchEvent(event);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-all duration-200"
                    title="Performance"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"></path>
                      <path d="m19 9-5 5-4-4-3 3"></path>
                    </svg>
                    <span className="text-sm font-medium">Performance</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Trigger targets modal directly
                      const event = new CustomEvent('show-target-modal');
                      window.dispatchEvent(event);
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center space-x-2 transition-all duration-200"
                    title="Targets"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                    <span className="text-sm font-medium">Targets</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Trigger contacts modal directly
                      const event = new CustomEvent('show-contacts-modal');
                      window.dispatchEvent(event);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-all duration-200"
                    title="Contacts"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="m22 21-3-3m0 0a2 2 0 1 0-2.828-2.828A2 2 0 0 0 19 18Z"></path>
                    </svg>
                    <span className="text-sm font-medium">Contacts</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Trigger PDF export directly
                      const event = new CustomEvent('export-pdf');
                      window.dispatchEvent(event);
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg flex items-center space-x-2 transition-all duration-200"
                    title="Export"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7,10 12,15 17,10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>

                {/* Right side - Empty for now, can add more controls later */}
                <div className="w-24"></div>
              </div>
            </div>

            {/* Main Map Component - Adjusted for header */}
            <div className="w-full h-full">
              <IntegratedKeralaMap />
            </div>

            {/* Progress Bar at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-30">
              <div className="h-1 bg-blue-500"></div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;