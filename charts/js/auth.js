(function () {
  var KEY = 'dash_auth_token';
  var MIN_LOADING_MS = 700;
  try {
    if (localStorage.getItem(KEY) !== 'logged_in') {
      window.location.replace('login.html');
      return;
    }
  } catch (e) {
    window.location.replace('login.html');
    return;
  }

  var overlay = null;
  var loadingShown = false;
  var navigating = false;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'page-loading-overlay';
    overlay.innerHTML = '<div class="page-loading-spinner" aria-hidden="true"></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function showLoading() {
    if (loadingShown) return;
    loadingShown = true;
    ensureOverlay().classList.add('show');
  }

  function navigateWithLoading(url) {
    if (navigating) return;
    navigating = true;
    showLoading();
    window.setTimeout(function () {
      window.location.href = url;
    }, MIN_LOADING_MS);
  }

  function shouldHandleLink(anchor, event) {
    if (!anchor) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;
    var href = anchor.getAttribute('href');
    if (!href || href.indexOf('javascript:') === 0) return false;
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
    if (url.href === window.location.href) return false;
    return true;
  }

  document.addEventListener('click', function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!shouldHandleLink(anchor, event)) return;
    event.preventDefault();
    navigateWithLoading(anchor.href);
  }, true);

  window.addEventListener('beforeunload', function () {
    showLoading();
  });
})();
