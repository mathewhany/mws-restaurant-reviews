import timeago from 'timeago.js';
import { loadDynamicMapOnClick } from '~/pages/common/js';
import * as DbHelper from '~/dbHelper';
import './restaurant.scss';

document.addEventListener('DOMContentLoaded', () => {
  fetchRestaurantFromURL().then(restaurant => {
    fillRestaurantHTML(restaurant);
    loadStaticMap(restaurant);
    fillBreadcrumb(restaurant);

    loadDynamicMapOnClick(map => {
      map.setZoom(16);
      map.setCenter(restaurant.latlng);
      DbHelper.mapMarkerForRestaurant(restaurant, map);
    });
  });
});

/**
 * Loads the static map.
 */
const loadStaticMap = restaurant => {
  const latlng = Object.values(restaurant.latlng).join(',');
  const staticMap = document.getElementById('static-map');
  staticMap.src =
    'https://maps.googleapis.com/maps/api/staticmap?' +
    `center=${latlng}&` +
    `markers=color:red|${latlng}&` +
    'zoom=16&size=640x400&format=jpg&' +
    'key=AIzaSyAfq2JieqMA02OWW2fwvqVxONbJsubDWD0';
  staticMap.alt = `Map for ${restaurant.name}`;
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = () => {
  const id = getParameterByName('id');

  if (!id) {
    // No id found in URL.
    Promise.reject('No restaurant id in URL');
    return;
  }

  return DbHelper.fetchRestaurantAndReviewsById(id).catch(console.error);
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = restaurant => {
  const name = document.getElementById('restaurant-name');
  name.insertAdjacentText('afterbegin', restaurant.name);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DbHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }

  fillReviewsHTML(restaurant.reviews);
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = operatingHours => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = reviews => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const reviewContainer = document.createElement('div');
  reviewContainer.className = 'review-container';

  const name = document.createElement('span');
  name.innerHTML = review.name;
  name.className = 'review-user';

  const date = document.createElement('span');
  date.innerHTML = timeago().format(review.createdAt);
  date.className = 'review-date';

  const reviewHeader = document.createElement('div');
  reviewHeader.className = 'review-header';
  reviewHeader.appendChild(name);
  reviewHeader.appendChild(date);
  reviewContainer.appendChild(reviewHeader);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  reviewContainer.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-content';
  reviewContainer.appendChild(comments);

  const li = document.createElement('li');
  li.appendChild(reviewContainer);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = restaurant => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = '#';
  a.setAttribute('aria-current', 'page');
  a.innerHTML = restaurant.name;
  li.appendChild(a);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
