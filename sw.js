/* sw.js CORREGIDO */
const CACHE_NAME = 'billetes-v2'; // Cambié la versión para forzar actualización
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // './img/mainlogo.png', // Descomenta solo si tienes esta imagen en tu carpeta img
  
  // IMÁGENES EXTERNAS (Billetes)
  // Es vital agregarlas aquí para que se descarguen y funcionen offline
  'https://i.postimg.cc/BQ4BSP36/1000.jpg',
  'https://i.ibb.co/zrSRSLy/2000.jpg',
  'https://i.ibb.co/BVZwSB8S/5df7617506ee.jpg',
  'https://i.ibb.co/pP7LNrp/10000.jpg',
  'https://i.ibb.co/rdBfGDR/20000.jpg',
  'https://i.ibb.co/BLBVXTN/50000.jpg',
  'https://i.ibb.co/5sf1d7K/100000.jpg'
];

// 1. Instalación: Cacheamos lo esencial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activación: Limpiamos cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Fetch: Estrategia Cache-First (Si está en caché, úsalo; si no, ve a internet)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el archivo (o imagen) está en caché, devuélvelo
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Si no, búscalo en internet
      return fetch(event.request)
        .catch(() => {
          // Si falla internet y es una navegación, mostrar index.html
          // (Opcional, útil si el usuario recarga en una sub-ruta)
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
