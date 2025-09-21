/**
 * Cache Manager for Kerala Map Standalone PWA
 * Handles offline data caching and cache invalidation
 */

export interface CacheConfig {
  name: string;
  version: string;
  maxAge: number; // in milliseconds
  maxEntries: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, CacheConfig> = new Map();

  private constructor() {
    this.initializeCaches();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private initializeCaches(): void {
    // Define cache configurations
    this.caches.set('static', {
      name: 'kerala-map-static',
      version: '1.0.0',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 50
    });

    this.caches.set('map-data', {
      name: 'kerala-map-data',
      version: '1.0.0',
      maxAge: 60 * 60 * 1000, // 1 hour
      maxEntries: 100
    });

    this.caches.set('csv-data', {
      name: 'kerala-csv-data',
      version: '1.0.0',
      maxAge: 30 * 60 * 1000, // 30 minutes
      maxEntries: 50
    });
  }

  /**
   * Cache a response with metadata
   */
  public async cacheResponse(
    cacheType: string,
    request: Request | string,
    response: Response
  ): Promise<void> {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return;
    }

    const config = this.caches.get(cacheType);
    if (!config) {
      console.warn(`Cache type ${cacheType} not configured`);
      return;
    }

    try {
      const cache = await caches.open(`${config.name}-v${config.version}`);
      
      // Add metadata to response headers
      const responseWithMetadata = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'cache-timestamp': Date.now().toString(),
          'cache-type': cacheType,
          'cache-version': config.version
        }
      });

      await cache.put(request, responseWithMetadata);
      
      // Clean up old entries if needed
      await this.cleanupCache(config);
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  /**
   * Retrieve cached response if valid
   */
  public async getCachedResponse(
    cacheType: string,
    request: Request | string
  ): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }

    const config = this.caches.get(cacheType);
    if (!config) {
      return null;
    }

    try {
      const cache = await caches.open(`${config.name}-v${config.version}`);
      const response = await cache.match(request);

      if (!response) {
        return null;
      }

      // Check if cache is expired
      const timestamp = response.headers.get('cache-timestamp');
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age > config.maxAge) {
          // Cache expired, remove it
          await cache.delete(request);
          return null;
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to retrieve cached response:', error);
      return null;
    }
  }

  /**
   * Clean up old cache entries
   */
  private async cleanupCache(config: CacheConfig): Promise<void> {
    try {
      const cache = await caches.open(`${config.name}-v${config.version}`);
      const requests = await cache.keys();

      if (requests.length > config.maxEntries) {
        // Sort by timestamp and remove oldest entries
        const entries = await Promise.all(
          requests.map(async (request) => {
            const response = await cache.match(request);
            const timestamp = response?.headers.get('cache-timestamp') || '0';
            return { request, timestamp: parseInt(timestamp) };
          })
        );

        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = entries.slice(0, requests.length - config.maxEntries);

        await Promise.all(
          toDelete.map(({ request }) => cache.delete(request))
        );
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  public async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats(): Promise<Record<string, any>> {
    if (!('caches' in window)) {
      return {};
    }

    const stats: Record<string, any> = {};

    try {
      for (const [type, config] of this.caches.entries()) {
        const cache = await caches.open(`${config.name}-v${config.version}`);
        const requests = await cache.keys();
        
        stats[type] = {
          entries: requests.length,
          maxEntries: config.maxEntries,
          maxAge: config.maxAge,
          version: config.version
        };
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return stats;
  }

  /**
   * Preload critical resources
   */
  public async preloadCriticalResources(): Promise<void> {
    const criticalResources = [
      '/map/kerala_zones.geojson',
      '/csv/whitelist.csv',
      '/district_hierarchy_data.csv'
    ];

    const promises = criticalResources.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await this.cacheResponse('map-data', url, response.clone());
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();