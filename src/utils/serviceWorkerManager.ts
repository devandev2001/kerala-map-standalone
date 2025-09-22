/**
 * Service Worker Manager for Kerala Map Standalone
 * Handles service worker registration, cache management, and automatic cache clearing
 */

// App version for cache versioning
const APP_VERSION = '1.0.0';
const CACHE_VERSION_KEY = 'kerala-map-cache-version';

/**
 * Initialize cache management system
 */
export const initializeCacheManagement = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing cache management...');
    
    // Check if we need to clear caches due to version change
    const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (currentVersion !== APP_VERSION) {
      console.log(`🔄 App version changed from ${currentVersion} to ${APP_VERSION}, clearing caches...`);
      await clearAllCaches();
      localStorage.setItem(CACHE_VERSION_KEY, APP_VERSION);
    }
    
    // Set up periodic cache cleanup
    setupPeriodicCacheCleanup();
    
    console.log('✅ Cache management initialized');
  } catch (error) {
    console.error('❌ Error initializing cache management:', error);
  }
};

/**
 * Register service worker with proper cache management
 */
export const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported');
    return;
  }

  try {
    console.log('🔧 Registering service worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration);

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      console.log('🔄 Service Worker update found');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New service worker installed, clearing caches and reloading...');
            // Clear caches and reload when new service worker is ready
            clearAllCaches().then(() => {
              window.location.reload();
            });
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('📦 Cache updated by service worker');
        // Optionally trigger a UI update or notification
      }
    });

    // Handle service worker errors
    registration.addEventListener('error', (error) => {
      console.error('❌ Service Worker registration error:', error);
    });

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
};

/**
 * Clear all browser caches
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing all caches...');
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    // Clear browser storage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        await navigator.storage.clear();
        console.log('🗑️ Browser storage cleared');
      } catch (error) {
        console.warn('Could not clear browser storage:', error);
      }
    }
    
    // Clear localStorage and sessionStorage (except version key)
    try {
      const versionKey = localStorage.getItem(CACHE_VERSION_KEY);
      localStorage.clear();
      sessionStorage.clear();
      if (versionKey) {
        localStorage.setItem(CACHE_VERSION_KEY, versionKey);
      }
      console.log('🗑️ Local storage cleared');
    } catch (error) {
      console.warn('Could not clear local storage:', error);
    }
    
    // Send message to service worker to clear its caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    throw error;
  }
};

/**
 * Force reload the page with cache clearing
 */
export const forceReload = async (): Promise<void> => {
  try {
    await clearAllCaches();
    window.location.reload();
  } catch (error) {
    console.error('❌ Error during force reload:', error);
    // Fallback to simple reload
    window.location.reload();
  }
};

/**
 * Update service worker
 */
export const updateServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('🔄 Updating service worker...');
      await registration.update();
      console.log('✅ Service worker updated');
    } else {
      console.log('ℹ️ No service worker registered');
    }
  } catch (error) {
    console.error('❌ Error updating service worker:', error);
  }
};

/**
 * Get cache information
 */
export const getCacheInfo = async (): Promise<{
  cacheNames: string[];
  totalSize: number;
  storageEstimate?: StorageEstimate;
}> => {
  const result = {
    cacheNames: [],
    totalSize: 0,
    storageEstimate: undefined as StorageEstimate | undefined
  };
  
  try {
    // Get cache names
    if ('caches' in window) {
      result.cacheNames = await caches.keys();
    }
    
    // Get storage estimate
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      result.storageEstimate = await navigator.storage.estimate();
    }
    
    console.log('📊 Cache info:', result);
  } catch (error) {
    console.error('❌ Error getting cache info:', error);
  }
  
  return result;
};

/**
 * Setup periodic cache cleanup
 */
const setupPeriodicCacheCleanup = (): void => {
  // Clear caches every 24 hours
  const CACHE_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  setInterval(async () => {
    try {
      console.log('🕐 Running periodic cache cleanup...');
      await clearExpiredCaches();
    } catch (error) {
      console.error('❌ Error during periodic cache cleanup:', error);
    }
  }, CACHE_CLEANUP_INTERVAL);
};

/**
 * Clear only expired caches (not all caches)
 */
const clearExpiredCaches = async (): Promise<void> => {
  try {
    if (!('caches' in window)) return;
    
    const cacheNames = await caches.keys();
    const currentTime = Date.now();
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const cachedTime = response.headers.get('sw-cached-time');
          if (cachedTime) {
            const age = currentTime - parseInt(cachedTime);
            if (age > CACHE_EXPIRY) {
              console.log('🗑️ Removing expired cache entry:', request.url);
              await cache.delete(request);
            }
          }
        }
      }
    }
    
    console.log('✅ Expired caches cleared');
  } catch (error) {
    console.error('❌ Error clearing expired caches:', error);
  }
};

/**
 * Expose cache management functions globally for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).cacheManager = {
    clearAllCaches,
    forceReload,
    updateServiceWorker,
    getCacheInfo,
    clearExpiredCaches
  };
  
  console.log('🔧 Cache manager available at window.cacheManager');
}
