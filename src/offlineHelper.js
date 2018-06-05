const runPostponedRequests = () => {
  const requests = getPostponedRequests();
  localStorage.setItem('postponed_requests', '');
  requests.forEach(request => {
    fetchOrPostpone(request.url, request.options);
  });
};

const getPostponedRequests = () =>
  JSON.parse(localStorage.getItem('postponed_requests') || '[]');

const postponeRequest = (url, options) => {
  const request = { url, options };

  localStorage.setItem(
    'offline_actions',
    JSON.stringify(getPostponedRequests().concat(request))
  );
};

export const fetchOrPostpone = (url, options) => {
  if (navigator.onLine) {
    console.log(`Offline Helper: Running fetch for '${url}'`);
    return fetch(url, options);
  } else {
    console.log(`Offline Helper: Postponing fetch for '${url}'`);
    postponeRequest(url, options);
    return Promise.resolve();
  }
};

window.addEventListener('online', runPostponedRequests);
