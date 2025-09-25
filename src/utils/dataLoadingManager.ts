/**
 * Data Loading Manager
 * Centralized data loading with error handling, loading states, and caching
 */

import { parseCSV, cleanDataField, validateRequiredFields, parseNumeric, parsePercentage, formatPhoneNumber } from './csvParser';

export interface DataLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface DataLoadingResult<T> {
  data: T;
  errors: string[];
  warnings: string[];
}

export class DataLoadingManager {
  private loadingStates: Map<string, DataLoadingState> = new Map();
  private dataCache: Map<string, any> = new Map();
  private listeners: Map<string, Set<(state: DataLoadingState) => void>> = new Map();

  /**
   * Get loading state for a data source
   */
  getLoadingState(dataSource: string): DataLoadingState {
    return this.loadingStates.get(dataSource) || {
      isLoading: false,
      isLoaded: false,
      error: null,
      lastUpdated: null
    };
  }

  /**
   * Set loading state for a data source
   */
  private setLoadingState(dataSource: string, state: Partial<DataLoadingState>): void {
    const currentState = this.getLoadingState(dataSource);
    const newState = { ...currentState, ...state };
    
    this.loadingStates.set(dataSource, newState);
    
    // Notify listeners
    const listeners = this.listeners.get(dataSource);
    if (listeners) {
      listeners.forEach(listener => listener(newState));
    }
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(dataSource: string, listener: (state: DataLoadingState) => void): () => void {
    if (!this.listeners.has(dataSource)) {
      this.listeners.set(dataSource, new Set());
    }
    
    this.listeners.get(dataSource)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(dataSource);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Load CSV data with error handling
   */
  async loadCSVData<T>(
    dataSource: string,
    url: string,
    parser: (result: any) => T,
    options: {
      skipHeaderLines?: number;
      cacheKey?: string;
      retries?: number;
      timeout?: number;
    } = {}
  ): Promise<DataLoadingResult<T>> {
    const {
      skipHeaderLines = 0,
      cacheKey = dataSource,
      retries = 3,
      timeout = 30000
    } = options;

    // Check cache first
    if (this.dataCache.has(cacheKey)) {
      const cachedData = this.dataCache.get(cacheKey);
      this.setLoadingState(dataSource, {
        isLoading: false,
        isLoaded: true,
        error: null,
        lastUpdated: new Date()
      });
      
      return {
        data: cachedData,
        errors: [],
        warnings: ['Data loaded from cache']
      };
    }

    // Set loading state
    this.setLoadingState(dataSource, {
      isLoading: true,
      isLoaded: false,
      error: null,
      lastUpdated: null
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Loading ${dataSource} (attempt ${attempt}/${retries})...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        if (!csvText.trim()) {
          throw new Error('Empty CSV file received');
        }
        
        // Parse CSV
        const parseResult = parseCSV(csvText, {
          skipHeaderLines,
          skipEmptyLines: true,
          trimFields: true
        });
        
        if (parseResult.errors.length > 0) {
          errors.push(...parseResult.errors);
          warnings.push(`CSV parsing completed with ${parseResult.errors.length} errors`);
        }
        
        // Parse data using provided parser
        const data = parser(parseResult);
        
        // Cache the data
        this.dataCache.set(cacheKey, data);
        
        // Set success state
        this.setLoadingState(dataSource, {
          isLoading: false,
          isLoaded: true,
          error: null,
          lastUpdated: new Date()
        });
        
        console.log(`✅ ${dataSource} loaded successfully`);
        
        return {
          data,
          errors,
          warnings
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error loading ${dataSource} (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          // Final attempt failed
          this.setLoadingState(dataSource, {
            isLoading: false,
            isLoaded: false,
            error: errorMessage,
            lastUpdated: null
          });
          
          return {
            data: {} as T,
            errors: [`Failed to load ${dataSource} after ${retries} attempts: ${errorMessage}`],
            warnings: []
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    // This should never be reached, but TypeScript requires it
    return {
      data: {} as T,
      errors: [`Failed to load ${dataSource}`],
      warnings: []
    };
  }

  /**
   * Clear cache for a specific data source
   */
  clearCache(dataSource: string): void {
    this.dataCache.delete(dataSource);
    this.setLoadingState(dataSource, {
      isLoading: false,
      isLoaded: false,
      error: null,
      lastUpdated: null
    });
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.dataCache.clear();
    this.loadingStates.clear();
  }

  /**
   * Get cached data
   */
  getCachedData<T>(dataSource: string): T | null {
    return this.dataCache.get(dataSource) || null;
  }

  /**
   * Check if data is loaded
   */
  isDataLoaded(dataSource: string): boolean {
    const state = this.getLoadingState(dataSource);
    return state.isLoaded && !state.error;
  }

  /**
   * Get all loading states
   */
  getAllLoadingStates(): Record<string, DataLoadingState> {
    const states: Record<string, DataLoadingState> = {};
    for (const [key, state] of this.loadingStates) {
      states[key] = state;
    }
    return states;
  }
}

// Global instance
export const dataLoadingManager = new DataLoadingManager();

// Utility functions for common data loading patterns
export async function loadCSVWithRetry<T>(
  dataSource: string,
  url: string,
  parser: (result: any) => T,
  options?: {
    skipHeaderLines?: number;
    cacheKey?: string;
    retries?: number;
    timeout?: number;
  }
): Promise<DataLoadingResult<T>> {
  return dataLoadingManager.loadCSVData(dataSource, url, parser, options);
}

export const getLoadingState = (dataSource: string): DataLoadingState => {
  return dataLoadingManager.getLoadingState(dataSource);
};

export const subscribeToLoadingState = (
  dataSource: string,
  listener: (state: DataLoadingState) => void
): (() => void) => {
  return dataLoadingManager.subscribe(dataSource, listener);
};

export const clearDataCache = (dataSource: string): void => {
  dataLoadingManager.clearCache(dataSource);
};

export const clearAllDataCaches = (): void => {
  dataLoadingManager.clearAllCaches();
};
