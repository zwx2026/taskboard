// Service Worker — 任务看板
// 版本号：修改此值或改文件任意字节都会触发浏览器更新 SW
const VERSION = 'v3-20250621';

self.addEventListener('install', function(e) {
  console.log('[SW] install', VERSION);
  self.skipWaiting(); // 立即激活，不等旧 SW 释放
});

self.addEventListener('activate', function(e) {
  console.log('[SW] activate', VERSION);
  // 接管所有已打开的页面
  e.waitUntil(
    clients.claim().then(function() {
      // 通知所有页面：SW 已更新
      return clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'sw-updated', version: VERSION });
        });
      });
    })
  );
});

// 网络优先：始终尝试拉最新内容，网络失败才用缓存兜底
self.addEventListener('fetch', function(e) {
  // 只处理 GET 请求
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // 网络成功 → 更新缓存
        var cloned = response.clone();
        caches.open('taskboard-' + VERSION).then(function(cache) {
          cache.put(e.request, cloned);
        });
        return response;
      })
      .catch(function() {
        // 网络失败 → 尝试从缓存读取
        return caches.match(e.request).then(function(cached) {
          return cached || new Response('离线，请连接网络后刷新', { status: 503 });
        });
      })
  );
});

// 收到主页面消息时返回当前版本
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'check-version') {
    e.ports && e.ports[0] && e.ports[0].postMessage({ version: VERSION });
  }
});
