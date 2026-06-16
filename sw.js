const CACHE = 'cen-conquest-matrix-v21-final-tweak';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/conquest-bg-extended.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './hubs/index.html',
  './hubs/style.css',
  './hubs/js/app.js',
  './hubs/assets/jordan-map.png',
  './hubs/assets/jericho-map.png',
  './hubs/assets/conquest-map.png',
  './hubs/assets/inheritance-map.png',
  './hubs/assets/shechem-map.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

/* 20260616-next-era-links */
