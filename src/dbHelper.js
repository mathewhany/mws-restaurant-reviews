import * as CacheHelper from '~/cacheHelper';

/**
 * API URL.
 */
const API_URL = 'http://localhost:1337';

// Cache fetch results in memory, to reduce the number of requests to the network and to IDB.
const memoryCache = {};

// Store current fetch requests to reuse them when needed.
const currentlyFetching = {};

const fetchAndCache = (url, putIntoCache, getFromCache) => {
  // If this url is already being requested,
  // just reuse the same request instead of creating a new one.
  if (currentlyFetching[url]) {
    console.warn('Reusing the same fetch request.');
    return currentlyFetching[url];
  }

  currentlyFetching[url] = new Promise((resolve, reject) => {
    if (memoryCache[url]) {
      console.warn('Already stored in memory cache: ' + memoryCache[url]);
      resolve(memoryCache[url]);
      return;
    }

    fetch(url)
      .then(res => res.json())
      .then(results => {
        console.info(`Network result [${url}]:`, results);
        putIntoCache(results);
        resolve(results);
      })
      .catch(() => getFromCache().then(resolve, reject));
  }).then(results => {
    // Store results in memory cache.
    memoryCache[url] = results;
    return results;
  });

  return currentlyFetching[url];
};

/**
 * Fetch all restaurants.
 */
export const fetchRestaurants = () => {
  return fetchAndCache(
    `${API_URL}/restaurants`,
    CacheHelper.putRestaurants,
    CacheHelper.getRestaurants
  );
};

/**
 * Fetch a restaurant by its ID.
 */
export const fetchRestaurantAndReviewsById = id => {
  return Promise.all([
    fetchRestaurantById(id),
    fetchReviewsByRestaurantId(id),
  ]).then(([restaurant, reviews]) => {
    restaurant.reviews = reviews;
    return restaurant;
  });
};

export const fetchRestaurantById = id => {
  return fetchAndCache(
    `${API_URL}/restaurants/${id}`,
    CacheHelper.putRestaurant,
    () => CacheHelper.getRestaurantById(id)
  );
};

/**
 * Fetch restaurants by a cuisine type.
 */
export const fetchRestaurantByCuisine = cuisine => {
  return fetchRestaurants().then(restaurants =>
    restaurants.filter(r => r.cuisine_type == cuisine)
  );
};

/**
 * Fetch restaurants by a neighborhood.
 */
export const fetchRestaurantByNeighborhood = neighborhood => {
  return fetchRestaurants().then(restaurants =>
    restaurants.filter(r => r.neighborhood == neighborhood)
  );
};

/**
 * Fetch restaurants by a cuisine and a neighborhood.
 */
export const fetchRestaurantByCuisineAndNeighborhood = (
  cuisine,
  neighborhood
) => {
  return fetchRestaurants().then(restaurants => {
    let results = restaurants;

    // Filter by cuisine
    if (cuisine != 'all') {
      results = results.filter(r => r.cuisine_type == cuisine);
    }

    // Filter by neighborhood
    if (neighborhood != 'all') {
      results = results.filter(r => r.neighborhood == neighborhood);
    }

    return results;
  });
};

/**
 * Fetch all neighborhoods.
 */
export const fetchNeighborhoods = () => {
  return fetchRestaurants().then(restaurants =>
    restaurants
      // Get all neighborhoods from all restaurants
      .map((v, i) => restaurants[i].neighborhood)
      // Remove duplicates from neighborhoods
      .filter((v, i, arr) => arr.indexOf(v) == i)
  );
};

/**
 * Fetch all cuisines.
 */
export const fetchCuisines = () => {
  return fetchRestaurants().then(restaurants =>
    restaurants
      // Get all cuisines from all restaurants
      .map((v, i) => restaurants[i].cuisine_type)
      // Remove duplicates from cuisines
      .filter((v, i, arr) => arr.indexOf(v) == i)
  );
};

/**
 * Fetch reviews of a restaurant by its id.
 */
export const fetchReviewsByRestaurantId = restaurantId => {
  return fetchAndCache(
    `${API_URL}/reviews/?restaurant_id=${restaurantId}`,
    CacheHelper.putReviews,
    () => CacheHelper.getReviewsByRestaurantId(restaurantId)
  );
};

/**
 * Restaurant page URL.
 */
export const urlForRestaurant = restaurant =>
  `./restaurant.html?id=${restaurant.id}`;

/**
 * Restaurant image URL.
 */
export const imageUrlForRestaurant = ({ photograph }) =>
  `/img/${photograph}_800w.jpg`;

/**
 * Generate a source set for the restaurant image.
 */
export const imageSrcsetForRestaurant = ({ photograph: img }) =>
  `/img/${img}_800w.jpg 800w, 
  /img/${img}_640w.jpg 640w, 
  /img/${img}_480w.jpg 480w`;

/**
 * Map marker for a restaurant.
 */
export const mapMarkerForRestaurant = (restaurant, map) =>
  new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: urlForRestaurant(restaurant),
    map: map,
    animation: google.maps.Animation.DROP,
  });
