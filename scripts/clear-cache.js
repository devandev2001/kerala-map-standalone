#!/usr/bin/env node

/**
 * Cache Clearing Script for Kerala Map Standalone
 * This script helps clear browser caches and service worker caches
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Kerala Map Standalone - Cache Clearing Script');
console.log('================================================');

// Function to clear build cache
function clearBuildCache() {
  const distPath = path.join(__dirname, '..', 'dist');
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '.vite');
  
  console.log('🗑️ Clearing build caches...');
  
  try {
    // Clear dist folder
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log('✅ Cleared dist folder');
    }
    
    // Clear Vite cache
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('✅ Cleared Vite cache');
    }
    
    console.log('✅ Build cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing build cache:', error.message);
  }
}

// Function to update service worker version
function updateServiceWorkerVersion() {
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  
  try {
    if (fs.existsSync(swPath)) {
      let content = fs.readFileSync(swPath, 'utf8');
      
      // Update the version in the service worker
      const newVersion = new Date().toISOString().split('T')[0].replace(/-/g, '.');
      content = content.replace(
        /const APP_VERSION = '[^']*';/,
        `const APP_VERSION = '${newVersion}';`
      );
      
      fs.writeFileSync(swPath, content);
      console.log(`✅ Updated service worker version to ${newVersion}`);
    }
  } catch (error) {
    console.error('❌ Error updating service worker:', error.message);
  }
}

// Function to show usage instructions
function showUsageInstructions() {
  console.log('\n📋 Usage Instructions:');
  console.log('=====================');
  console.log('1. Run this script to clear build caches');
  console.log('2. Open your browser and go to your site');
  console.log('3. Open Developer Tools (F12)');
  console.log('4. Go to Application tab > Storage');
  console.log('5. Click "Clear storage" to clear browser caches');
  console.log('6. Or use the cache manager in console:');
  console.log('   - window.cacheManager.clearAllCaches()');
  console.log('   - window.cacheManager.forceReload()');
  console.log('\n🔧 Alternative: Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsageInstructions();
    return;
  }
  
  if (args.includes('--sw-version') || args.includes('-v')) {
    updateServiceWorkerVersion();
  }
  
  clearBuildCache();
  showUsageInstructions();
}

// Run the script
main();
