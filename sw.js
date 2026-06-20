// 简单的 Service Worker，让 Chrome 识别为 PWA 可安装
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
