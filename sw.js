// Service Worker版本号
const VERSION = 'v1.0';
// 缓存名称
const CACHE_NAME = `game-platform-${VERSION}`;

// 监听安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // 缓存基本资源
        return cache.addAll([
          '/',
          '/index.html',
          // 其他需要缓存的静态资源
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// 监听激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 监听fetch事件
self.addEventListener('fetch', event => {
  // 只处理同源的请求
  if (new URL(event.request.url).origin !== self.origin) {
    return;
  }
  
  event.waitUntil(
    // 尝试从缓存中获取资源
    caches.match(event.request)
      .then(cachedResponse => {
        // 如果缓存中有，直接返回
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then(response => {
            // 克隆响应，因为响应只能使用一次
            const responseToCache = response.clone();
            
            // 将新的响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
              
            return response;
          });
      })
  );
});

// 监听消息事件
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_GAME') {
    // 缓存特定游戏
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll([
          `/${event.data.gameFolder}/index.html`,
          `/${event.data.gameFolder}/style.css`,
          `/${event.data.gameFolder}/script.js`
          // 其他游戏相关资源
        ]);
      });
  }
});    
