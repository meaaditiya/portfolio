let nav = null;

export const setFetchNavigator = (navigate) => {
  nav = navigate;
};

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const res = await originalFetch(...args);

  if (res.status === 403 && nav) {
    if (window.location.pathname !== "/forbidden") {
      nav("/forbidden");
    }
  }

  return res;
};
