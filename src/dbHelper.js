import CacheHelper from './cacheHelper';

/**
 * Common database helper functions.
 */
export default class DBHelper {
  /**
   * API URL.
   */
  static get API_URL() {
    return 'http://localhost:1337';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    if (this.networkRestaurants) {
      callback(null, this.networkRestaurants);
    } else {
      CacheHelper.getRestaurants().then(restaurants => {
        if (!this.networkRestaurants) {
          callback(null, restaurants);
        }
      });
    }

    fetch(`${this.API_URL}/restaurants`)
      .then(res => res.json())
      .then(restaurants => {
        this.networkRestaurants = restaurants;
        CacheHelper.putRestaurants(restaurants);
        callback(null, restaurants);
      })
      .catch(() => {
        CacheHelper.getRestaurants()
          .then(restaurants => {
            callback(null, restaurants);
          })
          .catch(e => {
            console.log(e);
            callback('Request failed.', null);
          });
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    fetch(`${this.API_URL}/restaurants/${id}`)
      .then(res => res.json())
      .then(restaurant => {
        if (restaurant) {
          CacheHelper.putRestaurant(restaurant);
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      })
      .catch(() => {
        CacheHelper.getRestaurantById(id).then(restaurant => {
          callback(null, restaurant);
        }).catch(error => {
          callback(error, null);
        });
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        // console.log(results);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant({ photograph: img }) {
    return `/img/${img}_800w.jpg`;
  }

  /**
   * Generate a source set for the restaurant image.
   */
  static imageSrcsetForRestaurant({ photograph: img }) {
    return `
      /img/${img}_800w.jpg 800w, 
      /img/${img}_640w.jpg 640w, 
      /img/${img}_480w.jpg 480w`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }
}
