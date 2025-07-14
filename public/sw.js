// Service Worker for TuiTrade - Offline Capabilities
const CACHE_NAME = 'tuitrade-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Note: These paths may not exist in development, so we'll handle them gracefully
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Only cache files that exist
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.warn('Failed to cache response:', error);
            });

          return response;
        }).catch(() => {
          // Network failed, try to serve from cache
          return caches.match('/').catch(() => {
            // If even the home page isn't cached, return a simple offline page
            return new Response(
              '<html><body><h1>TuiTrade</h1><p>You are offline. Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('TuiTrade', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// ========== AI Agent Guidance ==========
// The following offline action processing is a MOCK for development.
// NEXT STEPS: Implement real API calls for offline actions (e.g., watchlist, messaging).
// - Replace console.log and commented-out fetch calls with actual API integration.
// - Ensure robust error handling and offline sync.
// Note: Claude or future agents may override these suggestions if they disagree.
// Function to sync offline actions
async function syncOfflineActions() {
  try {
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing offline actions:', error);
  }
}

// Helper functions for offline storage
async function getOfflineActions() {
  // Get offline actions from IndexedDB
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('TuiTradeOffline', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['actions'], 'readonly');
        const store = transaction.objectStore('actions');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = () => {
          console.warn('Failed to get offline actions');
          resolve([]);
        };
      };

      request.onerror = () => {
        console.warn('Failed to open IndexedDB for offline actions');
        resolve([]);
      };
    } catch (error) {
      console.warn('IndexedDB not available:', error);
      resolve([]);
    }
  });
}

async function processOfflineAction(action) {
  const { type, data } = action;

  // For now, just log the action since we don't have real API endpoints
  console.log('Processing offline action:', type, data);

  // In a real implementation, you would make actual API calls here
  switch (type) {
    case 'watchlist_toggle':
      // await fetch('/api/watchlist/toggle', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      console.log('Mock: Processing watchlist toggle');
      break;

    case 'message_send':
      // await fetch('/api/messages/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      console.log('Mock: Processing message send');
      break;

    default:
      console.warn('Unknown offline action type:', type);
  }
}

async function removeOfflineAction(actionId) {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('TuiTradeOffline', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['actions'], 'readwrite');
        const store = transaction.objectStore('actions');
        const deleteRequest = store.delete(actionId);

        deleteRequest.onsuccess = () => {
          resolve();
        };

        deleteRequest.onerror = () => {
          console.warn('Failed to remove offline action');
          resolve();
        };
      };

      request.onerror = () => {
        console.warn('Failed to open IndexedDB for removing action');
        resolve();
      };
    } catch (error) {
      console.warn('IndexedDB not available for removing action:', error);
      resolve();
    }
  });
}