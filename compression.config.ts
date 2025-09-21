/**
 * Compression configuration for production builds
 * Implements gzip and brotli compression for optimal asset delivery
 */

export interface CompressionOptions {
  algorithm: 'gzip' | 'brotli';
  threshold: number;
  compressionOptions?: any;
  filter?: (fileName: string) => boolean;
}

/**
 * Default file filter for compression
 * Only compress text-based assets that benefit from compression
 */
export function shouldCompress(fileName: string): boolean {
  const compressibleExtensions = [
    '.js', '.css', '.html', '.json', '.xml', '.txt',
    '.svg', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return compressibleExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Gzip compression configuration
 */
export const gzipConfig: CompressionOptions = {
  algorithm: 'gzip',
  threshold: 1024, // Only compress files larger than 1KB
  compressionOptions: {
    level: 9, // Maximum compression
    chunkSize: 1024,
    windowBits: 15,
    memLevel: 8,
  },
  filter: shouldCompress,
};

/**
 * Brotli compression configuration
 */
export const brotliConfig: CompressionOptions = {
  algorithm: 'brotli',
  threshold: 1024, // Only compress files larger than 1KB
  compressionOptions: {
    level: 11, // Maximum compression
    chunkSize: 1024,
  },
  filter: shouldCompress,
};

/**
 * Get compression configurations based on environment
 */
export function getCompressionConfigs(isProduction: boolean): CompressionOptions[] {
  if (!isProduction) {
    return [];
  }
  
  return [gzipConfig, brotliConfig];
}

/**
 * Asset optimization settings
 */
export const assetOptimization = {
  // Image optimization
  images: {
    quality: 85,
    progressive: true,
    optimizationLevel: 7,
  },
  
  // CSS optimization
  css: {
    removeComments: true,
    removeWhitespace: true,
    mergeLonghand: true,
    mergeRules: true,
  },
  
  // JavaScript optimization
  javascript: {
    removeComments: true,
    removeWhitespace: true,
    mangle: true,
    compress: true,
  },
};

/**
 * Cache optimization settings
 */
export const cacheOptimization = {
  // Long-term caching for assets with hashes
  staticAssets: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
  
  // Short-term caching for HTML files
  htmlFiles: {
    maxAge: 3600, // 1 hour
    immutable: false,
  },
  
  // Medium-term caching for API responses
  apiResponses: {
    maxAge: 86400, // 1 day
    immutable: false,
  },
};