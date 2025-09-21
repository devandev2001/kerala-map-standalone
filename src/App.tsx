import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import IntegratedKeralaMap from './components/IntegratedKeralaMap';
import { isAuthenticated, getCurrentUser, clearAuthSession } from './utils/auth';
import { LogOut, User, AlertTriangle } from 'lucide-react';

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
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication status on app initialization
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        
        setIsLoggedIn(authenticated);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // Clear potentially corrupted session
        clearAuthSession();
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle successful login
  const handleLogin = (phoneNumber: string) => {
    setIsLoggedIn(true);
    setCurrentUser(phoneNumber);
  };

  // Handle logout
  const handleLogout = () => {
    try {
      clearAuthSession();
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Kerala Map...</p>
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
          <div className="relative min-h-screen">
            {/* Header with user info and logout - minimal design */}
            <div className="absolute top-0 right-0 z-50 p-4">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center space-x-3 border border-white/20">
                <div className="flex items-center space-x-2 text-white">
                  <User size={16} />
                  <span className="text-sm font-medium">
                    {currentUser ? `+91 ${currentUser}` : 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-white/10"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Main Map Component - Full Screen */}
            <div className="w-full h-screen">
              <IntegratedKeralaMap />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;