import 'intersection-observer';
import lozad from 'lozad';
import {
  loadDynamicMapOnClick,
  getMap,
  updateFavoriteBtnUI,
  toggleFavoriteBtn,
} from '~/pages/common/js';
import * as DbHelper from '~/dbHelper';
import './index.scss';

let markers = [];

const nSelect = document.getElementById('neighborhoods-select');
const cSelect = document.getElementById('cuisines-select');

// Lazy loading images for boasting performance.
// https://github.com/ApoorvSaxena/lozad.js
const lozadObserver = lozad();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurantsAndMarkers();

  loadDynamicMapOnClick(map => {
    map.setZoom(12);
    map.setCenter({
      lat: 40.722216,
      lng: -73.987501,
    });

    updateRestaurantsAndMarkers();
  });

  nSelect.addEventListener('change', updateRestaurantsAndMarkers);
  cSelect.addEventListener('change', updateRestaurantsAndMarkers);
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DbHelper.fetchNeighborhoods().then(fillNeighborhoodsHTML);
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = neighborhoods => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DbHelper.fetchCuisines().then(fillCuisinesHTML);
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = cuisines => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurantsAndMarkers = () => {
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DbHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(restaurants => {
      resetRestaurants();
      fillRestaurantsHTML(restaurants);
      if (getMap()) addMarkersToMap(restaurants);

      // Observe images and load them when needed.
      lozadObserver.observe();
    })
    .catch(e => {
      console.error(e);
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = () => {
  // Remove all restaurants
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = restaurants => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
  const li = document.createElement('li');

  if (restaurant.photograph) {
    const image = document.createElement('img');
    image.className = 'restaurant-img lozad';
    image.alt = restaurant.name;
    image.dataset.src = DbHelper.imageUrlForRestaurant(restaurant);
    image.dataset.srcset = DbHelper.imageSrcsetForRestaurant(restaurant);
    image.sizes = '(min-width: 1024px) 33vw, 100vw';
    li.append(image);
  }

  const restaurantInfo = document.createElement('div');
  restaurantInfo.className = 'restaurant-info';

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  restaurantInfo.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  restaurantInfo.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  restaurantInfo.append(address);

  const controls = document.createElement('div');
  controls.className = 'controls';

  const more = document.createElement('a');
  more.className = 'btn btn-block';
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', `View details about ${restaurant.name}`);
  more.href = DbHelper.urlForRestaurant(restaurant);
  controls.append(more);

  const favorateBtn = document.createElement('button');
  favorateBtn.className = 'btn btn-block favorite-btn';
  favorateBtn.innerHTML = 'Add to favorites';
  updateFavoriteBtnUI(favorateBtn, restaurant.is_favorite);
  favorateBtn.addEventListener('click', e => toggleFavoriteBtn(e, restaurant.id));
  controls.append(favorateBtn);

  restaurantInfo.append(controls);

  li.append(restaurantInfo);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = restaurants => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DbHelper.mapMarkerForRestaurant(restaurant, getMap());
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    markers.push(marker);
  });
};
