const runPostponedActions = () => {
  const actions = getPostponedActions();
  localStorage.setItem('offline_actions', '');
  actions.forEach(action => {
    runOrPostpone(action);
  });
};

const getPostponedActions = () =>
  JSON.parse(localStorage.getItem('offline_actions') || '[]');

const postpone = action => {
  localStorage.setItem(
    'offline_actions',
    JSON.stringify(getPostponedActions().concat(action))
  );
};

export const runOrPostpone = action => {
  if (navigator.onLine) {
    console.log('Running: ', action);
    return fetch(action.url, action.options);
  } else {
    console.log('Postponing: ', action);
    postpone(action);
    return Promise.resolve();
  }
};

window.addEventListener('online', runPostponedActions);
