import idb from 'idb';

export default class CacheHelper {
  static get dbPromise() {
    if (!navigator.serviceWorker) return Promise.resolve();

    return idb.open('restaurant-reviews', 1, upgradeDB => {
      switch (upgradeDB.version) {
        case 1:
          upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
      }
    });
  }

  static putRestaurants(restaurants) {
    this.dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      restaurants.forEach(restaurant => {
        store.put(restaurant);
      });

      return tx.complete;
    });
  }

  static getRestaurants() {
    return this.dbPromise.then(db =>
      db
        .transaction('restaurants')
        .objectStore('restaurants')
        .getAll()
    );
  }

  static getRestaurantById(id) {
    return this.dbPromise.then(db =>
      db
        .transaction('restaurants')
        .objectStore('restaurants')
        .get(Number(id))
    );
  }

  static putRestaurant(restaurant) {
    return this.dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      store.put(restaurant);
      return tx.complete;
    });
  }
}
