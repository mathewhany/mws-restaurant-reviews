self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('https://maps.googleapis.com/maps/api/staticmap')) {
    event.respondWith(caches.open('restaurant-reviews-images').then(cache => {
      return cache.match(event.request.url).then(response => {
        return (
          response ||
          fetch(event.request.url).then(networkResponse => {
            cache.put(event.request.url, networkResponse.clone());
            return networkResponse;
          })
        );
      });
    }));
  } else {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith('/img/')) {
      event.respondWith(serveImage(event.request));
    }
  }
});

function serveImage(req) {
  const storageUrl = req.url.replace(/_\d+w\.jpg/, '');

  return caches.open('restaurant-reviews-images').then(cache => {
    return cache.match(storageUrl).then(response => {
      return (
        response ||
        fetch(req.url).then(networkResponse => {
          cache.put(storageUrl, networkResponse.clone());
          return networkResponse;
        })
      );
    });
  });
}
