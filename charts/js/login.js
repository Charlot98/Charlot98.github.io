(function () {
  var VALID_USER = 'cauvet';
  var VALID_PASS = 'cauvet';
  var STORAGE_KEY = 'dash_auth_token';
  var MIN_LOADING_MS = 700;
  var loadingShown = false;
  var navigating = false;

  function $(id) { return document.getElementById(id); }
  function setError(msg) { $('error').textContent = msg || ''; }
  function showLoading() {
    if (loadingShown) return;
    loadingShown = true;
    var overlay = document.createElement('div');
    overlay.className = 'page-loading-overlay show';
    overlay.innerHTML = '<div class="page-loading-spinner" aria-hidden="true"></div>';
    document.body.appendChild(overlay);
  }

  function redirectWithLoading(url, useReplace) {
    if (navigating) return;
    navigating = true;
    showLoading();
    window.setTimeout(function () {
      if (useReplace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    }, MIN_LOADING_MS);
  }

  function handleLogin() {
    var u = $('username').value.trim();
    var p = $('password').value;
    if (!u || !p) {
      setError('请输入账号和密码');
      return;
    }
    if (u !== VALID_USER || p !== VALID_PASS) {
      setError('账号或密码错误');
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, 'logged_in'); } catch (e) {}
    redirectWithLoading('index.html', false);
  }

  $('login-btn').addEventListener('click', handleLogin);
  $('password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleLogin();
  });

  try {
    if (localStorage.getItem(STORAGE_KEY) === 'logged_in') {
      redirectWithLoading('index.html', true);
    }
  } catch (e) {}
})();
