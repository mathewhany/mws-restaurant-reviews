const CACHE_NAME = 'restaurant-reviews-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([ 
        '/',
        '/restaurant.html',
        '/data/restaurants.json',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cachesNames => {
      return Promise.all(
        cachesNames
          .filter((cache) => cache != CACHE_NAME)
          .map((cache) => caches.delete(cache))
      );
    })
  )
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          }).catch((error) => {
            console.log(error);
            return cache.match('/');
          })
        });
      })
    );
});
