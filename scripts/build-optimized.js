#!/usr/bin/env node

/**
 * Optimized build script for Kerala Map Standalone
 * Implements comprehensive build optimizations and asset compression
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

const BUILD_DIR = 'dist';
const COMPRESSION_THRESHOLD = 1024; // 1KB

/**
 * Execute command with error handling
 */
function executeCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file should be compressed
 */
function shouldCompress(fileName) {
  const compressibleExtensions = ['.js', '.css', '.html', '.json', '.xml', '.txt', '.svg'];
  return compressibleExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Compress files with gzip and brotli
 */
function compressFiles(dirPath = BUILD_DIR) {
  console.log('🗜️  Compressing assets...');
  
  let totalOriginalSize = 0;
  let totalGzipSize = 0;
  let totalBrotliSize = 0;
  let filesCompressed = 0;

  function compressDirectory(dir) {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        compressDirectory(filePath);
      } else if (stat.isFile() && shouldCompress(file) && stat.size > COMPRESSION_THRESHOLD) {
        const content = readFileSync(filePath);
        const originalSize = content.length;
        
        // Gzip compression
        const gzipContent = gzipSync(content, { level: 9 });
        const gzipPath = `${filePath}.gz`;
        writeFileSync(gzipPath, gzipContent);
        
        // Brotli compression
        const brotliContent = brotliCompressSync(content);
        const brotliPath = `${filePath}.br`;
        writeFileSync(brotliPath, brotliContent);
        
        totalOriginalSize += originalSize;
        totalGzipSize += gzipContent.length;
        totalBrotliSize += brotliContent.length;
        filesCompressed++;
        
        console.log(`  📦 ${file}: ${formatBytes(originalSize)} → gzip: ${formatBytes(gzipContent.length)} → brotli: ${formatBytes(brotliContent.length)}`);
      }
    });
  }
  
  compressDirectory(BUILD_DIR);
  
  const gzipSavings = ((totalOriginalSize - totalGzipSize) / totalOriginalSize * 100).toFixed(1);
  const brotliSavings = ((totalOriginalSize - totalBrotliSize) / totalOriginalSize * 100).toFixed(1);
  
  console.log(`✅ Compressed ${filesCompressed} files`);
  console.log(`   Original: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Gzip: ${formatBytes(totalGzipSize)} (${gzipSavings}% savings)`);
  console.log(`   Brotli: ${formatBytes(totalBrotliSize)} (${brotliSavings}% savings)`);
}

/**
 * Analyze bundle sizes
 */
function analyzeBundleSizes() {
  console.log('📊 Analyzing bundle sizes...');
  
  const assetsDir = join(BUILD_DIR, 'assets');
  if (!existsSync(assetsDir)) {
    console.log('   No assets directory found');
    return;
  }
  
  const jsFiles = [];
  const cssFiles = [];
  let totalSize = 0;
  
  function analyzeDirectory(dir) {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath);
      } else if (stat.isFile()) {
        const size = stat.size;
        totalSize += size;
        
        if (file.endsWith('.js')) {
          jsFiles.push({ name: file, size });
        } else if (file.endsWith('.css')) {
          cssFiles.push({ name: file, size });
        }
      }
    });
  }
  
  analyzeDirectory(assetsDir);
  
  // Sort by size (largest first)
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  
  console.log(`   Total bundle size: ${formatBytes(totalSize)}`);
  
  if (jsFiles.length > 0) {
    console.log('   JavaScript files:');
    jsFiles.forEach(file => {
      console.log(`     ${file.name}: ${formatBytes(file.size)}`);
    });
  }
  
  if (cssFiles.length > 0) {
    console.log('   CSS files:');
    cssFiles.forEach(file => {
      console.log(`     ${file.name}: ${formatBytes(file.size)}`);
    });
  }
  
  // Check for size warnings
  const largeFiles = [...jsFiles, ...cssFiles].filter(file => file.size > 500000); // 500KB
  if (largeFiles.length > 0) {
    console.log('   ⚠️  Large files detected:');
    largeFiles.forEach(file => {
      console.log(`     ${file.name}: ${formatBytes(file.size)} (consider code splitting)`);
    });
  }
}

/**
 * Generate build report
 */
function generateBuildReport() {
  console.log('📋 Generating build report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    bundleAnalysis: {
      totalSize: 0,
      files: [],
      compressionSavings: {},
    },
    performance: {
      buildDuration: 0,
      optimizations: [
        'Tree shaking enabled',
        'Code splitting implemented',
        'Asset compression (gzip + brotli)',
        'CSS minification',
        'JavaScript minification',
        'Source map generation (dev only)',
      ],
    },
  };
  
  // Analyze build output
  if (existsSync(BUILD_DIR)) {
    function analyzeFiles(dir, basePath = '') {
      const files = readdirSync(dir);
      
      files.forEach(file => {
        const filePath = join(dir, file);
        const relativePath = join(basePath, file);
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeFiles(filePath, relativePath);
        } else if (stat.isFile()) {
          report.bundleAnalysis.totalSize += stat.size;
          report.bundleAnalysis.files.push({
            name: relativePath,
            size: stat.size,
            type: extname(file).slice(1) || 'unknown',
          });
        }
      });
    }
    
    analyzeFiles(BUILD_DIR);
  }
  
  // Write report
  const reportPath = join(BUILD_DIR, 'build-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Build report generated: ${reportPath}`);
  console.log(`   Total bundle size: ${formatBytes(report.bundleAnalysis.totalSize)}`);
  console.log(`   Files generated: ${report.bundleAnalysis.files.length}`);
}

/**
 * Main build process
 */
async function main() {
  const startTime = Date.now();
  
  console.log('🚀 Starting optimized build process...');
  console.log('');
  
  // Clean previous build
  executeCommand('rm -rf dist', 'Cleaning previous build');
  
  // Run optimized build
  executeCommand('NODE_ENV=production npx vite build', 'Building application');
  
  // Compress assets
  compressFiles();
  
  // Analyze bundle sizes
  analyzeBundleSizes();
  
  // Generate build report
  generateBuildReport();
  
  const endTime = Date.now();
  const buildDuration = (endTime - startTime) / 1000;
  
  console.log('');
  console.log(`🎉 Build completed successfully in ${buildDuration.toFixed(2)}s`);
  console.log('');
  console.log('📁 Build output:');
  console.log(`   Directory: ${BUILD_DIR}/`);
  console.log('   Assets are compressed with gzip and brotli');
  console.log('   Build report available in build-report.json');
  console.log('');
  console.log('🚀 Ready for deployment!');
}

// Run the build process
main().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});