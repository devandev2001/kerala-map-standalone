/**
 * Build optimization configuration for Kerala Map Standalone
 * Implements advanced build optimizations for production deployment
 */

export interface BuildOptimizationConfig {
  compression: {
    gzip: boolean;
    brotli: boolean;
    threshold: number;
  };
  assets: {
    inlineLimit: number;
    imageOptimization: boolean;
    cssMinification: boolean;
  };
  chunks: {
    maxSize: number;
    minSize: number;
    vendorChunkSizeLimit: number;
  };
  treeshaking: {
    enabled: boolean;
    sideEffects: boolean;
  };
}

export const buildConfig: BuildOptimizationConfig = {
  compression: {
    gzip: true,
    brotli: true,
    threshold: 1024, // Only compress files larger than 1KB
  },
  assets: {
    inlineLimit: 4096, // Inline assets smaller than 4KB
    imageOptimization: true,
    cssMinification: true,
  },
  chunks: {
    maxSize: 500000, // 500KB max chunk size
    minSize: 20000,  // 20KB min chunk size
    vendorChunkSizeLimit: 800000, // 800KB vendor chunk limit
  },
  treeshaking: {
    enabled: true,
    sideEffects: true, // Allow side effects for React apps
  },
};

/**
 * Get optimized chunk configuration based on module ID
 */
export function getChunkName(id: string): string | undefined {
  // Core React libraries
  if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
    return 'vendor-react';
  }
  
  // UI components
  if (id.includes('node_modules/lucide-react')) {
    return 'vendor-ui';
  }
  
  // PDF generation libraries
  if (id.includes('jspdf') || id.includes('html2pdf')) {
    return 'vendor-pdf';
  }
  
  // Data processing libraries
  if (id.includes('papaparse')) {
    return 'vendor-data';
  }
  
  // Supabase
  if (id.includes('@supabase')) {
    return 'vendor-supabase';
  }
  
  // Application utilities
  if (id.includes('/src/utils/')) {
    return 'app-utils';
  }
  
  // Application components
  if (id.includes('/src/components/')) {
    return 'app-components';
  }
  
  // Other vendor libraries
  if (id.includes('node_modules')) {
    return 'vendor-misc';
  }
  
  return undefined;
}

/**
 * Asset file naming strategy for optimal caching
 */
export function getAssetFileName(assetInfo: { name?: string }): string {
  if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
  
  const info = assetInfo.name.split('.');
  const ext = info[info.length - 1];
  
  // CSS files
  if (/\.(css)$/.test(assetInfo.name)) {
    return `assets/css/[name]-[hash].${ext}`;
  }
  
  // Image files
  if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
    return `assets/images/[name]-[hash].${ext}`;
  }
  
  // Font files
  if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
    return `assets/fonts/[name]-[hash].${ext}`;
  }
  
  // Other assets
  return `assets/[name]-[hash].${ext}`;
}

/**
 * Production-specific optimizations
 */
export const productionOptimizations = {
  // Remove console statements in production
  dropConsole: true,
  dropDebugger: true,
  
  // Minification settings
  minifyCSS: true,
  minifyJS: true,
  minifyHTML: true,
  
  // Source map configuration
  sourcemap: false,
  
  // Bundle analysis
  generateBundleReport: false,
};

/**
 * Development-specific optimizations
 */
export const developmentOptimizations = {
  // Keep console statements in development
  dropConsole: false,
  dropDebugger: false,
  
  // Faster builds in development
  minifyCSS: false,
  minifyJS: false,
  minifyHTML: false,
  
  // Source maps for debugging
  sourcemap: true,
  
  // Bundle analysis
  generateBundleReport: false,
};