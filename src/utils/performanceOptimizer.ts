/**
 * Performance optimization utilities for Kerala Map Standalone
 * Implements runtime performance monitoring and optimization strategies
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

/**
 * Performance observer for monitoring key metrics
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.observeNavigationTiming();
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      this.observeResourceTiming();
      this.observePaintTiming();
    }
  }

  private observeNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    }
  }

  private observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          // Track bundle loading performance
          console.debug(`Resource loaded: ${entry.name} in ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observePaintTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.renderTime = entry.startTime;
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    // Add memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }

    return { ...this.metrics };
  }

  /**
   * Clean up observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Lazy loading utility for components
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(async () => {
    const start = performance.now();
    const module = await importFn();
    const end = performance.now();
    
    console.debug(`Lazy component loaded in ${end - start}ms`);
    return module;
  });
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memory optimization utilities
 */
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cache = new Map<string, any>();
  private maxCacheSize = 50; // Maximum number of cached items

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  /**
   * Cache data with automatic cleanup
   */
  cache(key: string, data: any, ttl = 300000): void { // 5 minutes default TTL
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Retrieve cached data
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Clear expired cache items
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Bundle size analyzer for runtime monitoring
 */
export class BundleAnalyzer {
  /**
   * Estimate current bundle size from loaded resources
   */
  static estimateBundleSize(): number {
    let totalSize = 0;
    
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach((resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          // Estimate size from transfer size or encoded body size
          totalSize += resource.transferSize || resource.encodedBodySize || 0;
        }
      });
    }
    
    return totalSize;
  }

  /**
   * Monitor bundle loading performance
   */
  static monitorBundleLoading(): Promise<void> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let allBundlesLoaded = true;
          
          entries.forEach((entry) => {
            if (entry.name.includes('.js')) {
              console.debug(`Bundle loaded: ${entry.name} (${entry.duration}ms)`);
            }
          });
          
          // Check if all critical bundles are loaded
          const criticalBundles = ['vendor-react', 'app-components', 'app-utils'];
          const loadedBundles = entries.map(e => e.name);
          
          criticalBundles.forEach(bundle => {
            if (!loadedBundles.some(loaded => loaded.includes(bundle))) {
              allBundlesLoaded = false;
            }
          });
          
          if (allBundlesLoaded) {
            observer.disconnect();
            resolve();
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Performance optimization hooks for React components
 */
export function usePerformanceOptimization() {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});
  const monitor = React.useRef<PerformanceMonitor>();

  React.useEffect(() => {
    monitor.current = new PerformanceMonitor();
    
    const updateMetrics = () => {
      if (monitor.current) {
        setMetrics(monitor.current.getMetrics());
      }
    };
    
    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);
    
    return () => {
      clearInterval(interval);
      if (monitor.current) {
        monitor.current.disconnect();
      }
    };
  }, []);

  return metrics;
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

// Global memory optimizer instance
export const memoryOptimizer = MemoryOptimizer.getInstance();

// React import for hooks
import React from 'react';