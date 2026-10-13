const CACHE_NAME = 'cocina-v2';

// Archivos para almacenar en caché (Offline)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './icons/recetario.svg'
];

// Instalación: guardar archivos en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Interceptar peticiones para funcionar SIN CONEXIÓN
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// Evento SYNC (Background Sync para cuando vuelva el internet)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recetas') {
    event.waitUntil(
      self.registration.showNotification('Sincronización Completada', {
        body: 'Tus recetas guardadas en modo offline se han actualizado.',
        icon: 'icons/recetario.svg'
      })
    );
  }
});
