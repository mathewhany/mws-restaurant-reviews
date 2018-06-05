import idb from 'idb';

const createDbPromise = () => {
  /* eslint-disable no-fallthrough */
  return idb.open('restaurant-reviews', 2, upgradeDB => {
    switch (upgradeDB.version) {
      case 2:
        upgradeDB
          .createObjectStore('reviews', { autoIncrement: true })
          .createIndex('restaurant_id', 'restaurant_id', {
            unique: false,
          });
      case 1:
        upgradeDB.createObjectStore('restaurants', { autoIncrement: true });
    }
  });
};

const dbPromise = !navigator.serviceWorker
  ? Promise.resolve()
  : createDbPromise();

const getStore = (name, write = false) => {
  return dbPromise.then(db =>
    db.transaction(name, write ? 'readwrite' : 'readonly').objectStore(name)
  );
};

const get = (store, id) => getStore(store).then(store => store.get(Number(id)));
const put = (store, object) =>
  getStore(store, true).then(store => store.put(object));
const remove = (store, id) =>
  getStore(store, true).then(store => store.delete(Number(id)));
const update = (storeName, id, updates) =>
  getStore(storeName, true).then(store => {
    return store.get(Number(id)).then(object => {
      for (let key in updates) {
        object[key] = updates[key];

        store.put(object);
      }
    });
  });
const getAll = store => getStore(store).then(store => store.getAll());
const putAll = (storeName, objects) =>
  getStore(storeName, true).then(store =>
    objects.forEach(object => store.put(object))
  );

export const getRestaurants = () => getAll('restaurants');
export const putRestaurants = restaurants => putAll('restaurants', restaurants);
export const getRestaurantById = id => get('restaurants', id);
export const putRestaurant = restaurant => put('restaurants', restaurant);
export const favoriteRestaurant = id =>
  update('restaurants', id, {
    is_favorite: true,
  });
export const unfavoriteRestaurant = id =>
  update('restaurants', id, {
    is_favorite: false,
  });

export const getReviewsByRestaurantId = restaurantId => {
  return getStore('reviews').then(store =>
    store.index('restaurant_id').getAll(Number(restaurantId))
  );
};
export const putReviews = reviews => putAll('reviews', reviews);
export const addReview = review => put('reviews', review);
export const removeReview = id => remove('reviews', id);
