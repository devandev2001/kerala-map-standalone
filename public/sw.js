// Kerala Map Standalone - Service Worker for PWA Functionality
// Dynamic cache versioning based on build timestamp
const CACHE_VERSION = Date.now(); // Dynamic version for each deployment
const BUILD_TIMESTAMP = new Date().toISOString(); // Current build timestamp
const CACHE_NAME = `kerala-map-standalone-v${CACHE_VERSION}`;
const STATIC_CACHE = `kerala-map-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `kerala-map-dynamic-v${CACHE_VERSION}`;

// Cache expiry time (in milliseconds) - 2 minutes for SUPER aggressive updates
const CACHE_EXPIRY = 2 * 60 * 1000;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/icon-144x144.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/district_hierarchy_data.csv',
  '/district_overview_data.csv',
  '/district_panchayat_division.csv'
];

// Map data files to cache for offline functionality
const MAP_DATA_ASSETS = [
  '/map/kerala_org_districts.geojson',
  '/map/kerala_zones.geojson',
  '/map/org_mandal.geojson',
  '/map/panchayats_tagged.geojson',
  '/map/KERALA_ASSEMBLY_filtered.geojson',
  '/map/Thrissur_Mandals.geojson',
  '/map/Thrissur_Wards_Merged.geojson',
  '/map/AC_Mandal_LocalBody_updated.csv'
];

// CSV data files for offline functionality
const CSV_DATA_ASSETS = [
  '/csv/all_ac_targets.csv',
  '/csv/all_mandal_targets.csv',
  '/csv/whitelist.csv',
  '/data/org_districts_contacts.csv'
];

// Install event - cache static assets and force immediate activation
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing with AGGRESSIVE cache clearing...');
  event.waitUntil(
    Promise.all([
      // Clear ALL existing caches first (including browser cache)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Service Worker: AGGRESSIVELY clearing old cache', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Clear browser cache if possible
      new Promise((resolve) => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          navigator.storage.estimate().then((estimate) => {
            console.log('🗑️ Service Worker: Clearing browser storage');
            if ('clear' in navigator.storage) {
              navigator.storage.clear().then(resolve).catch(resolve);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      }),
      // Then cache new static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Service Worker: Caching fresh static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache map data for offline functionality
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('🗺️ Service Worker: Caching map data assets');
        return Promise.allSettled([
          ...MAP_DATA_ASSETS.map(asset => cache.add(asset).catch(err => console.warn('Failed to cache map asset:', asset, err))),
          ...CSV_DATA_ASSETS.map(asset => cache.add(asset).catch(err => console.warn('Failed to cache CSV asset:', asset, err)))
        ]);
      })
    ])
    .then(() => {
      console.log('✅ Service Worker: Installation complete with AGGRESSIVE cache refresh');
      return self.skipWaiting(); // Force immediate activation
    })
    .catch((error) => {
      console.error('❌ Service Worker: Installation failed', error);
    })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating with aggressive cache cleanup...');
  event.waitUntil(
    Promise.all([
      // Delete ALL old caches (aggressive cleanup)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clear expired cache entries
      clearExpiredCache(),
      // Take control of all clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ Service Worker: Activation complete with cache cleanup');
      // Notify all clients to refresh
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_UPDATED' });
        });
      });
    })
  );
});

// Function to clear expired cache entries
async function clearExpiredCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedTime = response.headers.get('sw-cached-time');
        if (cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age > CACHE_EXPIRY) {
            console.log('🗑️ Service Worker: Removing expired cache entry', request.url);
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (like Supabase API)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle different types of requests
  if (STATIC_ASSETS.includes(url.pathname)) {
    // Core static assets - cache first strategy
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    // JS/CSS files - stale while revalidate for better updates
    event.respondWith(staleWhileRevalidate(request));
  } else if (url.pathname.endsWith('.csv') || url.pathname.endsWith('.json') || url.pathname.endsWith('.geojson')) {
    // Data files - network first strategy with offline fallback
    event.respondWith(networkFirst(request));
  } else {
    // Other requests - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache first strategy - good for static assets (with expiry)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cache is expired
      const cachedTime = cachedResponse.headers.get('sw-cached-time');
      if (cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age > CACHE_EXPIRY) {
          console.log('🔄 Service Worker: Cache expired, fetching fresh content');
          // Cache expired, fetch fresh content
          const cache = await caches.open(STATIC_CACHE);
          await cache.delete(request);
        } else {
          return cachedResponse;
        }
      } else {
        return cachedResponse;
      }
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Add timestamp to response headers
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cached-time': Date.now().toString()
        }
      });
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy - good for dynamic data (always fresh)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Add timestamp to response headers
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cached-time': Date.now().toString()
        }
      });
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cache is expired even for offline fallback
      const cachedTime = cachedResponse.headers.get('sw-cached-time');
      if (cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age > CACHE_EXPIRY) {
          return new Response('Content expired and network unavailable', { status: 503 });
        }
      }
      return cachedResponse;
    }
    return new Response('Content not available offline', { status: 503 });
  }
}

// Stale while revalidate - good for frequently updated content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any offline actions that need to be synced
    console.log('📡 Service Worker: Performing background sync');
    
    // You can add specific sync logic here
    // For example, sync offline form submissions, etc.
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BJP Kerala Dashboard', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('🎯 Kerala Map Standalone Service Worker loaded successfully');