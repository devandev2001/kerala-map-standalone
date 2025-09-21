/**
 * Bundle analyzer configuration for monitoring build output
 * Helps identify optimization opportunities and track bundle sizes
 */

export interface BundleAnalyzerConfig {
  enabled: boolean;
  openAnalyzer: boolean;
  analyzerMode: 'server' | 'static' | 'json';
  reportFilename: string;
  defaultSizes: 'stat' | 'parsed' | 'gzip';
}

/**
 * Default bundle analyzer configuration
 */
export const bundleAnalyzerConfig: BundleAnalyzerConfig = {
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Don't auto-open browser
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html',
  defaultSizes: 'gzip',
};

/**
 * Bundle size thresholds for warnings
 */
export const bundleSizeThresholds = {
  // Main application bundle
  main: {
    warning: 250000, // 250KB
    error: 500000,   // 500KB
  },
  
  // Vendor bundles
  vendor: {
    warning: 500000, // 500KB
    error: 1000000,  // 1MB
  },
  
  // Individual chunks
  chunk: {
    warning: 100000, // 100KB
    error: 250000,   // 250KB
  },
  
  // CSS files
  css: {
    warning: 50000,  // 50KB
    error: 100000,   // 100KB
  },
};

/**
 * Performance budget configuration
 */
export const performanceBudget = {
  // Total bundle size limits
  maxAssetSize: 500000,    // 500KB per asset
  maxEntrypointSize: 1000000, // 1MB total entry point
  
  // Individual file type limits
  limits: {
    js: 800000,   // 800KB total JS
    css: 100000,  // 100KB total CSS
    images: 500000, // 500KB total images
    fonts: 200000,  // 200KB total fonts
  },
  
  // Performance hints
  hints: 'warning' as const, // 'error' | 'warning' | false
};

/**
 * Chunk analysis configuration
 */
export const chunkAnalysis = {
  // Analyze chunk dependencies
  analyzeDependencies: true,
  
  // Track chunk size over time
  trackSizeHistory: true,
  
  // Identify duplicate modules
  findDuplicates: true,
  
  // Analyze tree-shaking effectiveness
  analyzeTreeShaking: true,
};

/**
 * Generate bundle report data
 */
export function generateBundleReport(stats: any) {
  const report = {
    timestamp: new Date().toISOString(),
    totalSize: 0,
    chunks: [] as any[],
    assets: [] as any[],
    warnings: [] as string[],
    errors: [] as string[],
  };

  // Analyze chunks
  if (stats.chunks) {
    stats.chunks.forEach((chunk: any) => {
      const chunkSize = chunk.size || 0;
      report.totalSize += chunkSize;
      
      report.chunks.push({
        name: chunk.name,
        size: chunkSize,
        modules: chunk.modules?.length || 0,
        files: chunk.files || [],
      });
      
      // Check size thresholds
      if (chunkSize > bundleSizeThresholds.chunk.error) {
        report.errors.push(`Chunk ${chunk.name} exceeds size limit: ${chunkSize} bytes`);
      } else if (chunkSize > bundleSizeThresholds.chunk.warning) {
        report.warnings.push(`Chunk ${chunk.name} is large: ${chunkSize} bytes`);
      }
    });
  }

  // Analyze assets
  if (stats.assets) {
    stats.assets.forEach((asset: any) => {
      report.assets.push({
        name: asset.name,
        size: asset.size,
        type: getAssetType(asset.name),
      });
    });
  }

  return report;
}

/**
 * Determine asset type from filename
 */
function getAssetType(filename: string): string {
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.css')) return 'stylesheet';
  if (filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
  if (filename.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
  return 'other';
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}