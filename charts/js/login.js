(function () {
  var VALID_USER = 'cauvet';
  var VALID_PASS = 'cauvet';
  var STORAGE_KEY = 'dash_auth_token';

  function $(id) { return document.getElementById(id); }
  function setError(msg) { $('error').textContent = msg || ''; }

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
    window.location.href = 'dashboard.html';
  }

  $('login-btn').addEventListener('click', handleLogin);
  $('password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleLogin();
  });

  try {
    if (localStorage.getItem(STORAGE_KEY) === 'logged_in') {
      window.location.replace('dashboard.html');
    }
  } catch (e) {}
})();
