/**
 * Cache Management Utility for Kerala Map Standalone
 * Provides functions to manage browser cache and service worker cache
 */

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
    
    // Clear localStorage and sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🗑️ Local storage cleared');
    } catch (error) {
      console.warn('Could not clear local storage:', error);
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
 * Check if service worker is available and update it
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
 * Expose cache management functions globally for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).cacheManager = {
    clearAllCaches,
    forceReload,
    updateServiceWorker,
    getCacheInfo
  };
  
  console.log('🔧 Cache manager available at window.cacheManager');
}