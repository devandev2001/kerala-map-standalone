import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { env, logEnvironmentInfo, validateEnvironment } from './utils/env';
import './utils/cacheManager'; // Import cache manager for global access

// Log environment information and validate configuration
try {
  validateEnvironment();
  logEnvironmentInfo();
  
  if (env.isDevelopment) {
    console.log('🔧 Kerala Map Standalone - Development Mode');
  } else {
    console.log('🚀 Kerala Map Standalone - Production Mode');
    console.log('📦 Version:', env.APP_VERSION);
    console.log('🏗️ Build Time:', env.BUILD_TIME);
  }
} catch (error) {
  console.error('❌ Environment validation failed:', error);
}

// Global error handling for better debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  if (env.isDevelopment || env.debugMode) {
    console.error('📍 Error Details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  if (env.isDevelopment || env.debugMode) {
    console.error('📍 Promise Rejection Details:', event);
  }
  // Prevent the default browser behavior in development
  if (env.isDevelopment) {
    event.preventDefault();
  }
});

// Service Worker registration for PWA functionality
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('🔄 New Service Worker installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('🆕 New version available');
              
              // Show update notification in production
              if (env.isProduction) {
                const shouldUpdate = confirm('A new version is available. Refresh to update?');
                if (shouldUpdate) {
                  // Clear any existing caches before reload
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
                }
              } else {
                // Auto-refresh in development with cache clearing
                console.log('🔄 Auto-refreshing in development mode...');
                setTimeout(() => {
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
                }, 1000);
              }
            } else {
              // First time install
              console.log('✅ App ready for offline use');
            }
          }
        });
      }
    });

    // Periodic update checks (only in production)
    if (env.isProduction) {
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      }, 60000); // Check every minute in production
    } else {
      // More frequent checks in development
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      }, 10000); // Check every 10 seconds in development
    }

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('📦 Cache updated by Service Worker');
      }
    });

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

// PWA install prompt handling
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('📱 PWA install prompt available');
  event.preventDefault();
  deferredPrompt = event;
  
  // Show custom install button or notification
  if (env.isDevelopment || env.debugMode) {
    console.log('💡 PWA can be installed - prompt deferred');
  }
});

// Handle PWA installation
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  deferredPrompt = null;
});

// Expose PWA install function globally for components to use
(window as any).installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
};

// Initialize the application
const initializeApp = async () => {
  try {
    // Register service worker when enabled
    if (env.enableServiceWorker) {
      await registerServiceWorker();
    } else {
      console.log('🔧 Service Worker disabled in development mode');
    }

    // Performance monitoring
    if (env.enablePerformanceMonitoring && 'performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        console.log('📊 App Load Performance:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
      });
    }

    // Render the React application
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log('✅ Kerala Map Standalone initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Show error message to user
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #1F2937;
          color: white;
          font-family: system-ui, sans-serif;
          text-align: center;
          padding: 2rem;
        ">
          <h1 style="color: #F97316; margin-bottom: 1rem;">Application Error</h1>
          <p style="margin-bottom: 1rem;">Failed to initialize the Kerala Map application.</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #F97316;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Retry
          </button>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();