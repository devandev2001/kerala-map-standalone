# Cache Management Guide

## Overview

The Kerala Map Standalone application now includes a comprehensive auto cache clearing system that ensures users always get the latest version of the application and data.

## Features

### 🔄 Automatic Cache Clearing
- **Version-based clearing**: Automatically clears caches when the app version changes
- **Periodic cleanup**: Clears expired caches every 24 hours
- **Service worker updates**: Clears caches when a new service worker is installed

### 🧹 Manual Cache Clearing
- **UI Button**: "Clear Cache" button in the main interface
- **Force Refresh**: Enhanced force refresh functionality
- **Console Commands**: Available via `window.cacheManager`

### 📦 Smart Caching
- **Selective clearing**: Only clears old/expired caches, preserves current version
- **Offline support**: Maintains essential data for offline functionality
- **Performance optimized**: Uses appropriate caching strategies for different content types

## How It Works

### 1. App Initialization
When the app starts:
1. Checks if the app version has changed
2. If version changed, clears all caches and updates version
3. Registers service worker with proper cache management
4. Sets up periodic cache cleanup

### 2. Service Worker Integration
- Service worker handles cache versioning
- Automatically clears old caches on updates
- Responds to cache clearing messages from main thread
- Maintains offline functionality

### 3. Cache Types
- **Static Cache**: Core app files (HTML, CSS, JS, icons)
- **Dynamic Cache**: Data files (CSV, JSON, GeoJSON)
- **Browser Storage**: localStorage, sessionStorage
- **Service Worker Cache**: PWA cache storage

## Usage

### For Users

#### Clear Cache Button
1. Click the "Clear Cache" button in the top navigation
2. Confirm the action in the dialog
3. App will clear all caches and reload

#### Force Refresh
1. If the app is loading slowly, click "Force Refresh" on the loading screen
2. This will clear caches and reload the page

### For Developers

#### Console Commands
```javascript
// Clear all caches
window.cacheManager.clearAllCaches()

// Force reload with cache clearing
window.cacheManager.forceReload()

// Update service worker
window.cacheManager.updateServiceWorker()

// Get cache information
window.cacheManager.getCacheInfo()

// Clear only expired caches
window.cacheManager.clearExpiredCaches()
```

#### NPM Scripts
```bash
# Clear build caches
npm run clear-cache

# Clear caches and update service worker version
npm run clear-cache:sw
```

## Configuration

### Cache Expiry
- **Default**: 24 hours for dynamic content
- **Static assets**: Cached until version change
- **Data files**: Network-first with offline fallback

### Version Management
- App version is stored in `localStorage` as `kerala-map-cache-version`
- Service worker version is updated automatically
- Version changes trigger complete cache clearing

## Troubleshooting

### Cache Issues
1. **Stale content**: Use the "Clear Cache" button
2. **Loading problems**: Use "Force Refresh" on loading screen
3. **Service worker issues**: Use `window.cacheManager.updateServiceWorker()`

### Development
1. **Build issues**: Run `npm run clear-cache`
2. **Service worker updates**: Run `npm run clear-cache:sw`
3. **Debug cache**: Use `window.cacheManager.getCacheInfo()`

## Technical Details

### Files Modified
- `src/main.tsx`: Added service worker registration
- `src/utils/serviceWorkerManager.ts`: New cache management system
- `src/App.tsx`: Added cache clearing UI
- `public/sw.js`: Enhanced cache clearing messages
- `package.json`: Added cache clearing scripts

### Cache Strategies
- **Cache First**: Static assets (HTML, CSS, JS, icons)
- **Network First**: Data files (CSV, JSON, GeoJSON)
- **Stale While Revalidate**: Frequently updated content

### Browser Support
- Modern browsers with Service Worker support
- Graceful degradation for older browsers
- Automatic fallback to simple reload

## Benefits

1. **Always Fresh**: Users get the latest version automatically
2. **Offline Ready**: Essential data cached for offline use
3. **Performance**: Smart caching improves load times
4. **User Control**: Manual cache clearing when needed
5. **Developer Friendly**: Easy debugging and maintenance

## Future Enhancements

- Background sync for offline actions
- Push notifications for updates
- Advanced cache analytics
- Custom cache policies per content type
