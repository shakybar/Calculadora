// sw.js - Service Worker

const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/img/mainlogo.png',
  '/js/script.js',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activa el nuevo Service Worker inmediatamente
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Elimina las versiones antiguas del cache
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Controla las pestañas abiertas
  );
});

// Interceptar las solicitudes de red para servir los recursos desde el cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Si hay una respuesta en cache, se devuelve
          return cachedResponse;
        }
        // Si no está en cache, se hace la solicitud a la red
        return fetch(event.request).then((networkResponse) => {
          // Cacheamos los nuevos recursos de la red para usarlos en futuras solicitudes
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      })
  );
});
