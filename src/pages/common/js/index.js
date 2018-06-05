import OfflinePluginRuntime from 'offline-plugin/runtime';
import { favoriteRestaurant, unfavoriteRestaurant } from '~/dbHelper';

OfflinePluginRuntime.install();

// Google API Key
const API_KEY = 'AIzaSyAfq2JieqMA02OWW2fwvqVxONbJsubDWD0';

const loadScript = url => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// The static map is used as a fallback as it is just
// a simple image that could be cached easily.
const staticMap = document.getElementById('static-map');

// The dynamic map replaces the static map when possible.
const dynamicMap = document.getElementById('dynamic-map');

let map;

export const loadDynamicMapOnClick = callback => {
  document.getElementById('map-container').addEventListener('click', () => {
    loadDynamicMap()
      .then(map => {
        if (map) callback(map);
      })
      .catch(console.error);
  });
};

const loadDynamicMap = () => {
  if (map) {
    return Promise.resolve();
  }

  return loadScript(
    `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
  ).then(() => {
    staticMap.style.display = 'none';
    dynamicMap.style.display = 'block';

    map = new google.maps.Map(document.getElementById('dynamic-map'), {
      scrollwheel: false,
    });

    return map;
  });
};

export const getMap = () => map;

const offlineError = document.getElementById('offline-error');

if (!navigator.onLine) {
  offlineError.classList.add('shown');
}

window.addEventListener('offline', () => {
  offlineError.classList.add('shown');
});

window.addEventListener('online', () => {
  offlineError.classList.remove('shown');
});

export const updateFavoriteBtnUI = (el, isFavorite) => {
  if (isFavorite) {
    el.classList.add('active');
    el.innerHTML = 'Remove from favorites';
  } else {
    el.classList.remove('active');
    el.innerHTML = 'Add to favorites';
  }
};

export const toggleFavoriteBtn = (e, id) => {
  let isFavorite = e.target.classList.contains('active');

  const promise = isFavorite
    ? unfavoriteRestaurant(id)
    : favoriteRestaurant(id);

  return promise
    .then(() => {
      isFavorite = !isFavorite;
      updateFavoriteBtnUI(e.target, isFavorite);
    });
};
