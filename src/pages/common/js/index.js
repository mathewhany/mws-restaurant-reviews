import OfflinePluginRuntime from 'offline-plugin/runtime';

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
