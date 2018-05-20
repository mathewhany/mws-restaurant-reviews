import OfflinePluginRuntime from 'offline-plugin/runtime';

OfflinePluginRuntime.install({
  // onUpdateReady() {
  //   OfflinePluginRuntime.applyUpdate();
  // },
  // onUpdated() {
  //   window.location.reload();
  // },
});

// The static map is used as a fallback as it is just
// a simple image that could be cached easily.
const staticMap = document.getElementById('static-map');

// The dynamic map replaces the static map when possible.
const dynamicMap = document.getElementById('dynamic-map');

// To prevent maps from reloading on every click.
let mapLoaded = false;

// Only load the full Google Maps when the user interact with it.
document.getElementById('map-container').addEventListener('click', () => {
  if (!mapLoaded) {
    mapLoaded = true;
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyAfq2JieqMA02OWW2fwvqVxONbJsubDWD0&libraries=places';
    script.onload = () => {
      staticMap.style.display = 'none';
      dynamicMap.style.display = 'block';
      window.initMap();
    };
    document.body.appendChild(script);
  }
});
