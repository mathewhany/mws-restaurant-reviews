// Add service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Skip link
document.querySelector('.skip-link').addEventListener('click', () => {
  document.getElementById('maincontent').focus();
});