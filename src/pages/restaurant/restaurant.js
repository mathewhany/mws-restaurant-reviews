import timeago from 'timeago.js';
import {
  loadDynamicMapOnClick,
  updateFavoriteBtnUI,
  toggleFavoriteBtn,
} from '~/pages/common/js';
import * as DbHelper from '~/dbHelper';
import './restaurant.scss';

const favoriteBtn = document.querySelector('.favorite-btn');

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

    favoriteBtn.addEventListener('click', (e) =>
      toggleFavoriteBtn(e, restaurant.id)
    );

    const addReviewForm = document.getElementById('add-review-form');

    addReviewForm.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(addReviewForm);
      formData.append('restaurant_id', restaurant.id);

      let reviewData = {};
      let errors = [];

      formData.forEach((val, key) => {
        if (val.trim() == '') {
          errors.push(`The field '${key}' is required!`);
          return;
        }

        reviewData[key] = val;
      });

      const formMsg = document.getElementById('form-msg');

      if (errors.length == 0) {
        DbHelper.addReview(reviewData).then(() => {
          formMsg.style.display = 'block';
          formMsg.classList.remove('error');
          formMsg.innerHTML = navigator.onLine
            ? 'Your review was published succesfully'
            : 'Your review will be published when you are back online!';
          addReviewToList(reviewData);
          addReviewForm.reset();
        });
      } else {
        formMsg.classList.add('error');
        formMsg.innerHTML = errors.join('<br>');
        formMsg.style.display = 'block';
      }
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

  updateFavoriteBtnUI(favoriteBtn, restaurant.is_favorite);

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
  reviews.forEach(addReviewToList);
};

const addReviewToList = review => {
  document.getElementById('reviews-list').appendChild(createReviewHTML(review));
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li');

  const reviewCard = document.createElement('div');
  reviewCard.className = 'card';
  li.appendChild(reviewCard);

  const header = document.createElement('div');
  header.className = 'card-header';
  reviewCard.appendChild(header);

  const name = document.createElement('span');
  name.innerHTML = review.name;
  name.className = 'review-user';
  header.appendChild(name);

  const date = document.createElement('span');
  date.innerHTML = timeago().format(review.createdAt);
  date.className = 'review-date';
  header.appendChild(date);

  const body = document.createElement('div');
  body.className = 'card-body';
  reviewCard.appendChild(body);

  const rating = document.createElement('div');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  body.appendChild(rating);

  const comments = document.createElement('div');
  comments.innerHTML = review.comments;
  body.appendChild(comments);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-block delete-btn';
  deleteBtn.innerHTML = 'Delete review';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you wnat to delete this review?')) {
      DbHelper.removeReview(review.id).then(() => {
        li.remove();
      });
    }
  });
  body.appendChild(deleteBtn);

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
