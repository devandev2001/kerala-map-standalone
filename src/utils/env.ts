/**
 * Environment configuration utility for Kerala Map Standalone
 * Provides centralized access to environment variables and build-time constants
 */

// Build-time constants (defined in vite.config.ts)
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

export const env = {
  // Application info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Kerala Map Standalone',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || __APP_VERSION__ || '1.0.0',
  BUILD_TIME: __BUILD_TIME__ || new Date().toISOString(),
  
  // Environment flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  
  // Feature flags
  enableServiceWorker: import.meta.env.VITE_ENABLE_SW === 'true' || import.meta.env.PROD,
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' && import.meta.env.DEV,
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Cache Configuration
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'), // 5 minutes default
  
  // Map Configuration
  defaultMapZoom: parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '7'),
  mapCenterLat: parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || '10.8505'),
  mapCenterLng: parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || '76.2711'),
} as const;

/**
 * Get environment-specific configuration
 */
export const getConfig = () => {
  return {
    ...env,
    // Computed values
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isSecureContext: window.isSecureContext,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
  };
};

/**
 * Log environment information (development only)
 */
export const logEnvironmentInfo = () => {
  if (env.isDevelopment || env.debugMode) {
    console.group('🔧 Environment Configuration');
    console.log('📱 App Name:', env.APP_NAME);
    console.log('📦 Version:', env.APP_VERSION);
    console.log('🏗️ Build Time:', env.BUILD_TIME);
    console.log('🌍 Mode:', env.mode);
    console.log('📍 Base URL:', env.baseUrl);
    console.log('🔧 Debug Mode:', env.debugMode);
    console.log('⚙️ Service Worker:', env.enableServiceWorker);
    console.log('📊 Performance Monitoring:', env.enablePerformanceMonitoring);
    console.groupEnd();
  }
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  // Add validation for required environment variables here
  // Example:
  // if (env.isProduction && !env.apiBaseUrl) {
  //   errors.push('VITE_API_BASE_URL is required in production');
  // }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

export default env;